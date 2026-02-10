import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { useLanguage, LanguageProvider } from '@/hooks/useLanguage';
import { AuthForm } from '@/components/auth/AuthForm';
import { StageMap } from '@/components/game/StageMap';
import { GameContainer } from '@/components/game/GameContainer';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/button';
import { getStagesByLanguage } from '@/data/stages';
import { initFirebase } from '@/lib/firebase';

type AppView = 'stages' | 'game' | 'dashboard';

const MainApp = () => {
  const { user, loading, signOut } = useAuth();
  const { getProfile, updateCurrentLevel } = useProgress();
  const { t, language, toggleLanguage } = useLanguage();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [view, setView] = useState<AppView>('stages');

  const stages = getStagesByLanguage(language);

  useEffect(() => {
    initFirebase();
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        const { data } = await getProfile();
        if (data) {
          setCurrentLevel(data.current_level || 1);
        }
      }
    };
    loadProgress();
  }, [user, getProfile]);

  const handleSelectStage = useCallback((stageId: number) => {
    setSelectedStage(stageId);
    setView('game');
  }, []);

  const handleGameComplete = useCallback(async (score: number) => {
    if (selectedStage) {
      const stage = stages.find(s => s.id === selectedStage);
      if (stage && score >= stage.requiredScore) {
        setCompletedLevels(prev => [...new Set([...prev, selectedStage])]);
        if (selectedStage >= currentLevel && selectedStage < stages.length) {
          const newLevel = selectedStage + 1;
          setCurrentLevel(newLevel);
          await updateCurrentLevel(newLevel);
        }
      }
    }
    setTimeout(() => {
      setView('stages');
      setSelectedStage(null);
    }, 2000);
  }, [selectedStage, currentLevel, updateCurrentLevel, stages]);

  const handleBackToStages = useCallback(() => {
    setView('stages');
    setSelectedStage(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-7xl mb-4 animate-float">🎨</div>
          <h1 className="text-3xl font-bold text-gradient mb-2">{t('app.title')}</h1>
          <p className="text-xl text-muted-foreground">{t('app.loading')}</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            <h1 className="text-xl font-bold">{t('app.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="font-bold"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </Button>
            <Button
              variant={view === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView(view === 'dashboard' ? 'stages' : 'dashboard')}
            >
              {t('app.reports')}
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              {t('app.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="py-6">
        <AnimatePresence mode="wait">
          {view === 'stages' && (
            <motion.div
              key="stages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4"
            >
              <StageMap
                currentLevel={currentLevel}
                completedLevels={completedLevels}
                onSelectStage={handleSelectStage}
              />
            </motion.div>
          )}

          {view === 'game' && selectedStage && (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <GameContainer
                stageId={selectedStage}
                onBack={handleBackToStages}
                onComplete={handleGameComplete}
              />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard onBack={() => setView('stages')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default Index;
