import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import type { MatchingItem } from '@/data/stages';

interface MatchingGameProps {
  items: MatchingItem[];
  onComplete: (score: number) => void;
}

export const MatchingGame = ({ items, onComplete }: MatchingGameProps) => {
  const { t } = useLanguage();
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongAttempt, setWrongAttempt] = useState<string | null>(null);
  const shuffledImages = [...items].sort(() => Math.random() - 0.5);

  const handleConceptClick = (conceptId: string) => {
    if (matchedPairs.includes(conceptId)) return;
    setSelectedConcept(conceptId);
    setWrongAttempt(null);
  };

  const handleImageClick = useCallback((imageId: string) => {
    if (!selectedConcept || matchedPairs.includes(imageId)) return;
    if (selectedConcept === imageId) {
      const newMatched = [...matchedPairs, imageId];
      setMatchedPairs(newMatched);
      setSelectedConcept(null);
      if (newMatched.length === items.length) setTimeout(() => onComplete(items.length), 500);
    } else {
      setWrongAttempt(imageId);
      setTimeout(() => setWrongAttempt(null), 500);
    }
  }, [selectedConcept, matchedPairs, items, onComplete]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('matching.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('matching.desc')}</p>
        <div className="mt-4 flex justify-center gap-2">
          {items.map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < matchedPairs.length ? 'bg-success' : 'bg-muted'}`} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center mb-4">{t('matching.concepts')}</h3>
          {items.map((item) => (
            <motion.div key={item.id} whileHover={{ scale: matchedPairs.includes(item.id) ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all border-2 ${matchedPairs.includes(item.id) ? 'bg-success/20 border-success opacity-50' : selectedConcept === item.id ? 'border-primary shadow-lg animate-pulse-glow' : 'hover:border-primary/50'}`}
                onClick={() => handleConceptClick(item.id)}
              >
                <CardContent className="p-4 text-center"><span className="text-lg font-medium">{item.concept}</span></CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center mb-4">{t('matching.answers')}</h3>
          {shuffledImages.map((item) => (
            <motion.div key={item.id} whileHover={{ scale: matchedPairs.includes(item.id) ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} animate={wrongAttempt === item.id ? { x: [0, -10, 10, -10, 10, 0] } : {}}>
              <Card
                className={`cursor-pointer transition-all border-2 ${matchedPairs.includes(item.id) ? 'bg-success/20 border-success opacity-50' : wrongAttempt === item.id ? 'border-destructive bg-destructive/10' : 'hover:border-secondary/50'}`}
                onClick={() => handleImageClick(item.id)}
              >
                <CardContent className="p-4 text-center"><span className="text-lg font-medium">{item.image}</span></CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {matchedPairs.length === items.length && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">{t('game.wellDone')}</h2>
              <p className="text-xl text-muted-foreground">{t('matching.complete')}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
