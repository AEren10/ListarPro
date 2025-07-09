-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow guest read access" ON shops;
DROP POLICY IF EXISTS "Allow authenticated read access" ON shops;
DROP POLICY IF EXISTS "Allow authenticated users to create shops" ON shops;
DROP POLICY IF EXISTS "Allow owners to update their shops" ON shops;
DROP POLICY IF EXISTS "Allow owners to delete their shops" ON shops;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert shops" ON shops;
DROP POLICY IF EXISTS "Users can view shops" ON shops;
DROP POLICY IF EXISTS "Users can update their own shops" ON shops;
DROP POLICY IF EXISTS "Users can delete their own shops" ON shops;
DROP POLICY IF EXISTS "Enable read access for all users" ON shops;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Enable RLS on both tables
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON shops TO anon;
GRANT SELECT ON shops TO authenticated;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;

-- Simple read-all policy for shops (available to everyone including guests)
CREATE POLICY "Enable read access for all users" ON shops FOR SELECT USING (true);

-- Profile policies
-- 1. Allow users to see their own profile
-- 2. Allow users to see profiles of shop owners
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (
    id = auth.uid() -- User can see their own profile
    OR 
    id IN ( -- User can see profiles of shop owners
        SELECT user_id FROM shops
    )
);

-- Allow authenticated users to create shops
CREATE POLICY "Enable insert for authenticated users only" ON shops FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own shops
CREATE POLICY "Enable update for users based on user_id" ON shops FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own shops
CREATE POLICY "Enable delete for users based on user_id" ON shops FOR DELETE 
USING (auth.uid() = user_id);

-- Allow users to update their own profiles
CREATE POLICY "Enable update for users based on id" ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Add role column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Update the trigger for new user creation with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (NEW.id, NEW.email, NEW.email, 'user');
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: % - %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 