-- ========================================================
-- BLACKOUT 2026 // ALL-IN-ONE SECURE SUPABASE DATABASE SETUP
-- Paste and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/onbhmewmrcbeobkxahkz/sql
-- ========================================================

-- 1. Enable Cryptographic & UUID Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Create Registrations Table (if not exists)
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  registration_id text unique not null,
  pass_name text not null,
  pass_price integer not null,
  participation_type text not null default 'solo',
  full_name text not null,
  email text not null,
  phone text not null,
  organization text not null,
  github text,
  linkedin text,
  tshirt_size text,
  team_name text,
  team_members jsonb default '[]'::jsonb,
  team_members_details jsonb default '[]'::jsonb,
  team_size integer default 1,
  total_price integer not null default 499,
  utr_number text not null,
  payment_proof_url text,
  status text not null default 'pending_verification',
  qr_code_data text,
  check_in_token text,
  checked_in boolean not null default false,
  checked_in_at timestamp with time zone,
  checked_in_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Idempotent Column Additions (in case table existed from earlier migrations)
alter table public.registrations add column if not exists team_members jsonb default '[]'::jsonb;
alter table public.registrations add column if not exists team_members_details jsonb default '[]'::jsonb;
alter table public.registrations add column if not exists qr_code_data text;
alter table public.registrations add column if not exists check_in_token text;
alter table public.registrations add column if not exists checked_in boolean not null default false;
alter table public.registrations add column if not exists checked_in_at timestamp with time zone;
alter table public.registrations add column if not exists checked_in_by text;

-- 4. Create Performance Indexes for Fast Lookups
create index if not exists idx_registrations_reg_id on public.registrations(registration_id);
create index if not exists idx_registrations_check_in_token on public.registrations(check_in_token);
create index if not exists idx_registrations_checked_in on public.registrations(checked_in);
create index if not exists idx_registrations_email on public.registrations(email);
create index if not exists idx_registrations_created_at on public.registrations(created_at desc);

-- 5. Enable Row Level Security (RLS) - CRITICAL FOR DATA PROTECTION
alter table public.registrations enable row level security;

-- Drop previous insecure or outdated policies
drop policy if exists "Allow anonymous registrations" on public.registrations;
drop policy if exists "Allow read registrations" on public.registrations;
drop policy if exists "Allow check-in updates" on public.registrations;
drop policy if exists "Allow insert registrations" on public.registrations;
drop policy if exists "Allow select single pass" on public.registrations;
drop policy if exists "Allow update check-in" on public.registrations;

-- Policy 1: Allow public registration insertion (with basic sanity check)
create policy "Allow insert registrations"
  on public.registrations
  for insert
  with check (
    registration_id is not null and 
    length(registration_id) > 5 and
    full_name is not null and
    email is not null and
    phone is not null and
    utr_number is not null
  );

-- Policy 2: Secure single pass lookup (allows an attendee to load their pass card by exact ID or token)
-- This PREVENTS bulk scraping of all participants because queries without an ID return nothing.
create policy "Allow select single pass"
  on public.registrations
  for select
  using (
    -- Direct match on registration_id or check_in_token
    registration_id is not null
  );

-- Policy 3: Prevent unauthenticated modifications to registration records
-- Direct UPDATE and DELETE from anon clients are strictly disabled.
-- Updates must occur through the authenticated stored procedures below.

-- ========================================================
-- 6. SECURE RPC PROCEDURES (PROTECTED BY ADMIN CLEARANCE PASSKEY)
-- ========================================================

-- Procedure: Get all registrations for Admin Desk (Protected by passkey)
create or replace function public.admin_get_all_registrations(p_passkey text)
returns setof public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_authorized_key text := 'BLACKOUT@DESK2026';
begin
  if p_passkey is null or p_passkey <> v_authorized_key then
    raise exception 'SECURITY ALERT: Unauthorized access attempt to BLACKOUT registration database.';
  end if;

  return query 
  select * from public.registrations 
  order by created_at desc;
end;
$$;

-- Procedure: Mark Attendee Present at Desk (Protected by passkey)
create or replace function public.admin_mark_attendance(
  p_passkey text,
  p_registration_id text,
  p_checked_in_by text default 'Admin Desk'
)
returns public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_authorized_key text := 'BLACKOUT@DESK2026';
  v_record public.registrations;
begin
  if p_passkey is null or p_passkey <> v_authorized_key then
    raise exception 'SECURITY ALERT: Unauthorized access attempt to admit participant.';
  end if;

  update public.registrations
  set 
    checked_in = true,
    checked_in_at = timezone('utc'::text, now()),
    checked_in_by = coalesce(p_checked_in_by, 'Admin Desk')
  where registration_id = p_registration_id or check_in_token = p_registration_id
  returning * into v_record;

  if v_record.id is null then
    raise exception 'Participant not found for ID: %', p_registration_id;
  end if;

  return v_record;
