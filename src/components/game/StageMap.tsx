import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { stages, getGameTypeIcon, getGameTypeName } from '@/data/stages';
interface StageMapProps {
  currentLevel: number;
  completedLevels: number[];
  onSelectStage: (stageId: number) => void;
}
export const StageMap = ({
  currentLevel,
  completedLevels,
  onSelectStage
}: StageMapProps) => {
  return <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">🎮 رحلة التعلم</h1>
        
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((stage, index) => {
        const isCompleted = completedLevels.includes(stage.id);
        const isLocked = stage.id > currentLevel && !isCompleted;
        const isCurrent = stage.id === currentLevel;
        return <motion.div key={stage.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.05
        }} whileHover={{
          scale: isLocked ? 1 : 1.05
        }} whileTap={{
          scale: isLocked ? 1 : 0.95
        }}>
              <Card className={`cursor-pointer transition-all border-2 relative overflow-hidden ${isLocked ? 'opacity-50 cursor-not-allowed bg-muted' : isCompleted ? 'bg-success/10 border-success' : isCurrent ? 'border-primary animate-pulse-glow' : 'hover:border-primary/50'}`} onClick={() => !isLocked && onSelectStage(stage.id)}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-10`} />
                
                <CardContent className="p-4 text-center relative">
                  <div className="text-4xl mb-2">{stage.icon}</div>
                  <p className="font-bold text-sm mb-1 line-clamp-2">{stage.title}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <span>{getGameTypeIcon(stage.gameType)}</span>
                    <span>{getGameTypeName(stage.gameType)}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mt-2">
                    {isLocked ? <span className="text-lg">🔒</span> : isCompleted ? <span className="text-lg">✅</span> : isCurrent ? <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                        الحالي
                      </span> : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>;
      })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>✅</span>
          <span>مكتمل</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
          <span>الحالي</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔒</span>
          <span>مقفل</span>
        </div>
      </div>
    </div>;
};