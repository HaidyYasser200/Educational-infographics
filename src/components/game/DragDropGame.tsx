import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import type { DragDropItem } from '@/data/stages';

interface TapItemProps {
  id: string;
  content: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult: boolean;
  swapHint: string;
  onTap: (index: number) => void;
}

const TapItem = ({ id, content, index, isSelected, isCorrect, showResult, swapHint, onTap }: TapItemProps) => (
  <motion.div className="cursor-pointer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} layout onClick={() => onTap(index)}>
    <Card className={`border-2 transition-all ${
      showResult ? isCorrect ? 'bg-success/20 border-success' : 'bg-destructive/20 border-destructive'
        : isSelected ? 'shadow-xl border-primary bg-primary/10 ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'
    }`}>
      <CardContent className="p-4 flex items-center gap-4">
        <span className={`text-2xl transition-transform ${isSelected ? 'scale-125' : ''}`}>{isSelected ? '👆' : '☰'}</span>
        <span className="text-lg font-medium flex-1">{content}</span>
        {showResult && <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>}
        {isSelected && !showResult && <span className="text-sm text-primary font-medium animate-pulse">{swapHint}</span>}
      </CardContent>
    </Card>
  </motion.div>
);

interface DragDropGameProps {
  items: DragDropItem[];
  onComplete: (score: number) => void;
}

export const DragDropGame = ({ items, onComplete }: DragDropGameProps) => {
  const { t } = useLanguage();
  const [orderedItems, setOrderedItems] = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleTap = useCallback((index: number) => {
    if (showResult) return;
    if (selectedIndex === null) { setSelectedIndex(index); }
    else if (selectedIndex === index) { setSelectedIndex(null); }
    else {
      setOrderedItems(prev => {
        const newItems = [...prev];
        const temp = newItems[selectedIndex];
        newItems[selectedIndex] = newItems[index];
        newItems[index] = temp;
        return newItems;
      });
      setSelectedIndex(null);
    }
  }, [selectedIndex, showResult]);

  const handleCheck = () => {
    let correctCount = 0;
    orderedItems.forEach((item, index) => { if (item.correctOrder === index + 1) correctCount++; });
    setScore(correctCount);
    setShowResult(true);
  };

  const handleComplete = () => onComplete(score);
  const handleReset = () => { setOrderedItems([...items].sort(() => Math.random() - 0.5)); setShowResult(false); setScore(0); setSelectedIndex(null); };
  const isItemCorrect = (item: DragDropItem, index: number) => item.correctOrder === index + 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('drag.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('drag.desc')}</p>
        {selectedIndex !== null && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-medium mt-2">
            {t('drag.selected')}
          </motion.p>
        )}
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {orderedItems.map((item, index) => (
            <TapItem key={item.id} id={item.id} content={item.content} index={index}
              isSelected={selectedIndex === index} isCorrect={isItemCorrect(item, index)}
              showResult={showResult} swapHint={t('drag.swapHint')} onTap={handleTap} />
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-8 text-center space-y-4">
        {!showResult ? (
          <Button onClick={handleCheck} className="btn-game gradient-primary text-xl">{t('drag.check')}</Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`text-4xl mb-4 ${score === items.length ? 'animate-bounce-in' : ''}`}>
              {score === items.length ? '🎉' : '💪'}
            </div>
            <p className="text-2xl font-bold mb-4">{t('drag.score')} <span className="text-success">{score}</span> / {items.length}</p>
            {score === items.length ? (
              <Button onClick={handleComplete} className="btn-game gradient-success text-xl">{t('drag.excellent')}</Button>
            ) : (
              <div className="space-x-4 space-x-reverse">
                <Button onClick={handleReset} variant="outline" className="btn-game">{t('drag.retry')}</Button>
                <Button onClick={handleComplete} className="btn-game gradient-primary">{t('drag.continue')}</Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
