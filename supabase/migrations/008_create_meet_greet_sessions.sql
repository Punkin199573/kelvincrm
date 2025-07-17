-- Create meet_greet_sessions table to match the admin component expectations
CREATE TABLE IF NOT EXISTS meet_greet_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  max_participants INTEGER NOT NULL DEFAULT 1,
  current_participants INTEGER NOT NULL DEFAULT 0,
  session_type TEXT NOT NULL CHECK (session_type IN ('group', 'private')),
  required_tier TEXT NOT NULL CHECK (required_tier IN ('frost_fan', 'blizzard_vip', 'avalanche_backstage')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  daily_room_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meet_greet_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "meet_greet_sessions_select_policy" ON meet_greet_sessions
FOR SELECT USING (is_active = true);

CREATE POLICY "admin_full_access_meet_greet_sessions" ON meet_greet_sessions
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

-- Create session_slots table for the admin session management
CREATE TABLE IF NOT EXISTS session_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_bookings INTEGER NOT NULL DEFAULT 1,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE session_slots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "session_slots_select_policy" ON session_slots
FOR SELECT USING (is_available = true);

CREATE POLICY "admin_full_access_session_slots" ON session_slots
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meet_greet_sessions_updated_at BEFORE UPDATE ON meet_greet_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_slots_updated_at BEFORE UPDATE ON session_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
