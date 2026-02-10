import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LessonCard } from './LessonCard';
import { MatchingGame } from './MatchingGame';
import { MCQGame } from './MCQGame';
import { FillBlankGame } from './FillBlankGame';
import { DragDropGame } from './DragDropGame';
import { EmotionDisplay } from './EmotionDisplay';
import { getStagesByLanguage } from '@/data/stages';
import { useLanguage } from '@/hooks/useLanguage';
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
  
  const { t, language } = useLanguage();
  const stages = getStagesByLanguage(language);
  const stage = stages.find(s => s.id === stageId);
  const { 
    videoRef, currentEmotion, isModelLoaded, isLoading: isModelLoading,
    startCamera, stopCamera, startDetection, emotionHistory 
  } = useEmotionDetection();
  const { saveProgress, logEmotion } = useProgress();
  const { toast } = useToast();

  const requestCameraPermission = useCallback(async () => {
    setCameraPermission('granted');
    await new Promise(resolve => setTimeout(resolve, 200));
    const success = await startCamera();
    if (success) {
      if (!isModelLoaded) await new Promise(resolve => setTimeout(resolve, 2000));
      startDetection(5000);
      toast({ title: t('game.cameraEnabled'), description: t('game.cameraDesc') });
    } else {
      setCameraPermission('denied');
      toast({ title: t('game.cameraFailed'), description: t('game.cameraFailedDesc'), variant: "destructive" });
    }
  }, [startCamera, startDetection, toast, isModelLoaded, t]);

  useEffect(() => {
    return () => { stopCamera(); emotionsCollected.current = []; };
  }, [stopCamera]);

  useEffect(() => {
    if (currentEmotion && phase === 'game') {
      emotionsCollected.current.push(currentEmotion.emotion);
    }
  }, [currentEmotion, phase]);

  const getDominantEmotion = useCallback(() => {
    const emotions = emotionsCollected.current;
    if (emotions.length === 0) return null;
    const frequency: Record<string, number> = {};
    emotions.forEach(e => { frequency[e] = (frequency[e] || 0) + 1; });
    let maxCount = 0;
    let dominant: EmotionType = 'neutral';
    Object.entries(frequency).forEach(([emotion, count]) => {
      if (count > maxCount) { maxCount = count; dominant = emotion as EmotionType; }
    });
    return dominant;
  }, []);

  const handleStartGame = useCallback(() => {
    setPhase('game');
    setStartTime(Date.now());
    emotionsCollected.current = [];
    if (cameraPermission === 'pending') requestCameraPermission();
  }, [cameraPermission, requestCameraPermission]);

  const handleGameComplete = useCallback(async (score: number) => {
    setPhase('complete');
    stopCamera();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const isCompleted = stage ? score >= stage.requiredScore : false;
    const dominantEmotion = getDominantEmotion();
    
    if (dominantEmotion) {
      const emotionMap: Record<string, { arabic: string; emoji: string }> = {
        happy: { arabic: t('emotion.happy'), emoji: '😊' },
        neutral: { arabic: t('emotion.neutral'), emoji: '😐' },
        sad: { arabic: t('emotion.sad'), emoji: '😢' },
        angry: { arabic: t('emotion.angry'), emoji: '😠' },
        surprised: { arabic: t('emotion.surprised'), emoji: '😲' },
        fearful: { arabic: t('emotion.fearful'), emoji: '😨' },
        disgusted: { arabic: t('emotion.disgusted'), emoji: '😴' }
      };
      const dominantCount = emotionsCollected.current.filter(e => e === dominantEmotion).length;
      const totalCount = emotionsCollected.current.length;
      const confidence = totalCount > 0 ? dominantCount / totalCount : 0.5;
      const emotionResult = {
        emotion: dominantEmotion, confidence,
        arabicLabel: emotionMap[dominantEmotion]?.arabic || t('emotion.neutral'),
        emoji: emotionMap[dominantEmotion]?.emoji || '😐'
      };
      await logEmotion(stageId, emotionResult);
      toast({
        title: `${t('game.dominantEmotion')} ${emotionResult.emoji} ${emotionResult.arabicLabel}`,
        description: `${t('game.emotionRecorded')} ${stageId}`
      });
    }
    emotionsCollected.current = [];
    await saveProgress({
      levelNumber: stageId, gameType: stage?.gameType || 'unknown',
      score, isCompleted, timeSpentSeconds: timeSpent, attempts: 1
    });
    setTimeout(() => { onComplete(score); }, 2000);
  }, [stageId, stage, startTime, saveProgress, stopCamera, onComplete, getDominantEmotion, logEmotion, toast, t]);

  if (!stage) {
    return (
      <div className="text-center p-8">
        <p className="text-xl">{t('game.stageNotFound')}</p>
        <Button onClick={onBack} className="mt-4">{t('game.goBack')}</Button>
      </div>
    );
  }

  const renderGame = () => {
    switch (stage.gameType) {
      case 'matching': return stage.matchingItems && <MatchingGame items={stage.matchingItems} onComplete={handleGameComplete} />;
      case 'mcq': return stage.mcqQuestions && <MCQGame questions={stage.mcqQuestions} onComplete={handleGameComplete} />;
      case 'fillblank': return stage.fillBlankQuestions && <FillBlankGame questions={stage.fillBlankQuestions} onComplete={handleGameComplete} />;
      case 'dragdrop': return stage.dragDropItems && <DragDropGame items={stage.dragDropItems} onComplete={handleGameComplete} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto mb-4">
        <Button variant="ghost" onClick={onBack} className="text-lg">{t('game.back')}</Button>
      </div>
      {phase === 'lesson' && (
        <LessonCard lesson={stage.lesson} stageNumber={stage.id} stageIcon={stage.icon} onStartGame={handleStartGame} />
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
            <h2 className="text-4xl font-bold mb-2">{t('game.wellDone')}</h2>
            <p className="text-xl text-muted-foreground">{t('game.completedStage')} {stage.id}</p>
          </div>
        </motion.div>
      )}
      {cameraPermission === 'granted' && phase === 'game' && (
        <EmotionDisplay
          videoRef={videoRef} currentEmotion={currentEmotion}
          isActive={isModelLoaded} isLoading={isModelLoading}
          emotionsCount={emotionsCollected.current.length}
        />
      )}
    </div>
  );
};
