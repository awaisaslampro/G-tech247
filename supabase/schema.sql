create extension if not exists "pgcrypto";

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  position text not null,
  cover_letter text null,
  cv_path text not null,
  cv_file_name text not null,
  identity_document_path text not null,
  identity_document_file_name text not null,
  created_at timestamptz not null default now()
);

alter table public.applications add column if not exists identity_document_path text;
alter table public.applications add column if not exists identity_document_file_name text;

create index if not exists applications_created_at_idx on public.applications(created_at desc);
create index if not exists applications_position_idx on public.applications(position);
create index if not exists applications_email_idx on public.applications(email);

alter table public.applications enable row level security;

drop policy if exists "deny_public_read" on public.applications;
create policy "deny_public_read"
on public.applications
for select
to anon, authenticated
using (false);

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;
