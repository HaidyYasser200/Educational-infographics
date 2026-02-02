import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LessonCard } from './LessonCard';
import { MatchingGame } from './MatchingGame';
import { MCQGame } from './MCQGame';
import { FillBlankGame } from './FillBlankGame';
import { DragDropGame } from './DragDropGame';
import { EmotionDisplay } from './EmotionDisplay';
import { stages } from '@/data/stages';
import { useEmotionDetection } from '@/hooks/useEmotionDetection';
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
  
  const stage = stages.find(s => s.id === stageId);
  const { 
    videoRef, 
    currentEmotion, 
    isModelLoaded, 
    startCamera, 
    stopCamera, 
    startDetection,
    emotionHistory 
  } = useEmotionDetection();
  const { saveProgress, logEmotion } = useProgress();
  const { toast } = useToast();

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    const success = await startCamera();
    if (success) {
      setCameraPermission('granted');
      startDetection(30000); // Capture every 30 seconds
      toast({
        title: "تم تفعيل الكاميرا",
        description: "سيتم تحليل تعابيرك أثناء اللعب"
      });
    } else {
      setCameraPermission('denied');
    }
  }, [startCamera, startDetection, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Log emotions when they change
  useEffect(() => {
    if (currentEmotion && phase === 'game') {
      logEmotion(stageId, currentEmotion);
    }
  }, [currentEmotion, phase, stageId, logEmotion]);

  const handleStartGame = useCallback(() => {
    setPhase('game');
    setStartTime(Date.now());
    
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
  }, [stageId, stage, startTime, saveProgress, stopCamera, onComplete]);

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

      {/* Emotion Display */}
      {cameraPermission === 'granted' && phase === 'game' && isModelLoaded && (
        <EmotionDisplay
          videoRef={videoRef}
          currentEmotion={currentEmotion}
          isActive={true}
        />
      )}
    </div>
  );
};
