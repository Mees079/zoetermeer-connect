-- Add email column to activity_participants
ALTER TABLE public.activity_participants 
ADD COLUMN participant_email text;

-- Add columns to track email status
ALTER TABLE public.activity_participants 
ADD COLUMN reminder_sent boolean DEFAULT false,
ADD COLUMN review_request_sent boolean DEFAULT false;