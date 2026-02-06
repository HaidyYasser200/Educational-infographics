-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email text;

-- Add email column to emotion_logs table
ALTER TABLE public.emotion_logs 
ADD COLUMN email text;