-- Add email field to activity_suggestions table
ALTER TABLE public.activity_suggestions
ADD COLUMN suggester_email text;