import { createSupabaseClient } from './client';

export type ProfileRow = {
  id: string;
  full_name: string | null;
  balance: number;
  referrer_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type TransactionRow = {
  id: string;
  user_id: string;
  type: 'deposit' | 'win' | 'bonus' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  description: string | null;
  referrer_id: string | null;
  reviewed_by: string | null;
  created_at: string;
};

function getClient() {
  return createSupabaseClient();
}

async function invokeRpc<T>(name: string, params: Record<string, unknown>) {
  const client = getClient();
  if (!client) {
    return { data: null as T | null, error: new Error('Supabase client is not configured') };
  }

  const { data, error } = await client.rpc(name, params);
  return { data: data as T | null, error: error as Error | null };
}

export async function getProfile(userId: string) {
  const client = getClient();
  if (!client) {
    return { data: null as ProfileRow | null, error: new Error('Supabase client is not configured') };
  }

  return client.from('profiles').select('*').eq('id', userId).single();
}

export async function getPendingWithdrawals() {
  const client = getClient();
  if (!client) {
    return { data: [] as TransactionRow[], error: new Error('Supabase client is not configured') };
  }

  return client.from('transactions').select('*').eq('type', 'withdrawal').eq('status', 'pending').order('created_at', { ascending: true });
}

export async function applySignupBonus(userId: string, bonusAmount = 10) {
  return invokeRpc<{ success: boolean; balance: number; transaction_id: string }>('apply_signup_bonus', {
    p_user_id: userId,
    p_bonus_amount: bonusAmount,
  });
}

export async function applyGameWin(winnerId: string, referrerId: string | null, amount: number) {
  return invokeRpc<{ winner_share: number; referrer_share: number; winner_id: string; referrer_id: string | null }>('apply_game_win', {
    p_winner_id: winnerId,
    p_referrer_id: referrerId,
    p_amount: amount,
  });
}

export async function requestWithdrawal(userId: string, amount: number, description?: string) {
  return invokeRpc<{ transaction_id: string }>('request_withdrawal', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description ?? null,
  });
}

export async function approveWithdrawal(transactionId: string, adminId?: string) {
  return invokeRpc<{ transaction_id: string; status: string }>('approve_withdrawal', {
    p_transaction_id: transactionId,
    p_admin_id: adminId ?? null,
  });
}

export async function rejectWithdrawal(transactionId: string, adminId?: string) {
  return invokeRpc<{ transaction_id: string; status: string }>('reject_withdrawal', {
    p_transaction_id: transactionId,
    p_admin_id: adminId ?? null,
  });
}
