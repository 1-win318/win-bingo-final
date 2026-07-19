create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  balance numeric(12,2) not null default 0,
  referrer_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('deposit', 'win', 'bonus', 'withdrawal')),
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'completed' check (status in ('pending', 'completed', 'rejected', 'cancelled')),
  description text,
  referrer_id uuid references public.profiles(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, balance)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 0)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.apply_signup_bonus(p_user_id uuid, p_bonus_amount numeric default 10)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_transaction_id uuid;
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  if p_bonus_amount <= 0 then
    raise exception 'Bonus amount must be greater than zero';
  end if;

  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  update public.profiles
  set balance = balance + p_bonus_amount,
      updated_at = now()
  where id = p_user_id;

  insert into public.transactions (user_id, type, amount, status, description)
  values (p_user_id, 'bonus', p_bonus_amount, 'completed', 'Sign-up bonus')
  returning id into v_transaction_id;

  return jsonb_build_object(
    'success', true,
    'balance', (select balance from public.profiles where id = p_user_id),
    'transaction_id', v_transaction_id
  );
end;
$$;

create or replace function public.apply_game_win(p_winner_id uuid, p_referrer_id uuid default null, p_amount numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_winner_share numeric := p_amount * 0.8;
  v_referrer_share numeric := p_amount * 0.2;
  v_winner transaction%rowtype;
  v_referrer transaction%rowtype;
begin
  if p_winner_id is null then
    raise exception 'Winner id is required';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  update public.profiles
  set balance = balance + v_winner_share,
      updated_at = now()
  where id = p_winner_id;

  if p_referrer_id is not null then
    update public.profiles
    set balance = balance + v_referrer_share,
        updated_at = now()
    where id = p_referrer_id;
  end if;

  insert into public.transactions (user_id, type, amount, status, description, referrer_id)
  values (p_winner_id, 'win', v_winner_share, 'completed', 'Game win payout', p_referrer_id);

  if p_referrer_id is not null then
    insert into public.transactions (user_id, type, amount, status, description, referrer_id)
    values (p_referrer_id, 'bonus', v_referrer_share, 'completed', 'Referral win share', p_winner_id);
  end if;

  return jsonb_build_object(
    'winner_share', v_winner_share,
    'referrer_share', v_referrer_share,
    'winner_id', p_winner_id,
    'referrer_id', p_referrer_id
  );
end;
$$;

create or replace function public.request_withdrawal(p_user_id uuid, p_amount numeric, p_description text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_transaction_id uuid;
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  if p_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero';
  end if;

  select balance into v_balance
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  update public.profiles
  set balance = balance - p_amount,
      updated_at = now()
  where id = p_user_id;

  insert into public.transactions (user_id, type, amount, status, description)
  values (p_user_id, 'withdrawal', p_amount, 'pending', p_description)
  returning id into v_transaction_id;

  return jsonb_build_object('transaction_id', v_transaction_id);
end;
$$;

create or replace function public.approve_withdrawal(p_transaction_id uuid, p_admin_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx record;
begin
  select * into v_tx
  from public.transactions
  where id = p_transaction_id
  for update;

  if not found then
    raise exception 'Transaction not found';
  end if;

  if v_tx.status <> 'pending' then
    raise exception 'Only pending withdrawals can be approved';
  end if;

  update public.transactions
  set status = 'completed', reviewed_by = p_admin_id, description = coalesce(description, 'withdrawal')
  where id = p_transaction_id;

  return jsonb_build_object('transaction_id', p_transaction_id, 'status', 'completed');
end;
$$;

create or replace function public.reject_withdrawal(p_transaction_id uuid, p_admin_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx record;
  v_balance numeric;
begin
  select * into v_tx
  from public.transactions
  where id = p_transaction_id
  for update;

  if not found then
    raise exception 'Transaction not found';
  end if;

  if v_tx.status <> 'pending' then
    raise exception 'Only pending withdrawals can be rejected';
  end if;

  select balance into v_balance
  from public.profiles
  where id = v_tx.user_id
  for update;

  update public.profiles
  set balance = balance + v_tx.amount,
      updated_at = now()
  where id = v_tx.user_id;

  update public.transactions
  set status = 'rejected', reviewed_by = p_admin_id
  where id = p_transaction_id;

  return jsonb_build_object('transaction_id', p_transaction_id, 'status', 'rejected');
end;
$$;

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_all"
  on public.profiles for all
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false));

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_admin_all"
  on public.transactions for all
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false));
