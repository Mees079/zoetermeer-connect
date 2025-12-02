-- Update activity_participants to allow anonymous participants
ALTER TABLE public.activity_participants 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN participant_name TEXT,
  ADD COLUMN participant_type TEXT CHECK (participant_type IN ('ouderen', 'jongeren'));

-- Update activity_suggestions to allow anonymous suggestions  
ALTER TABLE public.activity_suggestions
  ALTER COLUMN suggested_by DROP NOT NULL,
  ADD COLUMN suggester_name TEXT,
  ADD COLUMN suggester_type TEXT CHECK (suggester_type IN ('ouderen', 'jongeren'));

-- Drop existing RLS policies for participants
DROP POLICY IF EXISTS "Users can join activities" ON public.activity_participants;
DROP POLICY IF EXISTS "Users can leave activities" ON public.activity_participants;
DROP POLICY IF EXISTS "Users can view participants" ON public.activity_participants;

-- Create new RLS policies for anonymous participants
CREATE POLICY "Anyone can view participants"
ON public.activity_participants
FOR SELECT
USING (true);

CREATE POLICY "Anyone can join activities"
ON public.activity_participants
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Vrijwilligers can manage participants"
ON public.activity_participants
FOR DELETE
USING (has_role(auth.uid(), 'vrijwilliger'::app_role));

-- Drop existing suggestion policies
DROP POLICY IF EXISTS "Users can create suggestions" ON public.activity_suggestions;

-- Create new policy for anonymous suggestions
CREATE POLICY "Anyone can create suggestions"
ON public.activity_suggestions
FOR INSERT
WITH CHECK (true);