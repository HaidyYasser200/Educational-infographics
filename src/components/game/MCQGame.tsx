import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MCQQuestion } from '@/data/stages';

interface MCQGameProps {
  questions: MCQQuestion[];
  onComplete: (score: number) => void;
}

export const MCQGame = ({ questions, onComplete }: MCQGameProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (optionIndex: number) => {
    if (showResult) return;
    
    setSelectedOption(optionIndex);
    const correct = optionIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      onComplete(score + (isCorrect ? 0 : 0)); // Score already updated
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">📝 اختيار من متعدد</h2>
        <p className="text-muted-foreground text-lg">
          السؤال {currentIndex + 1} من {questions.length}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < currentIndex ? 'bg-success' : i === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <Card className="border-2 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6 text-center">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full py-6 text-lg justify-start transition-all ${
                        showResult
                          ? index === currentQuestion.correctIndex
                            ? 'bg-success/20 border-success text-success-foreground'
                            : selectedOption === index
                            ? 'bg-destructive/20 border-destructive'
                            : ''
                          : selectedOption === index
                          ? 'border-primary bg-primary/10'
                          : ''
                      }`}
                      onClick={() => handleOptionClick(index)}
                      disabled={showResult}
                    >
                      <span className="ml-3 text-xl">
                        {index === 0 ? 'أ' : index === 1 ? 'ب' : index === 2 ? 'ج' : 'د'}
                      </span>
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <div className={`text-4xl mb-2 ${isCorrect ? 'animate-bounce-in' : 'animate-wiggle'}`}>
                    {isCorrect ? '✅' : '❌'}
                  </div>
                  <p className={`text-xl font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                    {isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'}
                  </p>
                  {!isCorrect && (
                    <p className="text-muted-foreground mt-2">
                      الإجابة الصحيحة: {currentQuestion.options[currentQuestion.correctIndex]}
                    </p>
                  )}
                  <Button
                    onClick={handleNext}
                    className="mt-4 btn-game gradient-primary"
                  >
                    {currentIndex < questions.length - 1 ? 'السؤال التالي ➡️' : 'إنهاء 🏁'}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 text-center">
        <p className="text-xl font-bold">
          النتيجة: <span className="text-success">{score}</span> / {questions.length}
        </p>
      </div>
    </div>
  );
};
