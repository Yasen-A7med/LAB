export type Language = 'en' | 'ar';

export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface ChoiceOption {
  key: ChoiceKey;
  label: {
    en: string;
    ar: string;
  };
}

export interface QuestionItem {
  id: number;
  scenario: {
    en: string;
    ar: string;
  };
  options: Record<ChoiceKey, { en: string; ar: string }>;
}

export interface ArchetypeProfile {
  key: ChoiceKey;
  title: {
    en: string;
    ar: string;
  };
  psychTitle: {
    en: string;
    ar: string;
  };
  generalCompass: {
    en: string;
    ar: string;
  };
  thoughtAndReactions: {
    en: string;
    ar: string;
  };
  relationshipsAndEmotions: {
    en: string;
    ar: string;
  };
  personalSpace: {
    en: string;
    ar: string;
  };
  badgeColor: string;
  gradient: string;
  glowColor: string;
}

export interface MetricCard {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  percentage: number;
  description: {
    en: string;
    ar: string;
  };
}

export interface QuizResult {
  answers: Record<number, ChoiceKey>;
  counts: Record<ChoiceKey, number>;
  primaryArchetype: ChoiceKey;
  secondaryArchetype?: ChoiceKey;
  isDual: boolean;
  overallScore: number;
  metrics: MetricCard[];
  completedAt: string;
}
