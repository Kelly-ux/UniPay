-- Standalone, idempotent SQL for production-grade payment tracking

-- 1) payment_intents table to track hosted checkout attempts
create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  tx_ref text not null,
  due_id uuid not null,
  auth_user_id uuid not null,
  academic_student_id text null,
  base_amount numeric not null,
  total_amount numeric not null,
  paid_amount numeric null,
  currency text not null default 'GHS',
  status text not null default 'PENDING',
  checkout_url text null,
  flw_tx_id text null,
  created_at timestamp with time zone not null default now()
);

-- helpful indexes
create unique index if not exists payment_intents_tx_ref_key on public.payment_intents (tx_ref);
create index if not exists payment_intents_user_idx on public.payment_intents (auth_user_id);
create index if not exists payment_intents_due_idx on public.payment_intents (due_id);

-- RLS: allow owners to manage their intents; service role (webhook) bypasses
alter table public.payment_intents enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='payment_intents' and policyname='select_own_intents'
  ) then
    create policy select_own_intents on public.payment_intents for select using (auth.uid() = auth_user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='payment_intents' and policyname='insert_own_intents'
  ) then
    create policy insert_own_intents on public.payment_intents for insert with check (auth.uid() = auth_user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='payment_intents' and policyname='update_own_intents'
  ) then
    create policy update_own_intents on public.payment_intents for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);
  end if;
end $$;

-- 2) Prevent duplicate payments per due/user pair using a unique index
create unique index if not exists payments_due_user_unique on public.payments (due_id, auth_user_id);

