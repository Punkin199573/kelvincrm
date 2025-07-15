-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS void AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- This would typically be done through the Supabase dashboard or auth admin API
  -- For now, we'll just create a profile entry that can be linked later
  
  -- Insert admin profile (the auth user should be created separately)
  INSERT INTO profiles (id, email, full_name, is_admin, tier)
  VALUES (
    gen_random_uuid(), -- This should match the actual auth user ID
    admin_email,
    'Admin User',
    TRUE,
    'erigma_circle'
  )
  ON CONFLICT (email) DO UPDATE SET
    is_admin = TRUE,
    tier = 'erigma_circle';
    
  -- Update admin user tier after signup
  UPDATE profiles 
  SET is_admin = TRUE, tier = 'avalanche_backstage'
  WHERE email = 'cloudyzaddy@gmail.com';

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The actual admin user creation should be done via environment variables
-- and the Supabase Auth Admin API in your application startup
