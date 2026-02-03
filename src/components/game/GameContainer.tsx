import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LessonCard } from './LessonCard';
import { MatchingGame } from './MatchingGame';
import { MCQGame } from './MCQGame';
import { FillBlankGame } from './FillBlankGame';
import { DragDropGame } from './DragDropGame';
import { EmotionDisplay } from './EmotionDisplay';
import { stages } from '@/data/stages';
import { useEmotionDetection, EmotionType } from '@/hooks/useEmotionDetection';
import { useProgress } from '@/hooks/useProgress';
import { useToast } from '@/hooks/use-toast';

type GamePhase = 'lesson' | 'game' | 'complete';

interface GameContainerProps {
  stageId: number;
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const GameContainer = ({ stageId, onBack, onComplete }: GameContainerProps) => {
  const [phase, setPhase] = useState<GamePhase>('lesson');
  const [startTime, setStartTime] = useState<number>(0);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const emotionsCollected = useRef<EmotionType[]>([]);
  
  const stage = stages.find(s => s.id === stageId);
  const { 
    videoRef, 
    currentEmotion, 
    isModelLoaded, 
    isLoading: isModelLoading,
    startCamera, 
    stopCamera, 
    startDetection,
    emotionHistory 
  } = useEmotionDetection();
  const { saveProgress, logEmotion } = useProgress();
  const { toast } = useToast();

  // Request camera permission and start detection
  const requestCameraPermission = useCallback(async () => {
    console.log('Requesting camera permission...');
    const success = await startCamera();
    if (success) {
      setCameraPermission('granted');
      // Start detection every 5 seconds for better sampling
      startDetection(5000);
      toast({
        title: "تم تفعيل الكاميرا",
        description: "سيتم تحليل تعابيرك أثناء اللعب"
      });
      console.log('Camera started successfully');
    } else {
      setCameraPermission('denied');
      toast({
        title: "فشل تشغيل الكاميرا",
        description: "يرجى السماح بالوصول للكاميرا",
        variant: "destructive"
      });
      console.log('Camera permission denied');
    }
  }, [startCamera, startDetection, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      emotionsCollected.current = [];
    };
  }, [stopCamera]);

  // Collect emotions during gameplay (don't save yet, just collect)
  useEffect(() => {
    if (currentEmotion && phase === 'game') {
      emotionsCollected.current.push(currentEmotion.emotion);
      console.log('Emotion collected:', currentEmotion.emotion, 'Total:', emotionsCollected.current.length);
    }
  }, [currentEmotion, phase]);

