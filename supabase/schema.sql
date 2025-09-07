<<<<<<< HEAD
-- Images for dues: columns, storage bucket, and RLS policies (idempotent)

-- 1) Add columns on public.dues
alter table public.dues
  add column if not exists image_url text,
  add column if not exists image_alt text;

-- 2) Create storage bucket for dues images (safe to re-run)
do $$ begin
  perform 1 from storage.buckets where id = 'dues-images';
  if not found then
    insert into storage.buckets (id, name, public) values ('dues-images', 'dues-images', true);
  end if;
end $$;

-- 3) Storage policies for bucket "dues-images"
-- Allow anyone to read (public bucket)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'dues_images_read'
  ) then
    create policy "dues_images_read" on storage.objects
      for select using (
        bucket_id = 'dues-images'
      );
  end if;
end $$;

-- Only authenticated users can upload; require admins if you want stricter control
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'dues_images_insert_auth'
  ) then
    create policy "dues_images_insert_auth" on storage.objects
      for insert with check (
        bucket_id = 'dues-images' and auth.role() = 'authenticated'
      );
  end if;
end $$;

-- Allow owners to update/delete their own uploads (optional)
-- Uses metadata.owner = auth.uid() pattern; skip if not using metadata
-- Uncomment and adapt if needed
-- do $$ begin
--   if not exists (
--     select 1 from pg_policies
--     where schemaname = 'storage' and tablename = 'objects' and policyname = 'dues_images_update_owner'
--   ) then
--     create policy "dues_images_update_owner" on storage.objects
--       for update using (bucket_id = 'dues-images')
--       with check (bucket_id = 'dues-images');
--   end if;
-- end $$;

=======
>>>>>>> master
-- Enable extensions
create extension if not exists pgcrypto;

-- profiles table: one row per auth user
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	name text,
	student_id text unique,
	is_admin boolean default false,
<<<<<<< HEAD
	pending_admin boolean default false,
=======
>>>>>>> master
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

<<<<<<< HEAD
-- profiles: allow admins to read all profiles (needed for payment lists)
create policy if not exists "profiles_select_admins" on public.profiles
	for select using (
		exists (
			select 1 from public.profiles p
			where p.id = auth.uid() and coalesce(p.is_admin, false) = true
		)
	);

=======
>>>>>>> master
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

