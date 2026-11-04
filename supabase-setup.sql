-- Run this once in Supabase: SQL Editor > New query > Run

create table if not exists settings (id int primary key default 1 check (id = 1), data jsonb not null default '{}');
insert into settings (id) values (1) on conflict do nothing;

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text not null, excerpt text, body text,
  author text, image text,
  featured boolean default false, published boolean default true,
  created_at timestamptz default now()
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null, created_at timestamptz default now()
);

alter table settings enable row level security;
alter table posts enable row level security;
alter table subscribers enable row level security;

-- Visitors: read settings and published posts, and subscribe
create policy "public read settings" on settings for select using (true);
create policy "public read published" on posts for select using (published = true);
create policy "public subscribe" on subscribers for insert with check (true);

-- Logged-in admins: full control
create policy "admin settings" on settings for all to authenticated using (true) with check (true);
create policy "admin posts" on posts for all to authenticated using (true) with check (true);
create policy "admin subscribers" on subscribers for all to authenticated using (true) with check (true);

-- Image storage
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "public view media" on storage.objects for select using (bucket_id = 'media');
create policy "admin upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "admin edit media" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id = 'media');

-- Facebook auto-posting (safe to run again on an existing database)
alter table posts add column if not exists fb_id text;
alter table posts add column if not exists fb_url text;
create unique index if not exists posts_fb_id_key on posts (fb_id);

-- ============================================================
-- Admin accounts with a NAME and PASSKEY (no email needed)
-- Safe to run again. Admins can then be added from Admin > Admins.
-- Names become a private sign-in id like "juan.dela.cruz@mindanaotech.app" (never emailed).
-- ============================================================
create extension if not exists pgcrypto with schema extensions;

-- Internal helper that creates the account. Not callable from the website.
create or replace function _make_admin(p_name text, p_pass text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
declare
  uid uuid := gen_random_uuid();
  slug text := btrim(regexp_replace(lower(btrim(p_name)), '[^a-z0-9]+', '.', 'g'), '.');
  em text;
begin
  if slug = '' then raise exception 'Please use letters or numbers in the name.'; end if;
  if length(coalesce(p_pass,'')) < 8 then raise exception 'The passkey must be at least 8 characters.'; end if;
  em := slug || '@mindanaotech.app';
  if exists (select 1 from auth.users where email = em) then raise exception 'That name is already taken (duplicate).'; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', em,
    crypt(p_pass, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', btrim(p_name)), now(), now(),
    '', '', '', '', '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', em, 'email_verified', true), 'email', now(), now(), now());
end $$;

-- Used by the control panel (only signed-in admins can call these)
create or replace function admin_create(p_name text, p_pass text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
begin
  if auth.uid() is null then raise exception 'Not allowed'; end if;
  perform _make_admin(p_name, p_pass);
end $$;

create or replace function admin_list()
returns table (id uuid, name text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not allowed'; end if;
  return query select u.id, coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email,'@',1)), u.created_at, u.last_sign_in_at
    from auth.users u order by u.created_at;
end $$;

create or replace function admin_set_passkey(p_id uuid, p_pass text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
begin
  if auth.uid() is null then raise exception 'Not allowed'; end if;
  if length(coalesce(p_pass,'')) < 8 then raise exception 'The passkey must be at least 8 characters.'; end if;
  update auth.users set encrypted_password = crypt(p_pass, gen_salt('bf')), updated_at = now() where id = p_id;
end $$;

create or replace function admin_delete(p_id uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not allowed'; end if;
  if p_id = auth.uid() then raise exception 'You cannot remove yourself.'; end if;
  if (select count(*) from auth.users) <= 1 then raise exception 'You cannot remove the last admin.'; end if;
  delete from auth.users where id = p_id;
end $$;

revoke all on function _make_admin(text,text) from public, anon, authenticated;
revoke all on function admin_create(text,text), admin_list(), admin_set_passkey(uuid,text), admin_delete(uuid) from public, anon;
grant execute on function admin_create(text,text), admin_list(), admin_set_passkey(uuid,text), admin_delete(uuid) to authenticated;

-- FIRST ADMIN (run once, change the values), then sign in at admin.html with that name and passkey:
-- select _make_admin('Your Name', 'a-strong-passkey');
