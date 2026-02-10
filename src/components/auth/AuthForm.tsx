import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: t('auth.loginError'), description: t('auth.loginErrorDesc'), variant: "destructive" });
        } else {
          toast({ title: t('auth.welcome'), description: t('auth.loginSuccess') });
        }
      } else {
        if (!username.trim()) {
          toast({ title: t('auth.usernameError'), description: t('auth.usernameErrorDesc'), variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          toast({ title: t('auth.signupError'), description: error.message, variant: "destructive" });
        } else {
          toast({ title: t('auth.signupSuccess'), description: t('auth.signupSuccessDesc') });
        }
      }
    } catch (err) {
      toast({ title: t('auth.usernameError'), description: t('auth.unexpectedError'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="font-bold">
              {language === 'ar' ? 'EN' : 'عربي'}
            </Button>
          </div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            🎨
          </motion.div>
          <CardTitle className="text-3xl font-bold text-gradient">
            {t('app.title')}
          </CardTitle>
          <CardDescription className="text-lg">
            {isLogin ? t('auth.login') : t('auth.signup')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <Input
                  type="text"
                  placeholder={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-lg py-6"
                  required={!isLogin}
                />
              </motion.div>
            )}
            <Input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg py-6"
              required
            />
            <Input
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-lg py-6"
              required
            />
            <Button
              type="submit"
              className="w-full btn-game gradient-primary text-xl py-6"
              disabled={loading}
            >
              {loading ? t('auth.loading') : isLogin ? t('auth.loginBtn') : t('auth.signupBtn')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline text-lg font-medium"
            >
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
