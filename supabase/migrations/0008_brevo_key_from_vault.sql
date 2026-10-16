-- Lets the email-analytics edge function read the Brevo API key from Supabase Vault
-- when the BREVO_API_KEY function secret isn't set. The key itself is stored with
-- vault.create_secret(..., 'brevo_api_key') outside of migrations so it never lands in git.

create or replace function public.get_brevo_api_key()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'brevo_api_key' limit 1;
$$;

revoke all on function public.get_brevo_api_key() from public, anon, authenticated;
grant execute on function public.get_brevo_api_key() to service_role;
