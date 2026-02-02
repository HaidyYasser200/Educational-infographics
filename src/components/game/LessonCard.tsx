import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LessonContent } from '@/data/stages';

interface LessonCardProps {
  lesson: LessonContent;
  stageNumber: number;
  stageIcon: string;
  onStartGame: () => void;
}

export const LessonCard = ({ lesson, stageNumber, stageIcon, onStartGame }: LessonCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="gradient-primary text-primary-foreground pb-8">
          <div className="flex items-center justify-between">
            <span className="text-5xl">{stageIcon}</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-lg font-bold">
              المرحلة {stageNumber}
            </span>
          </div>
          <CardTitle className="text-3xl font-bold mt-4">
            {lesson.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-xl leading-relaxed text-muted-foreground">
            {lesson.description}
          </p>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📌</span>
              النقاط الأساسية:
            </h3>
            <ul className="space-y-3">
              {lesson.keyPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-muted/50 p-4 rounded-xl"
                >
                  <span className="text-2xl">✨</span>
                  <span className="text-lg">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onStartGame}
              className="w-full btn-game gradient-secondary text-xl py-8"
            >
              <span className="text-2xl ml-2">🎮</span>
              ابدأ اللعبة الآن!
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
