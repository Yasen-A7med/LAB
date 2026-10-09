import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Sparkles, 
  Share2, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Heart, 
  Brain, 
  Award, 
  Copy, 
  ArrowLeft,
  Flame,
  Feather,
  Anchor,
  Crown
} from 'lucide-react';
import type { ChoiceKey, Language, QuizResult } from './types';
import { QUIZ_QUESTIONS, ARCHETYPE_PROFILES } from './quizData';
import { calculateQuizResult, generateShareText } from './scoring';

const STORAGE_KEY = 'yashoo_personality_compass_result';
const LANG_STORAGE_KEY = 'yashoo_personality_compass_lang';

interface PersonalityQuizAppProps {
  onBack: () => void;
}

export const PersonalityQuizApp: React.FC<PersonalityQuizAppProps> = ({ onBack }) => {
  // Language state (default is English as requested, persists choice)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  // Quiz state
  const [answers, setAnswers] = useState<Record<number, ChoiceKey>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showConfirmRetake, setShowConfirmRetake] = useState<boolean>(false);
  const [selectedPending, setSelectedPending] = useState<ChoiceKey | null>(null);

  // Initialize: If user already finished, immediately show result directly
  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(STORAGE_KEY);
      if (savedResult) {
        const parsed = JSON.parse(savedResult) as QuizResult;
        if (parsed && parsed.primaryArchetype && parsed.answers) {
          setResult(parsed);
          setAnswers(parsed.answers);
        }
      }
    } catch {
      // LocalStorage fallback gracefully
    }
  }, []);

  const toggleLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  }, []);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Handle choice selection with smooth transition
  const handleSelectChoice = useCallback((key: ChoiceKey) => {
    setSelectedPending(key);
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: key
    };
    setAnswers(updatedAnswers);

    // Auto-advance softly after brief tactile feedback
    setTimeout(() => {
      setSelectedPending(null);
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Finished all questions - compute result & persist immediately
        const computed = calculateQuizResult(updatedAnswers);
        setResult(computed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(computed));
      }
    }, 240);
  }, [answers, currentIndex, currentQuestion.id, totalQuestions]);

  // Keyboard navigation (1-4 or A-D)
  useEffect(() => {
    if (result) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') handleSelectChoice('A');
      else if (key === '2' || key === 'B') handleSelectChoice('B');
      else if (key === '3' || key === 'C') handleSelectChoice('C');
      else if (key === '4' || key === 'D') handleSelectChoice('D');
      else if (e.key === 'ArrowRight' && lang === 'en') {
        if (answers[currentQuestion.id] && currentIndex < totalQuestions - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' && lang === 'en') {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answers, currentIndex, currentQuestion.id, handleSelectChoice, lang, result, totalQuestions]);

  // Handle Share Result
  const handleShare = useCallback(() => {
    if (!result) return;
    const shareText = generateShareText(result, lang);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  }, [lang, result]);

  // Reset / Retake quiz
  const handleRetakeConfirm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setShowConfirmRetake(false);
  }, []);

  const isRTL = lang === 'ar';

  const archetypeIcons: Record<ChoiceKey, React.ElementType> = useMemo(() => ({
    A: Crown,
    B: Feather,
    C: Flame,
    D: Anchor
  }), []);

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-hidden`}
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title={lang === 'ar' ? 'العودة للمختبر' : 'Back to LAB'}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'المختبر' : 'LAB'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Compass className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                {lang === 'ar' ? 'بوصلة الشخصية' : 'Personality Compass'}
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {lang === 'ar' ? 'رحلة في عالمك الموازي' : 'Parallel Archetype Exploration'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls: Language Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => toggleLanguage('en')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>EN</span>
            </button>
            <button
              onClick={() => toggleLanguage('ar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                lang === 'ar'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>عربي</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!result ? (
            /* ========================================================================= */
            /* 1. QUIZ VIEW (QUESTIONS & CHOICES ONLY - ZERO ANALYSIS HINTS)             */
            /* ========================================================================= */
            <motion.div
              key="quiz-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-6"
            >
              {/* Progress and Counter */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {lang === 'ar' 
                        ? `السؤال ${currentIndex + 1} من ${totalQuestions}` 
                        : `Question ${currentIndex + 1} of ${totalQuestions}`}
                    </span>
                  </span>
                  <span className="text-purple-300 font-semibold">{progressPercent}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="mb-6">
                  <span className="inline-block text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-3">
                    {lang === 'ar' ? `سيناريو ${currentQuestion.id}` : `Scenario ${currentQuestion.id}`}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                    {lang === 'ar' ? currentQuestion.scenario.ar : currentQuestion.scenario.en}
                  </h2>
                </div>

                {/* 4 Choices */}
                <div className="grid grid-cols-1 gap-3.5">
                  {(['A', 'B', 'C', 'D'] as ChoiceKey[]).map((key, optIdx) => {
                    const option = currentQuestion.options[key];
                    const isSelected = answers[currentQuestion.id] === key;
                    const isPending = selectedPending === key;

                    const arabicLetters: Record<ChoiceKey, string> = {
                      A: 'أ',
                      B: 'ب',
                      C: 'ج',
                      D: 'د'
                    };

                    const badgeLabel = lang === 'ar' ? arabicLetters[key] : key;

                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleSelectChoice(key)}
                        className={`w-full text-start p-4 sm:p-5 rounded-xl border transition-all flex items-start gap-3.5 relative cursor-pointer group ${
                          isSelected || isPending
                            ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-500/60 text-white shadow-lg shadow-purple-500/10'
                            : 'bg-slate-800/40 hover:bg-slate-800/70 border-white/5 hover:border-white/20 text-slate-200'
                        }`}
                      >
                        {/* Choice Letter Badge */}
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                            isSelected || isPending
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                              : 'bg-white/5 group-hover:bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          {badgeLabel}
                        </div>

                        {/* Option Text */}
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm sm:text-base leading-relaxed">
                            {lang === 'ar' ? option.ar : option.en}
                          </p>
                        </div>

                        {/* Selected Indicator */}
                        <div className="shrink-0 pt-1">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected || isPending
                                ? 'border-purple-500 bg-purple-500 text-white'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {(isSelected || isPending) && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Subtle keyboard hint */}
                        <span className="hidden md:block absolute bottom-2 end-3 text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          [{optIdx + 1}]
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation Controls: Back / Skip */}
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      currentIndex === 0
                        ? 'opacity-40 cursor-not-allowed text-slate-600'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    <span>{lang === 'ar' ? 'السابق' : 'Previous'}</span>
                  </button>

                  <div className="text-xs text-slate-500 hidden sm:block">
                    {lang === 'ar' ? 'بدون تحليل مسبق - اختاري الأقرب ليكي تلقائياً' : 'Intuitive choice only • No mid-test analysis'}
                  </div>

                  <button
                    onClick={() => {
                      if (currentIndex < totalQuestions - 1) {
                        setCurrentIndex(prev => prev + 1);
                      }
                    }}
                    disabled={!answers[currentQuestion.id] || currentIndex === totalQuestions - 1}
                    className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      !answers[currentQuestion.id] || currentIndex === totalQuestions - 1
                        ? 'opacity-40 cursor-not-allowed text-slate-600'
                        : 'text-purple-300 hover:text-white hover:bg-purple-500/20'
                    }`}
                  >
                    <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* 2. RESULTS VIEW (PERSISTENT & INSTANT UPON RE-OPENING)                    */
            /* ========================================================================= */
            <motion.div
              key="result-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col gap-8 pb-12"
            >
              {/* Hero Banner: Archetype Announcement */}
              {(() => {
                const primary = ARCHETYPE_PROFILES[result.primaryArchetype];
                const secondary = result.secondaryArchetype ? ARCHETYPE_PROFILES[result.secondaryArchetype] : null;
                const IconComponent = archetypeIcons[result.primaryArchetype] || Crown;

                return (
                  <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl shadow-2xl ${primary.glowColor}`}>
                    {/* Glowing background orb */}
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-600/20 via-pink-600/10 to-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-start">
                      {/* Archetype Icon Emblem */}
                      <div className="relative shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-xl">
                          <IconComponent className="w-12 h-12 sm:w-14 sm:h-14 text-purple-400" />
                        </div>
                      </div>

                      {/* Header details */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${primary.badgeColor}`}>
                            {lang === 'ar' ? 'نمط شخصيتك' : 'Your Personality Profile'}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            {lang === 'ar' ? 'تم اكتمال الاختبار بنجاح' : 'Assessment Verified'}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                          {result.isDual && secondary 
                            ? (lang === 'ar' ? `${primary.title.ar} + ${secondary.title.ar}` : `${primary.title.en} & ${secondary.title.en}`)
                            : (lang === 'ar' ? primary.title.ar : primary.title.en)}
                        </h2>

                        <p className="text-sm sm:text-base font-medium text-purple-300">
                          {lang === 'ar' ? primary.psychTitle.ar : primary.psychTitle.en}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 min-w-[130px]">
                        <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">
                          {result.overallScore}%
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 text-center mt-1">
                          {lang === 'ar' ? 'مؤشر الكاريزما والتناغم' : 'Charisma & Harmony'}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar (Share + Retake) */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                      {/* Prominent Share Result Button */}
                      <button
                        onClick={handleShare}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer transform active:scale-95"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>{lang === 'ar' ? 'تم نسخ نتيجتك وأجوبتك!' : 'Copied to Clipboard!'}</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            <span>{lang === 'ar' ? 'شارك نتيجتك (نسخ التحليل والأجوبة)' : 'Share Your Result (Copy All)'}</span>
                          </>
                        )}
                      </button>

                      {/* Retake Button */}
                      <button
                        onClick={() => setShowConfirmRetake(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm transition-all cursor-pointer"
                        title={lang === 'ar' ? 'إعادة الاختبار من البداية' : 'Retake Quiz'}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إعادة الاختبار' : 'Retake Assessment'}</span>
                      </button>
                    </div>

                    {/* Copied feedback toast message */}
                    <AnimatePresence>
                      {isCopied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mt-3 text-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-4 rounded-lg"
                        >
                          {lang === 'ar' 
                            ? 'تم نسخ كامل النتيجة مع ملخص التحليل وقائمة جميع أجوبتك (25 سؤالاً) بنجاح!' 
                            : 'Result summary and all 25 answers copied to clipboard successfully!'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}

              {/* 4 In-Depth Analysis Pillars */}
              {(() => {
                const primary = ARCHETYPE_PROFILES[result.primaryArchetype];

                const pillars = [
                  {
                    id: 'compass',
                    title: { en: 'Core Compass & Aura', ar: 'البوصلة العامة والهالة' },
                    desc: primary.generalCompass,
                    icon: Compass,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10 border-amber-500/20'
                  },
                  {
                    id: 'mind',
                    title: { en: 'Mindset & Banter Style', ar: 'طريقة التفكير والردود' },
                    desc: primary.thoughtAndReactions,
                    icon: Brain,
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/10 border-purple-500/20'
                  },
                  {
                    id: 'relationships',
                    title: { en: 'Relationships & Devotion', ar: 'في العلاقات والمشاعر' },
                    desc: primary.relationshipsAndEmotions,
                    icon: Heart,
                    color: 'text-rose-400',
                    bg: 'bg-rose-500/10 border-rose-500/20'
                  },
                  {
                    id: 'space',
                    title: { en: 'Sacred Boundaries & Space', ar: 'المساحة الخاصة والحدود' },
                    desc: primary.personalSpace,
                    icon: Shield,
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/10 border-cyan-500/20'
                  }
                ];

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pillars.map((p) => {
                      const Icon = p.icon;
                      return (
                        <div
                          key={p.id}
                          className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-3 hover:border-white/20 transition-all shadow-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${p.bg}`}>
                              <Icon className={`w-4 h-4 ${p.color}`} />
                            </div>
                            <h3 className="text-base font-bold text-white">
                              {lang === 'ar' ? p.title.ar : p.title.en}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {lang === 'ar' ? p.desc.ar : p.desc.en}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Psychological Measurement Indices */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ar' ? 'بطاقة القياسات النفسية الإضافية' : 'Core Psychological Metric Indices'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.metrics.map((metric) => (
                    <div 
                      key={metric.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          {lang === 'ar' ? metric.title.ar : metric.title.en}
                        </span>
                        <span className="text-sm font-black text-purple-300">
                          {metric.percentage}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                          style={{ width: `${metric.percentage}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-400 leading-normal mt-1">
                        {lang === 'ar' ? metric.description.ar : metric.description.en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>


              {/* Share Banner Bottom Reminder */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'نسخ كافة الأجوبة والتحليل للمشاركة' : 'Copy All Answers & Analysis to Share'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Modal for Retake */}
      <AnimatePresence>
        {showConfirmRetake && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {lang === 'ar' ? 'إعادة الاختبار من البداية؟' : 'Retake Assessment?'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' 
                    ? 'سيتم مسح النتيجة الحالية والبدء من السؤال الأول مجدداً.' 
                    : 'This will reset your saved answers and start fresh from Question 1.'}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setShowConfirmRetake(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleRetakeConfirm}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  {lang === 'ar' ? 'نعم، إعادة' : 'Yes, Reset'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalityQuizApp;
