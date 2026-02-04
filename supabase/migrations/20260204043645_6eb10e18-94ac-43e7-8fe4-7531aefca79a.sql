-- Add username column to emotion_logs table
ALTER TABLE public.emotion_logs 
ADD COLUMN username text;