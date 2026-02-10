import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useProgress } from '@/hooks/useProgress';
import { useLanguage } from '@/hooks/useLanguage';
import { getStagesByLanguage, getGameTypeNameByLang } from '@/data/stages';

const emotionColors: Record<string, string> = {
  happy: 'hsl(142 71% 45%)', neutral: 'hsl(220 9% 46%)', sad: 'hsl(220 70% 50%)',
  angry: 'hsl(0 84% 60%)', surprised: 'hsl(38 92% 50%)', fearful: 'hsl(262 83% 58%)', disgusted: 'hsl(172 66% 50%)'
};

interface DashboardProps { onBack: () => void; }

export const Dashboard = ({ onBack }: DashboardProps) => {
  const { getProgress, getEmotionLogs, getProfile } = useProgress();
  const { t, language } = useLanguage();
  const stages = getStagesByLanguage(language);
  const [progress, setProgress] = useState<any[]>([]);
  const [emotions, setEmotions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const emotionLabels: Record<string, string> = {
    happy: `${t('emotion.happy')} 😊`, neutral: `${t('emotion.neutral')} 😐`, sad: `${t('emotion.sad')} 😢`,
    angry: `${t('emotion.angry')} 😠`, surprised: `${t('emotion.surprised')} 😲`, fearful: `${t('emotion.fearful')} 😨`, disgusted: `${t('emotion.disgusted')} 😴`
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [progressRes, emotionsRes, profileRes] = await Promise.all([getProgress(), getEmotionLogs(), getProfile()]);
      if (progressRes.data) setProgress(progressRes.data);
      if (emotionsRes.data) setEmotions(emotionsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
      setLoading(false);
    };
    loadData();
  }, [getProgress, getEmotionLogs, getProfile]);

  const stageScores = stages.map(stage => {
    const stageProgress = progress.filter(p => p.level_number === stage.id);
    const bestScore = stageProgress.length > 0 ? Math.max(...stageProgress.map(p => p.score)) : 0;
    return { name: `${language === 'ar' ? 'م' : 'S'}${stage.id}`, fullName: stage.title, score: bestScore, required: stage.requiredScore };
  });

  const emotionCounts = emotions.reduce((acc, e) => { acc[e.emotion] = (acc[e.emotion] || 0) + 1; return acc; }, {} as Record<string, number>);
  const emotionChartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
    name: emotionLabels[emotion] || emotion, value: count as number, color: emotionColors[emotion] || 'hsl(220 9% 46%)'
  }));

  const uniqueCompletedStages = [...new Set(progress.filter(p => p.is_completed).map(p => p.level_number))].length;
  const totalTimeSpent = progress.reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0);

  const chartConfig = {
    score: { label: t('dash.chartScore'), color: 'hsl(var(--primary))' },
    required: { label: t('dash.chartRequired'), color: 'hsl(var(--muted))' }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-6xl animate-bounce mb-4">📊</div><p className="text-xl">{t('dash.loading')}</p></div>
    </div>;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="text-lg">{t('dash.backToGame')}</Button>
          <h1 className="text-3xl font-bold text-gradient">{t('dash.title')}</h1>
        </div>

        {profile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 border-2 gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="text-6xl">👤</div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.username}</h2>
                    <p className="text-lg opacity-90">{t('dash.currentLevel')} {profile.current_level} {t('dash.of10')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🏆', value: uniqueCompletedStages, label: t('dash.completedStages'), color: 'text-primary', delay: 0.1 },
            { icon: '🎮', value: progress.length, label: t('dash.attempts'), color: 'text-secondary', delay: 0.2 },
            { icon: '⏱️', value: Math.round(totalTimeSpent / 60), label: t('dash.minutesPlayed'), color: 'text-accent', delay: 0.3 },
            { icon: '😊', value: emotions.length, label: t('dash.emotionAnalysis'), color: 'text-success', delay: 0.4 },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay }}>
              <Card className="text-center card-hover">
                <CardContent className="p-6">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><span>📈</span>{t('dash.stageResults')}</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={stageScores}>
                    <XAxis dataKey="name" /><YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={4} />
                    <Bar dataKey="required" fill="hsl(var(--muted))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><span>😊</span>{t('dash.emotionDist')}</CardTitle></CardHeader>
              <CardContent>
                {emotionChartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={emotionChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {emotionChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground"><p>{t('dash.noEmotionData')}</p></div>}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><span>📋</span>{t('dash.activityLog')}</CardTitle></CardHeader>
            <CardContent>
              {progress.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {progress.slice(0, 20).map((p, index) => {
                    const stage = stages.find(s => s.id === p.level_number);
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-xl ${p.is_completed ? 'bg-success/10' : 'bg-muted/50'}`}>
                        <span className="text-3xl">{stage?.icon || '📚'}</span>
                        <div className="flex-1">
                          <p className="font-bold">{stage?.title || `${t('game.stage')} ${p.level_number}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {getGameTypeNameByLang(p.game_type, language)} • {t('dash.scoreLabel')} {p.score}
                          </p>
                        </div>
                        <span className="text-2xl">{p.is_completed ? '✅' : '🔄'}</span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : <div className="text-center py-8 text-muted-foreground"><p>{t('dash.noActivity')}</p></div>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
