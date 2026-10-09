import type { ChoiceKey, QuizResult, Language } from './types';
import { ARCHETYPE_PROFILES, DEFAULT_METRICS, QUIZ_QUESTIONS } from './quizData';

export function calculateQuizResult(answers: Record<number, ChoiceKey>): QuizResult {
  const counts: Record<ChoiceKey, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };

  Object.values(answers).forEach((choice) => {
    if (counts[choice] !== undefined) {
      counts[choice] += 1;
    }
  });

  const sortedChoices = (Object.keys(counts) as ChoiceKey[]).sort((a, b) => counts[b] - counts[a]);
  const primaryArchetype = sortedChoices[0];
  const secondaryCandidate = sortedChoices[1];
  const isDual = counts[primaryArchetype] === counts[secondaryCandidate] && counts[primaryArchetype] > 0;

  // Calculate dynamic overall charisma & intuitive harmony score
  // Baseline is 88%, plus weighted variance depending on distribution
  const totalAnswered = Object.keys(answers).length;
  const dominanceRatio = totalAnswered > 0 ? counts[primaryArchetype] / totalAnswered : 0.4;
  const overallScore = Math.min(99, Math.max(86, Math.round(86 + dominanceRatio * 13 + (totalAnswered % 3))));

  // Dynamic metrics adjustment based on key behavioral questions
  // Q12, Q13, Q14, Q20 affect honesty/clarity
  let honestyBonus = 0;
  if (answers[12] === 'A') honestyBonus += 2;
  if (answers[13] === 'A') honestyBonus += 2;
  if (answers[20] === 'A') honestyBonus += 3;
  const honestyPercentage = Math.min(98, 90 + honestyBonus);

  // Q11, Q22, Q23 affect appreciation
  let appreciationBonus = 0;
  if (answers[11] === 'B') appreciationBonus += 3;
  if (answers[22] === 'B') appreciationBonus += 3;
  if (answers[23] === 'B' || answers[23] === 'A') appreciationBonus += 2;
  const appreciationPercentage = Math.min(98, 86 + appreciationBonus);

  // Q6, Q16, Q19 affect privacy
  let privacyBonus = 0;
  if (answers[6] === 'A' || answers[6] === 'D') privacyBonus += 3;
  if (answers[16] === 'A' || answers[16] === 'D') privacyBonus += 3;
  if (answers[19] === 'B') privacyBonus += 2;
  const privacyPercentage = Math.min(98, 84 + privacyBonus);

  const dynamicMetrics = DEFAULT_METRICS.map(m => {
    if (m.id === 'honesty') return { ...m, percentage: honestyPercentage };
    if (m.id === 'appreciation') return { ...m, percentage: appreciationPercentage };
    if (m.id === 'privacy') return { ...m, percentage: privacyPercentage };
    return m;
  });

  return {
    answers,
    counts,
    primaryArchetype,
    secondaryArchetype: isDual ? secondaryCandidate : undefined,
    isDual,
    overallScore,
    metrics: dynamicMetrics,
    completedAt: new Date().toISOString()
  };
}

export function generateShareText(result: QuizResult, lang: Language): string {
  const primary = ARCHETYPE_PROFILES[result.primaryArchetype];
  const secondary = result.secondaryArchetype ? ARCHETYPE_PROFILES[result.secondaryArchetype] : null;

  const isAr = lang === 'ar';

  const titleHeader = isAr 
    ? `🔮 نتيجة اختبار بوصلة الشخصية والوعي الداخلي` 
    : `🔮 Personality Compass & Inner Alignment Assessment Result`;

  const archetypeTitle = result.isDual && secondary
    ? (isAr 
        ? `✨ النمط المزدوج: ${primary.title.ar} + ${secondary.title.ar}` 
        : `✨ Dual Archetype: ${primary.title.en} + ${secondary.title.en}`)
    : (isAr ? `✨ النمط الأساسي: ${primary.title.ar}` : `✨ Primary Archetype: ${primary.title.en}`);

  const psychTitle = isAr
    ? `👑 اللقب النفسي: ${primary.psychTitle.ar}`
    : `👑 Psychological Title: ${primary.psychTitle.en}`;

  const scoreText = isAr
    ? `🎯 المؤشر العام: ${result.overallScore}% (حضور كاريزمي وتناغم حدسي استثنائي)`
    : `🎯 Charisma & Intuitive Harmony Index: ${result.overallScore}%`;

  const summaryHeader = isAr ? `📋 ملخص التحليل:` : `📋 Personality Analysis Summary:`;
  const compassText = isAr ? `• البوصلة العامة: ${primary.generalCompass.ar}` : `• Core Compass: ${primary.generalCompass.en}`;
  const mindText = isAr ? `• طريقة التفكير والردود: ${primary.thoughtAndReactions.ar}` : `• Mindset & Banter: ${primary.thoughtAndReactions.en}`;
  const relText = isAr ? `• في العلاقات والمشاعر: ${primary.relationshipsAndEmotions.ar}` : `• Relationships: ${primary.relationshipsAndEmotions.en}`;
  const spaceText = isAr ? `• المساحة الخاصة: ${primary.personalSpace.ar}` : `• Personal Space: ${primary.personalSpace.en}`;

  const metricsHeader = isAr ? `📊 القياسات النفسية الإضافية:` : `📊 Core Psychological Metrics:`;
  const metricsList = result.metrics.map(m => {
    return isAr 
      ? `▫️ ${m.title.ar}: ${m.percentage}%\n   ${m.description.ar}`
      : `▫️ ${m.title.en}: ${m.percentage}%\n   ${m.description.en}`;
  }).join('\n\n');

  const answersHeader = isAr 
    ? `📝 سجل الأجوبة الكامل لجميع الأسئلة (25/25):` 
    : `📝 Complete Answers Log (25/25):`;

  const answersList = QUIZ_QUESTIONS.map(q => {
    const choice = result.answers[q.id];
    const optionText = choice && q.options[choice] 
      ? (isAr ? q.options[choice].ar : q.options[choice].en)
      : (isAr ? 'لم تتم الإجابة' : 'Unanswered');
    const choiceLabel = choice || '-';
    return isAr
      ? `س${q.id}: [${choiceLabel}] ${optionText}`
      : `Q${q.id}: [${choiceLabel}] ${optionText}`;
  }).join('\n');

  const footer = isAr
    ? `—\nتم إنشاء هذا التقرير عبر Yashoo LAB | بوصلة الشخصية`
    : `—\nGenerated via Yashoo LAB | The Personality Compass`;

  return [
    titleHeader,
    '==============================',
    archetypeTitle,
    psychTitle,
    scoreText,
    '',
    summaryHeader,
    compassText,
    mindText,
    relText,
    spaceText,
    '',
    metricsHeader,
    metricsList,
    '',
    answersHeader,
    '------------------------------',
    answersList,
    '',
    footer
  ].join('\n');
}
