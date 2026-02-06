import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logEmotionToFirebase, saveProgressToFirebase } from '@/lib/firebase';
import type { EmotionResult } from './useEmotionDetection';

export interface ProgressData {
  levelNumber: number;
  gameType: string;
  score: number;
  isCompleted: boolean;
  timeSpentSeconds: number;
  attempts: number;
}

export const useProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Save progress to both databases
  const saveProgress = useCallback(async (data: ProgressData) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      // Save to Lovable Cloud (Supabase)
      const { error: supabaseError } = await supabase
        .from('student_progress')
        .insert({
          user_id: user.id,
          level_number: data.levelNumber,
          game_type: data.gameType,
          score: data.score,
          is_completed: data.isCompleted,
          time_spent_seconds: data.timeSpentSeconds,
          attempts: data.attempts,
          completed_at: data.isCompleted ? new Date().toISOString() : null
        });

      if (supabaseError) throw supabaseError;

      // Save to Firebase (if configured)
      await saveProgressToFirebase({
        userId: user.id,
        levelNumber: data.levelNumber,
        gameType: data.gameType,
        score: data.score,
        isCompleted: data.isCompleted,
        timeSpentSeconds: data.timeSpentSeconds,
        attempts: data.attempts,
        completedAt: data.isCompleted ? new Date() as any : undefined
      });

      return { error: null };
    } catch (error) {
      console.error('Error saving progress:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Log emotion to both databases
  const logEmotion = useCallback(async (levelNumber: number, emotion: EmotionResult, username?: string) => {
    if (!user) {
      console.log('Cannot log emotion: user not authenticated');
      return { error: 'Not authenticated' };
    }

    try {
      // Get username from profile if not provided
      let studentUsername = username;
      if (!studentUsername) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        studentUsername = profile?.username || user.email || 'Unknown';
      }

      const userEmail = user.email || '';
      console.log('Saving emotion to database:', { levelNumber, emotion: emotion.emotion, confidence: emotion.confidence, username: studentUsername, email: userEmail });
      
      // Save to Lovable Cloud (Supabase)
      const { error: supabaseError, data } = await supabase
        .from('emotion_logs')
        .insert({
          user_id: user.id,
          level_number: levelNumber,
          emotion: emotion.emotion,
          confidence: emotion.confidence,
          username: studentUsername,
          email: userEmail
        })
        .select();

      if (supabaseError) {
        console.error('Supabase error saving emotion:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Emotion saved successfully to Supabase:', data);

      // Save to Firebase (if configured)
      await logEmotionToFirebase({
        userId: user.id,
        levelNumber,
        emotion: emotion.emotion,
        confidence: emotion.confidence
      });

      return { error: null, data };
    } catch (error) {
      console.error('Error logging emotion:', error);
      return { error };
    }
  }, [user]);

  // Get user progress
  const getProgress = useCallback(async () => {
    if (!user) return { data: null, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting progress:', error);
      return { data: null, error };
    }
  }, [user]);

  // Get emotion logs
  const getEmotionLogs = useCallback(async () => {
    if (!user) return { data: null, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('emotion_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting emotion logs:', error);
      return { data: null, error };
    }
  }, [user]);

  // Update user profile level
  const updateCurrentLevel = useCallback(async (level: number) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ current_level: level })
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating level:', error);
      return { error };
    }
  }, [user]);

  // Get user profile
  const getProfile = useCallback(async () => {
    if (!user) return { data: null, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { data: null, error };
    }
  }, [user]);

  return {
    loading,
    saveProgress,
    logEmotion,
    getProgress,
    getEmotionLogs,
    updateCurrentLevel,
    getProfile
  };
};
