\set ON_ERROR_STOP on

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator login noinherit;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login noinherit createrole createdb;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    create role supabase_admin login noinherit superuser createdb createrole replication bypassrls;
  end if;
end
$$;

select format(
  'alter role authenticator with login noinherit password %L',
  :'postgres_password'
) \gexec

select format(
  'alter role supabase_auth_admin with login noinherit createrole createdb password %L',
  :'postgres_password'
) \gexec

select format(
  'alter role supabase_admin with login noinherit superuser createdb createrole replication bypassrls password %L',
  :'postgres_password'
) \gexec

grant anon to authenticator;
grant authenticated to authenticator;
grant service_role to authenticator;

grant usage on schema public to anon, authenticated, service_role;

select format(
  'alter database %I set "app.settings.jwt_secret" to %L',
  current_database(),
  :'jwt_secret'
) \gexec

select format(
  'alter database %I set "app.settings.jwt_exp" to %L',
  current_database(),
  :'jwt_exp'
) \gexec