  // Calculate dominant emotion from collected emotions
  const getDominantEmotion = useCallback(() => {
    const emotions = emotionsCollected.current;
    if (emotions.length === 0) return null;

    const frequency: Record<string, number> = {};
    emotions.forEach(e => {
      frequency[e] = (frequency[e] || 0) + 1;
    });

    let maxCount = 0;
    let dominant: EmotionType = 'neutral';
    Object.entries(frequency).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = emotion as EmotionType;
      }
    });

    console.log('Emotion frequency:', frequency, 'Dominant:', dominant);
    return dominant;
  }, []);

  const handleStartGame = useCallback(() => {
    setPhase('game');
    setStartTime(Date.now());
    emotionsCollected.current = []; // Reset emotions for new game
    
    // Request camera if not already done
    if (cameraPermission === 'pending') {
      requestCameraPermission();
    }
  }, [cameraPermission, requestCameraPermission]);

  const handleGameComplete = useCallback(async (score: number) => {
    setPhase('complete');
    stopCamera();

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const isCompleted = stage ? score >= stage.requiredScore : false;

    // Get dominant emotion and save it ONCE at the end
    const dominantEmotion = getDominantEmotion();
    console.log('Game complete! Dominant emotion:', dominantEmotion, 'Collected emotions:', emotionsCollected.current.length);
    
    if (dominantEmotion) {
      // Calculate average confidence for the dominant emotion
      const emotionMap: Record<string, { arabic: string; emoji: string }> = {
        happy: { arabic: 'سعيد', emoji: '😊' },
        neutral: { arabic: 'محايد', emoji: '😐' },
        sad: { arabic: 'حزين', emoji: '😢' },
        angry: { arabic: 'غضب', emoji: '😠' },
        surprised: { arabic: 'مندهش', emoji: '😲' },
        fearful: { arabic: 'خائف', emoji: '😨' },
        disgusted: { arabic: 'ملل', emoji: '😴' }
      };
      
      const dominantCount = emotionsCollected.current.filter(e => e === dominantEmotion).length;
      const totalCount = emotionsCollected.current.length;
      const confidence = totalCount > 0 ? dominantCount / totalCount : 0.5;
      
      const emotionResult = {
        emotion: dominantEmotion,
        confidence: confidence,
        arabicLabel: emotionMap[dominantEmotion]?.arabic || 'محايد',
        emoji: emotionMap[dominantEmotion]?.emoji || '😐'
      };
      
      // Save ONLY the dominant emotion at the end of the stage
      const result = await logEmotion(stageId, emotionResult);
      console.log('Emotion saved to database:', result);
      
      toast({
        title: `الشعور السائد: ${emotionResult.emoji} ${emotionResult.arabicLabel}`,
        description: `تم تسجيل شعورك في المرحلة ${stageId}`
      });
    } else {
      console.log('No emotions collected during this game');
    }

    // Reset collected emotions
    emotionsCollected.current = [];

    await saveProgress({
      levelNumber: stageId,
      gameType: stage?.gameType || 'unknown',
      score,
      isCompleted,
      timeSpentSeconds: timeSpent,
      attempts: 1
    });

    setTimeout(() => {
      onComplete(score);
    }, 2000);
  }, [stageId, stage, startTime, saveProgress, stopCamera, onComplete, getDominantEmotion, logEmotion, toast]);

  if (!stage) {
    return (
      <div className="text-center p-8">
        <p className="text-xl">المرحلة غير موجودة</p>
        <Button onClick={onBack} className="mt-4">
          العودة
        </Button>
      </div>
    );
  }

  const renderGame = () => {
    switch (stage.gameType) {
      case 'matching':
        return stage.matchingItems && (
          <MatchingGame items={stage.matchingItems} onComplete={handleGameComplete} />
        );
      case 'mcq':
        return stage.mcqQuestions && (
          <MCQGame questions={stage.mcqQuestions} onComplete={handleGameComplete} />
        );
      case 'fillblank':
        return stage.fillBlankQuestions && (
          <FillBlankGame questions={stage.fillBlankQuestions} onComplete={handleGameComplete} />
        );
      case 'dragdrop':
        return stage.dragDropItems && (
          <DragDropGame items={stage.dragDropItems} onComplete={handleGameComplete} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-4">
        <Button variant="ghost" onClick={onBack} className="text-lg">
          → العودة للقائمة
        </Button>
      </div>

      {/* Main Content */}
      {phase === 'lesson' && (
        <LessonCard
          lesson={stage.lesson}
          stageNumber={stage.id}
          stageIcon={stage.icon}
          onStartGame={handleStartGame}
        />
      )}

      {phase === 'game' && renderGame()}

      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50"
        >
          <div className="text-center p-8">
            <div className="text-8xl mb-4 animate-bounce-in">🎉</div>
            <h2 className="text-4xl font-bold mb-2">أحسنت!</h2>
            <p className="text-xl text-muted-foreground">
              أكملت المرحلة {stage.id}
            </p>
          </div>
        </motion.div>
      )}

      {/* Emotion Display - Show even while loading */}
      {cameraPermission === 'granted' && phase === 'game' && (
        <EmotionDisplay
          videoRef={videoRef}
          currentEmotion={currentEmotion}
          isActive={isModelLoaded}
          isLoading={isModelLoading}
          emotionsCount={emotionsCollected.current.length}
        />
      )}
    </div>
  );
};
