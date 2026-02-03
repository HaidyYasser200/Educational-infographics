import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { EmotionResult } from '@/hooks/useEmotionDetection';

interface EmotionDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentEmotion: EmotionResult | null;
  isActive: boolean;
  isLoading?: boolean;
  emotionsCount?: number;
}

export const EmotionDisplay = ({ 
  videoRef, 
  currentEmotion, 
  isActive, 
  isLoading = false,
  emotionsCount = 0 
}: EmotionDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-40"
    >
      <Card className="overflow-hidden shadow-xl border-2 border-primary/20">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-32 h-24 object-cover"
            style={{ transform: 'scaleX(-1)' }}
            autoPlay
            muted
            playsInline
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs mt-1">جارٍ التحميل...</span>
            </div>
          )}
          
          {/* Camera inactive overlay */}
          {!isActive && !isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
          )}
          
          {/* Emotions counter badge */}
          {emotionsCount > 0 && (
            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {emotionsCount}
            </div>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {currentEmotion ? (
            <motion.div
              key={currentEmotion.emotion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 bg-card text-center"
            >
              <span className="text-2xl">{currentEmotion.emoji}</span>
              <p className="text-sm font-medium">{currentEmotion.arabicLabel}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(currentEmotion.confidence * 100)}%
              </p>
            </motion.div>
          ) : isActive ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-2 bg-card text-center"
            >
              <span className="text-lg">🔍</span>
              <p className="text-xs text-muted-foreground">جارٍ التحليل...</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
