-- Create the admin user with specified credentials
-- This should be run after the user signs up with cloudyzaddy@gmail.com

-- First, let's create a function to set up admin user
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user profile to admin status
  -- This will work once the user signs up with the specified email
  UPDATE profiles 
  SET 
    is_admin = true,
    tier = 'avalanche_backstage',
    full_name = 'Kelvin Creekman Admin',
    updated_at = now()
  WHERE email = 'cloudyzaddy@gmail.com';
  
  -- If no rows were updated, the user hasn't signed up yet
  IF NOT FOUND THEN
    RAISE NOTICE 'Admin user with email cloudyzaddy@gmail.com not found. Please sign up first.';
  ELSE
    RAISE NOTICE 'Admin user setup completed successfully.';
  END IF;
END;
$$;

-- Create a trigger to automatically set admin status when the user signs up
CREATE OR REPLACE FUNCTION auto_setup_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'cloudyzaddy@gmail.com' THEN
    NEW.is_admin = true;
    NEW.tier = 'avalanche_backstage';
    NEW.full_name = COALESCE(NEW.full_name, 'Kelvin Creekman Admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profile insertions
DROP TRIGGER IF EXISTS auto_setup_admin_trigger ON profiles;
CREATE TRIGGER auto_setup_admin_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_setup_admin();

-- Also create a trigger for updates in case the email is changed
DROP TRIGGER IF EXISTS auto_setup_admin_update_trigger ON profiles;
CREATE TRIGGER auto_setup_admin_update_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.email = 'cloudyzaddy@gmail.com' AND OLD.email != 'cloudyzaddy@gmail.com')
  EXECUTE FUNCTION auto_setup_admin();

-- Try to set up admin user if they already exist
SELECT setup_admin_user();

-- Grant necessary permissions for admin functions
GRANT EXECUTE ON FUNCTION setup_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_setup_admin() TO authenticated;