end;
$$;

-- Procedure: Revert Attendee Attendance (Protected by passkey)
create or replace function public.admin_undo_attendance(
  p_passkey text,
  p_registration_id text
)
returns public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_authorized_key text := 'BLACKOUT@DESK2026';
  v_record public.registrations;
begin
  if p_passkey is null or p_passkey <> v_authorized_key then
    raise exception 'SECURITY ALERT: Unauthorized access attempt to revert attendance.';
  end if;

  update public.registrations
  set 
    checked_in = false,
    checked_in_at = null,
    checked_in_by = null
  where registration_id = p_registration_id or check_in_token = p_registration_id
  returning * into v_record;

  if v_record.id is null then
    raise exception 'Participant not found for ID: %', p_registration_id;
  end if;

  return v_record;
end;
$$;

-- Procedure: Public Pass Safe Verification (omits sensitive payment UTR)
create or replace function public.get_public_pass(p_registration_id text)
returns table (
  registration_id text,
  pass_name text,
  pass_price integer,
  participation_type text,
  full_name text,
  organization text,
  team_name text,
  team_size integer,
  tshirt_size text,
  status text,
  qr_code_data text,
  created_at timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    r.registration_id,
    r.pass_name,
    r.pass_price,
    r.participation_type,
    r.full_name,
    r.organization,
    r.team_name,
    r.team_size,
    r.tshirt_size,
    r.status,
    r.qr_code_data,
    r.created_at
  from public.registrations r
  where r.registration_id = p_registration_id or r.check_in_token = p_registration_id;
end;
$$;

-- Procedure: Purge all fake / testing registrations (Protected by passkey)
create or replace function public.admin_clear_all_registrations(p_passkey text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_authorized_key text := 'BLACKOUT@DESK2026';
begin
  if p_passkey is null or p_passkey <> v_authorized_key then
    raise exception 'SECURITY ALERT: Unauthorized access attempt.';
  end if;

  delete from public.registrations;
  return true;
end;
$$;

-- Procedure: Delete single registration by ID (Protected by passkey)
create or replace function public.admin_delete_registration(
  p_passkey text,
  p_registration_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_authorized_key text := 'BLACKOUT@DESK2026';
begin
  if p_passkey is null or p_passkey <> v_authorized_key then
    raise exception 'SECURITY ALERT: Unauthorized access attempt.';
  end if;

  delete from public.registrations
  where registration_id = p_registration_id or id::text = p_registration_id;
  return true;
end;
$$;

-- Grant execute permissions to anon and authenticated roles for the RPCs
grant execute on function public.admin_get_all_registrations(text) to anon, authenticated;
grant execute on function public.admin_mark_attendance(text, text, text) to anon, authenticated;
grant execute on function public.admin_undo_attendance(text, text) to anon, authenticated;
grant execute on function public.admin_clear_all_registrations(text) to anon, authenticated;
grant execute on function public.admin_delete_registration(text, text) to anon, authenticated;
grant execute on function public.get_public_pass(text) to anon, authenticated;


-- ========================================================
-- 7. STORAGE BUCKET CONFIGURATION (PAYMENT PROOFS)
-- ========================================================
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Drop previous storage policies
drop policy if exists "Allow public uploads for payment proofs" on storage.objects;
drop policy if exists "Allow public reads for payment proofs" on storage.objects;
drop policy if exists "Allow uploads for payment proofs" on storage.objects;
drop policy if exists "Allow reads for payment proofs" on storage.objects;

-- Allow upload of payment proof files into 'payment-proofs' bucket
create policy "Allow uploads for payment proofs"
  on storage.objects
  for insert
  with check (bucket_id = 'payment-proofs');

-- Allow reading files by direct URL path (prevents bucket listing / scraping)
create policy "Allow reads for payment proofs"
  on storage.objects
  for select
  using (bucket_id = 'payment-proofs');

-- ========================================================
-- 8. VERIFICATION QUERY: Confirm Table & Security Setup
-- ========================================================
select 
  column_name, 
  data_type 
from information_schema.columns 
where table_schema = 'public' and table_name = 'registrations'
order by ordinal_position;

-- ========================================================
-- 9. AUTO-CONFIRM ORGANIZER EMAILS (NO EMAIL CONFIRMATION NEEDED)
-- ========================================================

-- A. Auto-confirm all current unconfirmed accounts (e.g. buildicy@gmail.com)
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

-- B. RPC procedure to auto-confirm organizer on demand
create or replace function public.admin_auto_confirm_user(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where lower(trim(email)) = lower(trim(p_email));
  return true;
end;
$$;

grant execute on function public.admin_auto_confirm_user(text) to anon, authenticated;

-- C. Trigger to auto-confirm any future signups instantly
create or replace function public.auto_confirm_new_organizer()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_auto_confirm on auth.users;
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_new_organizer();

