import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// UI translations
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // App
    'app.title': 'تعلم الإنفوجرافيك',
    'app.loading': 'جاري التحميل...',
    'app.reports': '📊 التقارير',
    'app.logout': '🚪 خروج',

    // Auth
    'auth.login': 'سجل دخولك للمتابعة',
    'auth.signup': 'أنشئ حسابك الآن',
    'auth.username': 'اسم المستخدم',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.loginBtn': '🚀 تسجيل الدخول',
    'auth.signupBtn': '✨ إنشاء حساب',
    'auth.loading': '⏳ جاري التحميل...',
    'auth.noAccount': 'ليس لديك حساب؟ أنشئ حساباً جديداً',
    'auth.hasAccount': 'لديك حساب؟ سجل دخولك',
    'auth.loginError': 'خطأ في تسجيل الدخول',
    'auth.loginErrorDesc': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'auth.welcome': 'مرحباً بك!',
    'auth.loginSuccess': 'تم تسجيل الدخول بنجاح',
    'auth.usernameError': 'خطأ',
    'auth.usernameErrorDesc': 'يرجى إدخال اسم المستخدم',
    'auth.signupError': 'خطأ في إنشاء الحساب',
    'auth.signupSuccess': 'تم إنشاء الحساب!',
    'auth.signupSuccessDesc': 'يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب',
    'auth.unexpectedError': 'حدث خطأ غير متوقع',

    // Stage Map
    'stages.title': '🎮 رحلة التعلم',
    'stages.current': 'الحالي',
    'stages.completed': 'مكتمل',
    'stages.locked': 'مقفل',

    // Game types
    'game.matching': 'لعبة التوصيل',
    'game.mcq': 'اختيار من متعدد',
    'game.fillblank': 'أكمل الفراغ',
    'game.dragdrop': 'ترتيب العناصر',

    // Game Container
    'game.back': '→ العودة للقائمة',
    'game.stageNotFound': 'المرحلة غير موجودة',
    'game.goBack': 'العودة',
    'game.stage': 'المرحلة',
    'game.startGame': '🎮 ابدأ اللعبة الآن!',
    'game.keyPoints': 'النقاط الأساسية:',
    'game.cameraEnabled': 'تم تفعيل الكاميرا',
    'game.cameraDesc': 'سيتم تحليل تعابيرك أثناء اللعب',
    'game.cameraFailed': 'فشل تشغيل الكاميرا',
    'game.cameraFailedDesc': 'يرجى السماح بالوصول للكاميرا',
    'game.wellDone': 'أحسنت!',
    'game.completedStage': 'أكملت المرحلة',
    'game.dominantEmotion': 'الشعور السائد:',
    'game.emotionRecorded': 'تم تسجيل شعورك في المرحلة',

    // Matching Game
    'matching.title': '🔗 لعبة التوصيل',
    'matching.desc': 'اختر المفهوم ثم اختر الرمز المناسب له',
    'matching.concepts': '📝 المفاهيم',
    'matching.answers': '🎯 الإجابات',
    'matching.complete': 'أكملت جميع التوصيلات بنجاح',

    // MCQ Game
    'mcq.title': '📝 اختيار من متعدد',
    'mcq.question': 'السؤال',
    'mcq.of': 'من',
    'mcq.correct': 'إجابة صحيحة! 🎉',
    'mcq.wrong': 'إجابة خاطئة',
    'mcq.correctAnswer': 'الإجابة الصحيحة:',
    'mcq.next': 'السؤال التالي ➡️',
    'mcq.finish': 'إنهاء 🏁',
    'mcq.score': 'النتيجة:',
    'mcq.optionA': 'أ',
    'mcq.optionB': 'ب',
    'mcq.optionC': 'ج',
    'mcq.optionD': 'د',

    // Fill Blank Game
    'fill.title': '✏️ أكمل الفراغ',
    'fill.question': 'السؤال',
    'fill.of': 'من',

    // Drag Drop Game
    'drag.title': '🎯 رتب العناصر',
    'drag.desc': 'انقر على عنصر ثم انقر على عنصر آخر لتبديل مواقعهما',
    'drag.selected': '✨ تم اختيار عنصر - انقر على عنصر آخر للتبديل',
    'drag.swapHint': 'اختر العنصر للتبديل',
    'drag.check': '✔️ تحقق من الترتيب',
    'drag.score': 'النتيجة:',
    'drag.excellent': 'ممتاز! المتابعة ➡️',
    'drag.retry': '🔄 حاول مرة أخرى',
    'drag.continue': 'المتابعة ➡️',

    // Dashboard
    'dash.loading': 'جاري تحميل البيانات...',
    'dash.backToGame': '→ العودة للعبة',
    'dash.title': 'لوحة التقدم',
    'dash.currentLevel': 'المستوى الحالي:',
    'dash.of10': 'من 10',
    'dash.completedStages': 'مراحل مكتملة',
    'dash.attempts': 'محاولات',
    'dash.minutesPlayed': 'دقيقة لعب',
    'dash.emotionAnalysis': 'تحليل مشاعر',
    'dash.stageResults': 'نتائج المراحل',
    'dash.emotionDist': 'تحليل المشاعر',
    'dash.noEmotionData': 'لا توجد بيانات مشاعر بعد',
    'dash.activityLog': 'سجل النشاط',
    'dash.noActivity': 'لم تبدأ اللعب بعد',
    'dash.chartScore': 'النتيجة',
    'dash.chartRequired': 'المطلوب',
    'dash.gameType': 'نوع اللعبة',
    'dash.scoreLabel': 'النتيجة:',

    // Emotion Display
    'emotion.loading': 'جارٍ التحميل...',
    'emotion.analyzing': 'جارٍ التحليل...',

    // Emotions
    'emotion.happy': 'سعيد',
    'emotion.neutral': 'محايد',
    'emotion.sad': 'حزين',
    'emotion.angry': 'غضب',
    'emotion.surprised': 'مندهش',
    'emotion.fearful': 'خائف',
    'emotion.disgusted': 'ملل',
  },
  en: {
    // App
    'app.title': 'Learn Infographics',
    'app.loading': 'Loading...',
    'app.reports': '📊 Reports',
    'app.logout': '🚪 Logout',

    // Auth
    'auth.login': 'Sign in to continue',
    'auth.signup': 'Create your account',
    'auth.username': 'Username',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginBtn': '🚀 Sign In',
    'auth.signupBtn': '✨ Create Account',
    'auth.loading': '⏳ Loading...',
    'auth.noAccount': "Don't have an account? Create one",
    'auth.hasAccount': 'Already have an account? Sign in',
    'auth.loginError': 'Login Error',
    'auth.loginErrorDesc': 'Invalid email or password',
    'auth.welcome': 'Welcome!',
    'auth.loginSuccess': 'Logged in successfully',
    'auth.usernameError': 'Error',
    'auth.usernameErrorDesc': 'Please enter a username',
    'auth.signupError': 'Signup Error',
    'auth.signupSuccess': 'Account Created!',
    'auth.signupSuccessDesc': 'Please check your email to verify your account',
    'auth.unexpectedError': 'An unexpected error occurred',

    // Stage Map
    'stages.title': '🎮 Learning Journey',
    'stages.current': 'Current',
    'stages.completed': 'Completed',
    'stages.locked': 'Locked',

    // Game types
    'game.matching': 'Matching Game',
    'game.mcq': 'Multiple Choice',
    'game.fillblank': 'Fill in the Blank',
    'game.dragdrop': 'Sort Items',

    // Game Container
    'game.back': '← Back to Menu',
    'game.stageNotFound': 'Stage not found',
    'game.goBack': 'Go Back',
    'game.stage': 'Stage',
    'game.startGame': '🎮 Start Game!',
    'game.keyPoints': 'Key Points:',
    'game.cameraEnabled': 'Camera Enabled',
    'game.cameraDesc': 'Your expressions will be analyzed during play',
    'game.cameraFailed': 'Camera Failed',
    'game.cameraFailedDesc': 'Please allow camera access',
    'game.wellDone': 'Well Done!',
    'game.completedStage': 'Completed Stage',
    'game.dominantEmotion': 'Dominant Emotion:',
    'game.emotionRecorded': 'Your emotion was recorded for stage',

    // Matching Game
    'matching.title': '🔗 Matching Game',
    'matching.desc': 'Select a concept then match it with the correct answer',
    'matching.concepts': '📝 Concepts',
    'matching.answers': '🎯 Answers',
    'matching.complete': 'All matches completed successfully!',

    // MCQ Game
    'mcq.title': '📝 Multiple Choice',
    'mcq.question': 'Question',
    'mcq.of': 'of',
    'mcq.correct': 'Correct! 🎉',
    'mcq.wrong': 'Wrong answer',
    'mcq.correctAnswer': 'Correct answer:',
    'mcq.next': 'Next Question ➡️',
    'mcq.finish': 'Finish 🏁',
    'mcq.score': 'Score:',
    'mcq.optionA': 'A',
    'mcq.optionB': 'B',
    'mcq.optionC': 'C',
    'mcq.optionD': 'D',

    // Fill Blank Game
    'fill.title': '✏️ Fill in the Blank',
    'fill.question': 'Question',
    'fill.of': 'of',

    // Drag Drop Game
    'drag.title': '🎯 Sort the Items',
    'drag.desc': 'Tap an item then tap another to swap their positions',
    'drag.selected': '✨ Item selected - tap another to swap',
    'drag.swapHint': 'Select item to swap',
    'drag.check': '✔️ Check Order',
    'drag.score': 'Score:',
    'drag.excellent': 'Excellent! Continue ➡️',
    'drag.retry': '🔄 Try Again',
    'drag.continue': 'Continue ➡️',

    // Dashboard
    'dash.loading': 'Loading data...',
    'dash.backToGame': '← Back to Game',
    'dash.title': 'Progress Dashboard',
    'dash.currentLevel': 'Current Level:',
    'dash.of10': 'of 10',
    'dash.completedStages': 'Completed Stages',
    'dash.attempts': 'Attempts',
    'dash.minutesPlayed': 'Minutes Played',
    'dash.emotionAnalysis': 'Emotion Analysis',
    'dash.stageResults': 'Stage Results',
    'dash.emotionDist': 'Emotion Analysis',
    'dash.noEmotionData': 'No emotion data yet',
    'dash.activityLog': 'Activity Log',
    'dash.noActivity': 'No activity yet',
    'dash.chartScore': 'Score',
    'dash.chartRequired': 'Required',
    'dash.gameType': 'Game Type',
    'dash.scoreLabel': 'Score:',

    // Emotion Display
    'emotion.loading': 'Loading...',
    'emotion.analyzing': 'Analyzing...',

    // Emotions
    'emotion.happy': 'Happy',
    'emotion.neutral': 'Neutral',
    'emotion.sad': 'Sad',
    'emotion.angry': 'Angry',
    'emotion.surprised': 'Surprised',
    'emotion.fearful': 'Fearful',
    'emotion.disgusted': 'Bored',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    handleSetLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, handleSetLanguage]);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
