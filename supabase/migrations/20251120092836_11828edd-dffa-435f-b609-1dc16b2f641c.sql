-- Create user role type
CREATE TYPE user_role AS ENUM ('ouderen', 'jongeren', 'vrijwilliger');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "Anyone can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vrijwilligers can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'vrijwilliger'
    )
  );

CREATE POLICY "Vrijwilligers can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'vrijwilliger'
    )
  );

CREATE POLICY "Vrijwilligers can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'vrijwilliger'
    )
  );

-- Create activity participants table
CREATE TABLE activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;

-- Activity participants policies
CREATE POLICY "Users can view participants"
  ON activity_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join activities"
  ON activity_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave activities"
  ON activity_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create activity suggestions table
CREATE TABLE activity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE activity_suggestions ENABLE ROW LEVEL SECURITY;

-- Activity suggestions policies
CREATE POLICY "Anyone can view suggestions"
  ON activity_suggestions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create suggestions"
  ON activity_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = suggested_by);

-- Create activity reviews table
CREATE TABLE activity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

ALTER TABLE activity_reviews ENABLE ROW LEVEL SECURITY;

-- Activity reviews policies
CREATE POLICY "Anyone can view reviews"
  ON activity_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Participants can create reviews"
  ON activity_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM activity_participants
      WHERE activity_participants.activity_id = activity_reviews.activity_id
      AND activity_participants.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert test account
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'oncparkdreef@test.com',
  crypt('ONC123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'oncparkdreef@test.com',
  'ONC Parkdreef',
  'vrijwilliger'
);