-- Fix privilege escalation: Move roles to separate secure table

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'vrijwilliger', 'ouderen', 'jongeren');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing data from profiles.role to user_roles
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT id, role::text::app_role, created_at
FROM public.profiles
WHERE role IS NOT NULL;

-- Update activities RLS policies to use has_role function
DROP POLICY IF EXISTS "Vrijwilligers can create activities" ON public.activities;
DROP POLICY IF EXISTS "Vrijwilligers can update own activities" ON public.activities;
DROP POLICY IF EXISTS "Vrijwilligers can delete own activities" ON public.activities;

CREATE POLICY "Vrijwilligers can create activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'vrijwilliger'));

CREATE POLICY "Vrijwilligers can update own activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() 
    AND public.has_role(auth.uid(), 'vrijwilliger')
  );

CREATE POLICY "Vrijwilligers can delete own activities"
  ON public.activities FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() 
    AND public.has_role(auth.uid(), 'vrijwilliger')
  );

-- Add max_ouderen and max_jongeren columns to activities
ALTER TABLE public.activities
  ADD COLUMN max_ouderen INTEGER,
  ADD COLUMN max_jongeren INTEGER;

-- Drop role column from profiles (keep for now as it's referenced in types)
-- We'll update this after code changes
-- ALTER TABLE public.profiles DROP COLUMN role;

-- Add policies for review editing
CREATE POLICY "Users can update own reviews"
  ON public.activity_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.activity_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Restrict profile data exposure
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own full profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profile data"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Note: For column-level security, we'll handle this in application layer
-- by only selecting specific columns in the frontend code