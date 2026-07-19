# Supabase finance integration

## 1. Run the SQL
Run the contents of [src/lib/supabase/schema.sql](../src/lib/supabase/schema.sql) in the Supabase SQL editor.

## 2. Configure environment variables
Set these in your Next.js environment:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## 3. Frontend usage
Import the helpers from [src/lib/supabase/finance.ts](../src/lib/supabase/finance.ts) inside any bingo component:

```ts
import { applyGameWin, requestWithdrawal, approveWithdrawal } from '@/lib/supabase/finance';

await applyGameWin(userId, referrerId, 100);
await requestWithdrawal(userId, 25, 'Cashout');
await approveWithdrawal(transactionId, adminId);
```

## 4. Security notes
- The frontend never calculates balances or writes financial rows directly.
- All balance changes happen inside security-definer RPCs in Supabase.
- Use Supabase RLS plus admin-only claims on JWT metadata.
- For stronger protection, place sensitive workflows behind Supabase Edge Functions and call them from the frontend.
