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

  // Start camera - waits for video element to be available
  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      streamRef.current = stream;
      
      // Wait for video element to be available (up to 3 seconds)
      let attempts = 0;
      while (!videoRef.current && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready to play
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          video.onloadedmetadata = () => {
            video.play()
              .then(() => {
                console.log('Camera started, video playing, dimensions:', video.videoWidth, 'x', video.videoHeight);
                resolve();
              })
              .catch(reject);
          };
          video.onerror = reject;
          // Timeout after 5 seconds
          setTimeout(() => resolve(), 5000);
        });
        
        return true;
      } else {
        console.error('Video element not found after waiting');
        return false;
      }
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
      console.log('Cannot detect: video or model not ready', { 
        video: !!videoRef.current, 
        model: isModelLoaded,
        videoReady: videoRef.current?.readyState 
      });
      return null;
    }

    // Check video is actually playing and has dimensions
    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready yet, readyState:', video.readyState, 'dimensions:', video.videoWidth, 'x', video.videoHeight);
      return null;
    }

    try {
      console.log('Detecting emotion... video dimensions:', video.videoWidth, 'x', video.videoHeight);
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.3
        }))
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

        console.log('✅ Emotion detected:', result.emotion, 'confidence:', Math.round(result.confidence * 100) + '%');
        setCurrentEmotion(result);
        setEmotionHistory(prev => [...prev.slice(-50), result]);
        
        return result;
      } else {
        console.log('❌ No face detected in frame');
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
    
    // Initial detection after camera is fully ready
    const runDetection = async () => {
      const result = await detectEmotion();
      console.log('Detection result:', result ? result.emotion : 'no face');
    };
    
    // Wait longer for camera to fully initialize
    setTimeout(() => {
      runDetection();
    }, 2000);
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      runDetection();
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
