ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, fullname, username, role, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'fullname', 
    new.raw_user_meta_data->>'username', 
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
