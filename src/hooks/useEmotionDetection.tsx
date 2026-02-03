import { useState, useRef, useCallback, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export type EmotionType = 'happy' | 'neutral' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted';

export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  arabicLabel: string;
  emoji: string;
}

const emotionMap: Record<string, { arabic: string; emoji: string }> = {
  happy: { arabic: 'سعيد', emoji: '😊' },
  neutral: { arabic: 'محايد', emoji: '😐' },
  sad: { arabic: 'حزين', emoji: '😢' },
  angry: { arabic: 'غضب', emoji: '😠' },
  surprised: { arabic: 'مندهش', emoji: '😲' },
  fearful: { arabic: 'خائف', emoji: '😨' },
  disgusted: { arabic: 'ملل', emoji: '😴' }
};

export const useEmotionDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionResult[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading face-api models...');
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      
      setIsModelLoaded(true);
      setError(null);
      console.log('Face-api models loaded successfully');
    } catch (err) {
      setError('فشل في تحميل نماذج التعرف على الوجه');
      console.error('Error loading models:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('Camera started, video playing');
      }
      
      return true;
    } catch (err) {
      setError('فشل في الوصول إلى الكاميرا. يرجى السماح بالوصول.');
      console.error('Error accessing camera:', err);
      return false;
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Detect emotion from video
  const detectEmotion = useCallback(async (): Promise<EmotionResult | null> => {
    if (!videoRef.current || !isModelLoaded) {
      console.log('Cannot detect: video or model not ready', { video: !!videoRef.current, model: isModelLoaded });
      return null;
    }

    try {
      console.log('Detecting emotion...');
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections && detections.expressions) {
        const expressions = detections.expressions;
        const sortedExpressions = Object.entries(expressions).sort(([, a], [, b]) => b - a);
        const [topEmotion, confidence] = sortedExpressions[0];
        
        const emotionKey = topEmotion as EmotionType;
        const mappedEmotion = emotionMap[emotionKey] || emotionMap.neutral;
        
        const result: EmotionResult = {
          emotion: emotionKey,
          confidence: confidence,
          arabicLabel: mappedEmotion.arabic,
          emoji: mappedEmotion.emoji
        };

        console.log('Emotion detected:', result.emotion, 'confidence:', Math.round(result.confidence * 100) + '%');
        setCurrentEmotion(result);
        setEmotionHistory(prev => [...prev.slice(-50), result]);
        
        return result;
      } else {
        console.log('No face detected');
      }
    } catch (err) {
      console.error('Error detecting emotion:', err);
    }
    
    return null;
  }, [isModelLoaded]);

  // Start continuous detection
  const startDetection = useCallback((intervalMs: number = 5000) => {
    console.log('Starting emotion detection with interval:', intervalMs, 'ms');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Initial detection after a short delay to let camera warm up
    setTimeout(() => {
      detectEmotion();
    }, 1000);
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      detectEmotion();
    }, intervalMs);
  }, [detectEmotion]);

  // Initialize
  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  return {
    videoRef,
    isModelLoaded,
    isLoading,
    error,
    currentEmotion,
    emotionHistory,
    loadModels,
    startCamera,
    stopCamera,
    detectEmotion,
    startDetection,
    clearHistory: () => setEmotionHistory([])
  };
};
