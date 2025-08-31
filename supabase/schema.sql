-- Enable extensions
create extension if not exists pgcrypto;

-- profiles table: one row per auth user
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	name text,
	student_id text unique,
	is_admin boolean default false,
	pending_admin boolean default false,
	created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- dues table
create table if not exists public.dues (
	id uuid primary key default gen_random_uuid(),
	school text not null,
	department text not null,
	description text not null,
	amount numeric(12,2) not null,
	due_date date not null,
	payment_method_suggestion text,
	created_by uuid references auth.users(id) on delete set null,
	created_at timestamp with time zone default now()
);

create index if not exists idx_dues_department_school on public.dues(department, school);
alter table public.dues enable row level security;

-- payments table
create table if not exists public.payments (
	id uuid primary key default gen_random_uuid(),
	due_id uuid not null references public.dues(id) on delete cascade,
	auth_user_id uuid not null references auth.users(id) on delete cascade,
	student_id text,
	payment_date date not null default now(),
	created_at timestamp with time zone default now()
);

create index if not exists idx_payments_due_id on public.payments(due_id);
alter table public.payments enable row level security;

-- RLS policies
-- profiles: users can see and update their own profile
create policy if not exists "profiles_select_own" on public.profiles
	for select using (auth.uid() = id);

-- profiles: allow admins to read all profiles (needed for payment lists)
create policy if not exists "profiles_select_admins" on public.profiles
	for select using (
		exists (
			select 1 from public.profiles p
			where p.id = auth.uid() and coalesce(p.is_admin, false) = true
		)
	);

create policy if not exists "profiles_update_own" on public.profiles
	for update using (auth.uid() = id);

create policy if not exists "profiles_insert_self" on public.profiles
	for insert with check (auth.uid() = id);

-- dues: all authenticated users can read
create policy if not exists "dues_select_all" on public.dues
	for select using (auth.role() = 'authenticated');

-- dues: only admins can insert/update/delete
create policy if not exists "dues_write_admins" on public.dues
	for all using (
		exists (
			select 1 from public.profiles p
			where p.id = auth.uid() and coalesce(p.is_admin, false) = true
		)
	) with check (
		exists (
			select 1 from public.profiles p
			where p.id = auth.uid() and coalesce(p.is_admin, false) = true
		)
	);

-- payments: read own rows or all if admin
create policy if not exists "payments_select_own_or_admin" on public.payments
	for select using (
		auth.uid() = auth_user_id or exists (
			select 1 from public.profiles p where p.id = auth.uid() and coalesce(p.is_admin, false) = true
		)
	);

-- payments: insert only for self (auth_user_id must be caller)
create policy if not exists "payments_insert_self" on public.payments
	for insert with check (auth.uid() = auth_user_id);

