-- Ensure admin user setup function exists
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'cloudyzaddy@gmail.com' THEN
    -- Update the profile to be admin
    UPDATE profiles 
    SET is_admin = true, 
        tier = 'avalanche_backstage',
        subscription_status = 'active',
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS setup_admin_on_signup ON profiles;
CREATE TRIGGER setup_admin_on_signup
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION setup_admin_user();

-- Also create a function to manually set admin if needed
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET is_admin = true, 
      tier = 'avalanche_backstage',
      subscription_status = 'active',
      updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION setup_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION make_user_admin(TEXT) TO authenticated;

-- Ensure the admin email can be set as admin even if profile already exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'cloudyzaddy@gmail.com') THEN
    UPDATE profiles 
    SET is_admin = true, 
        tier = 'avalanche_backstage',
        subscription_status = 'active',
        updated_at = NOW()
    WHERE email = 'cloudyzaddy@gmail.com';
  END IF;
END $$;
