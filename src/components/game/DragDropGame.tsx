import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DragDropItem } from '@/data/stages';

interface SortableItemProps {
  id: string;
  content: string;
  isCorrect?: boolean;
  showResult: boolean;
}

const SortableItem = ({ id, content, isCorrect, showResult }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'z-50' : ''}`}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <Card className={`border-2 transition-all ${
        showResult
          ? isCorrect
            ? 'bg-success/20 border-success'
            : 'bg-destructive/20 border-destructive'
          : isDragging
          ? 'shadow-xl border-primary'
          : 'hover:border-primary/50'
      }`}>
        <CardContent className="p-4 flex items-center gap-4">
          <span className="text-2xl">☰</span>
          <span className="text-lg font-medium flex-1">{content}</span>
          {showResult && (
            <span className="text-2xl">
              {isCorrect ? '✅' : '❌'}
            </span>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface DragDropGameProps {
  items: DragDropItem[];
  onComplete: (score: number) => void;
}

export const DragDropGame = ({ items, onComplete }: DragDropGameProps) => {
  const [orderedItems, setOrderedItems] = useState(() => 
    [...items].sort(() => Math.random() - 0.5)
  );
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleCheck = () => {
    let correctCount = 0;
    orderedItems.forEach((item, index) => {
      if (item.correctOrder === index + 1) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResult(true);
  };

  const handleComplete = () => {
    onComplete(score);
  };

  const handleReset = () => {
    setOrderedItems([...items].sort(() => Math.random() - 0.5));
    setShowResult(false);
    setScore(0);
  };

  const isItemCorrect = (item: DragDropItem, index: number) => {
    return item.correctOrder === index + 1;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎯 سحب وإفلات</h2>
        <p className="text-muted-foreground text-lg">
          رتب العناصر بالترتيب الصحيح
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {orderedItems.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                content={item.content}
                isCorrect={isItemCorrect(item, index)}
                showResult={showResult}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-8 text-center space-y-4">
        {!showResult ? (
          <Button
            onClick={handleCheck}
            className="btn-game gradient-primary text-xl"
          >
            ✔️ تحقق من الترتيب
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`text-4xl mb-4 ${score === items.length ? 'animate-bounce-in' : ''}`}>
              {score === items.length ? '🎉' : '💪'}
            </div>
            <p className="text-2xl font-bold mb-4">
              النتيجة: <span className="text-success">{score}</span> / {items.length}
            </p>
            {score === items.length ? (
              <Button
                onClick={handleComplete}
                className="btn-game gradient-success text-xl"
              >
                ممتاز! المتابعة ➡️
              </Button>
            ) : (
              <div className="space-x-4 space-x-reverse">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="btn-game"
                >
                  🔄 حاول مرة أخرى
                </Button>
                <Button
                  onClick={handleComplete}
                  className="btn-game gradient-primary"
                >
                  المتابعة ➡️
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
