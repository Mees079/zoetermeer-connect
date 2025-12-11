-- Fix the activities RLS policy to be PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view activities" ON public.activities;

CREATE POLICY "Anyone can view activities" 
ON public.activities 
FOR SELECT 
USING (true);