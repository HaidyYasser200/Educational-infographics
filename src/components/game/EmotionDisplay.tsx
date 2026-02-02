import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { EmotionResult } from '@/hooks/useEmotionDetection';

interface EmotionDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentEmotion: EmotionResult | null;
  isActive: boolean;
}

export const EmotionDisplay = ({ videoRef, currentEmotion, isActive }: EmotionDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-40"
    >
      <Card className="overflow-hidden shadow-xl border-2">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-32 h-24 object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
            autoPlay
            muted
            playsInline
          />
          {!isActive && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {currentEmotion && (
            <motion.div
              key={currentEmotion.emotion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 bg-card text-center"
            >
              <span className="text-2xl">{currentEmotion.emoji}</span>
              <p className="text-sm font-medium">{currentEmotion.arabicLabel}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
