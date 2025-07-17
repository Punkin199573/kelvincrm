-- Create admin user and set up proper authentication
-- This will be run after the user signs up through the auth system

-- First, let's make sure we have the admin user in auth.users
-- This needs to be done through the Supabase dashboard or auth API

-- Update the profiles table to set admin status
UPDATE profiles 
SET 
  is_admin = true,
  tier = 'avalanche_backstage',
  subscription_status = 'active',
  updated_at = now()
WHERE email = 'cloudyzaddy@gmail.com';

-- If the profile doesn't exist, we'll create it
-- This assumes the user has already signed up through the normal flow
INSERT INTO profiles (
  id,
  email,
  full_name,
  tier,
  subscription_status,
  is_admin,
  created_at,
  updated_at
)
SELECT 
  auth.users.id,
  'cloudyzaddy@gmail.com',
  'Admin User',
  'avalanche_backstage',
  'active',
  true,
  now(),
  now()
FROM auth.users 
WHERE auth.users.email = 'cloudyzaddy@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  tier = 'avalanche_backstage',
  subscription_status = 'active',
  updated_at = now();

-- Grant admin access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
