-- Create a function to confirm user emails
create or replace function public.confirm_user_email(user_email text)
returns void as $$
begin
  update auth.users
  set email_confirmed_at = now(),
      confirmed_at = now()
  where email = user_email;
end;
$$ language plpgsql security definer; 