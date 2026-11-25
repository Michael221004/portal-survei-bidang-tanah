-- Portal Survei & Pemetaan Bidang Tanah
-- Jalankan seluruh skrip ini di Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.survey_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  respondent_name text not null,
  phone text,
  address text not null,
  land_address text not null,
  land_use text,
  latitude double precision,
  longitude double precision,
  land_area numeric,
  notes text,
  constraint latitude_range check (latitude is null or latitude between -90 and 90),
  constraint longitude_range check (longitude is null or longitude between -180 and 180),
  constraint land_area_positive check (land_area is null or land_area >= 0)
);

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  viewed_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin'))
);

alter table public.survey_submissions enable row level security;
alter table public.page_views enable row level security;
alter table public.user_roles enable row level security;

-- Publik hanya boleh mengirim formulir; tidak dapat membaca data responden.
drop policy if exists "public can submit survey" on public.survey_submissions;
create policy "public can submit survey" on public.survey_submissions
for insert to anon, authenticated
with check (
  length(trim(respondent_name)) between 2 and 120
  and length(trim(address)) between 2 and 500
  and length(trim(land_address)) between 2 and 700
  and (phone is null or length(phone) <= 30)
  and (notes is null or length(notes) <= 1500)
);

-- Admin dapat membaca seluruh isian. Role dicek dari tabel user_roles.
drop policy if exists "admins can read submissions" on public.survey_submissions;
create policy "admins can read submissions" on public.survey_submissions
for select to authenticated
using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "admins can read roles" on public.user_roles;
create policy "admins can read roles" on public.user_roles
for select to authenticated using (user_id = auth.uid());

-- Fungsi pencatatan kunjungan. Hanya menghitung, tidak menyimpan IP atau identitas pengunjung.
create or replace function public.record_page_view()
returns void language plpgsql security definer set search_path = public
as $$ begin insert into public.page_views default values; end; $$;

create or replace function public.public_survey_stats()
returns table(visitor_count bigint, submission_count bigint)
language sql security definer set search_path = public
as $$ select (select count(*) from public.page_views), (select count(*) from public.survey_submissions); $$;

create or replace function public.admin_survey_stats()
returns table(visitor_count bigint, submission_count bigint)
language sql security definer set search_path = public
as $$ select (select count(*) from public.page_views), (select count(*) from public.survey_submissions)
where exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'); $$;

revoke all on function public.record_page_view() from public;
grant execute on function public.record_page_view() to anon, authenticated;
revoke all on function public.public_survey_stats() from public;
grant execute on function public.public_survey_stats() to anon, authenticated;
revoke all on function public.admin_survey_stats() from public;
grant execute on function public.admin_survey_stats() to authenticated;

grant insert on public.survey_submissions to anon, authenticated;
grant select on public.survey_submissions to authenticated;
grant select on public.user_roles to authenticated;
