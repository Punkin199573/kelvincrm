-- Fix infinite recursion in profiles RLS policies
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable all access for admin users" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin policy that doesn't cause recursion - using the new admin email
CREATE POLICY "profiles_admin_all" ON profiles
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'punkin199573@gmail.com'
    );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update admin user email if it exists
UPDATE auth.users 
SET email = 'punkin199573@gmail.com' 
WHERE email = 'admin@kelvincreekman.com';

-- Update profile for admin user
UPDATE profiles 
SET email = 'punkin199573@gmail.com', is_admin = true 
WHERE email = 'admin@kelvincreekman.com';

-- Insert admin profile if it doesn't exist
INSERT INTO profiles (id, email, full_name, tier, subscription_status, is_admin, created_at, updated_at)
SELECT 
    auth.users.id,
    'punkin199573@gmail.com',
    'Admin User',
    'avalanche_backstage',
    'active',
    true,
    NOW(),
    NOW()
FROM auth.users 
WHERE auth.users.email = 'punkin199573@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'punkin199573@gmail.com'
);
