/**
 * Deterministic AI screening answer evaluation (AI-27).
 *
 * Scores stay on the existing 0–maxPoints scale (default 10) used by
 * ScreeningQuestion.maxPoints and the previous Math.random() * 10 placeholder.
 * Empty answers are UNANSWERED with a null score so they cannot drag the
 * overall interview average down.
 */

export type ScreeningSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface ScreeningQuestionContext {
  questionText: string;
  questionType?: string | null;
  maxPoints?: number | null;
  correctAnswer?: string | null;
  sampleAnswer?: string | null;
  evaluationGuidelines?: string | null;
}

export interface ScreeningAnswerInput {
  textResponse?: string | null;
  codeResponse?: string | null;
  transcription?: string | null;
  selectedOptions?: string[] | null;
}

export interface ScreeningEvaluation {
  status: 'ANALYZED' | 'UNANSWERED';
  aiScore: number | null;
  aiSentiment: ScreeningSentiment | null;
  aiConfidenceLevel: number | null;
  aiSummary: string;
  aiScoreBreakdown: Record<string, number | string> | null;
  aiKeyPoints: string[];
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this',
  'these', 'those', 'to', 'of', 'in', 'on', 'for', 'with', 'at', 'by', 'from',
  'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'its', 'you',
  'your', 'we', 'our', 'they', 'them', 'their', 'i', 'me', 'my', 'do', 'does',
  'did', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should',
  'about', 'into', 'over', 'after', 'before', 'not', 'no', 'yes', 'how', 'what',
  'when', 'where', 'which', 'who', 'why',
]);

const POSITIVE_WORDS = [
  'excellent', 'strong', 'successfully', 'achieved', 'improved', 'enjoy',
  'passionate', 'effective', 'collaborated', 'collaboration', 'proud',
  'growth', 'reliable', 'clear', 'confident', 'led', 'delivered', 'optimized',
  'solved', 'success',
];

const NEGATIVE_WORDS = [
  'unfortunately', 'failed', 'struggle', 'struggled', 'difficult', 'hate',
  'poor', 'unable', 'never', 'worst', 'conflict', 'confused', 'unclear',
  'mistake', 'delay', 'blocked',
];

const DEPTH_MARKERS = [
  'for example', 'e.g.', 'eg.', 'in my experience', 'i implemented',
  'i built', 'i led', 'we shipped', 'measured', 'because', 'therefore',
  'result', 'impact',
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function extractAnswerText(answer: ScreeningAnswerInput): string {
  const parts: string[] = [];
  if (answer.textResponse) parts.push(answer.textResponse);
  if (answer.codeResponse) parts.push(answer.codeResponse);
  if (answer.transcription) parts.push(answer.transcription);
  if (answer.selectedOptions?.length) parts.push(answer.selectedOptions.join(' '));
  return parts.join('\n').trim();
}

export function isUnanswered(answer: ScreeningAnswerInput): boolean {
  return extractAnswerText(answer).length === 0;
}

function lexicalOverlap(sourceTokens: string[], answerTokens: string[]): number {
  if (sourceTokens.length === 0) return 0.5;
  const answerSet = new Set(answerTokens);
  const hits = sourceTokens.filter((token) => answerSet.has(token)).length;
  return hits / sourceTokens.length;
}

function depthScore(rawText: string): number {
  const words = rawText.split(/\s+/).filter(Boolean).length;
  return clamp(words / 60, 0, 1);
}

function specificityScore(rawText: string): number {
  const lower = rawText.toLowerCase();
  let points = 0;
  if (/\d/.test(rawText)) points += 0.25;
  if (DEPTH_MARKERS.some((marker) => lower.includes(marker))) points += 0.4;
  if (/[A-Z]{2,}|[a-z]+[A-Z]/.test(rawText) || /https?:\/\//.test(rawText)) points += 0.15;
  const uniqueContent = new Set(tokenize(rawText)).size;
  points += clamp(uniqueContent / 25, 0, 0.2);
  return clamp(points, 0, 1);
}

function countLexiconHits(text: string, lexicon: string[]): number {
  const lower = ` ${text.toLowerCase()} `;
  return lexicon.reduce((count, word) => (lower.includes(` ${word} `) ? count + 1 : count), 0);
}

export function deriveSentiment(text: string): ScreeningSentiment {
  const positive = countLexiconHits(text, POSITIVE_WORDS);
  const negative = countLexiconHits(text, NEGATIVE_WORDS);
  const net = positive - negative;
  if (net >= 2) return 'POSITIVE';
  if (net <= -2) return 'NEGATIVE';
  return 'NEUTRAL';
}

function normalizeChoice(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function evaluateMultipleChoice(
  answer: ScreeningAnswerInput,
  question: ScreeningQuestionContext,
  maxPoints: number
): ScreeningEvaluation | null {
  if (!question.correctAnswer || !answer.selectedOptions?.length) {
    return null;
  }

  const expected = normalizeChoice(question.correctAnswer);
  const selected = answer.selectedOptions.map(normalizeChoice);
  const isCorrect = selected.includes(expected) || selected.join(', ') === expected;
  const score = isCorrect ? maxPoints : 0;

  return {
    status: 'ANALYZED',
    aiScore: round1(score),
    aiSentiment: 'NEUTRAL',
    aiConfidenceLevel: isCorrect ? 0.98 : 0.9,
    aiSummary: isCorrect
      ? 'Selected option matches the expected answer.'
      : 'Selected option does not match the expected answer.',
    aiScoreBreakdown: {
      scale: `0-${maxPoints}`,
      method: 'multiple-choice',
      correct: isCorrect ? 1 : 0,
    },
    aiKeyPoints: selected,
  };
}

export function evaluationFromModelOutput(
  output: {
    aiScore?: number;
    aiSentiment?: string;
    aiConfidenceLevel?: number;
    aiSummary?: string;
  },
  maxPoints: number,
  fallback: ScreeningEvaluation
): ScreeningEvaluation {
  const score = typeof output.aiScore === 'number' ? round1(clamp(output.aiScore, 0, maxPoints)) : fallback.aiScore;
  const sentiment = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(String(output.aiSentiment))
    ? (output.aiSentiment as ScreeningSentiment)
    : fallback.aiSentiment;
  const confidence =
    typeof output.aiConfidenceLevel === 'number'
      ? round2(clamp(output.aiConfidenceLevel, 0, 1))
      : fallback.aiConfidenceLevel;

  return {
    status: 'ANALYZED',
    aiScore: score,
    aiSentiment: sentiment,
    aiConfidenceLevel: confidence,
    aiSummary: output.aiSummary || fallback.aiSummary,
    aiScoreBreakdown: {
      ...(fallback.aiScoreBreakdown || {}),
      method: 'ai-02-generateStructured',
    },
    aiKeyPoints: fallback.aiKeyPoints,
  };
}

export function evaluateScreeningAnswer(
  answer: ScreeningAnswerInput,
  question: ScreeningQuestionContext
): ScreeningEvaluation {
  const maxPoints = question.maxPoints && question.maxPoints > 0 ? question.maxPoints : 10;

  if (isUnanswered(answer)) {
    return {
      status: 'UNANSWERED',
      aiScore: null,
      aiSentiment: null,
      aiConfidenceLevel: null,
      aiSummary: 'Response was empty and was stored as unanswered, not scored.',
      aiScoreBreakdown: null,
      aiKeyPoints: [],
    };
  }

  const mcq = evaluateMultipleChoice(answer, question, maxPoints);
  if (mcq) return mcq;

  const rawText = extractAnswerText(answer);
  const answerTokens = tokenize(rawText);
  const questionTokens = tokenize(question.questionText || '');
  const sampleTokens = tokenize(question.sampleAnswer || '');
  const guidelineTokens = tokenize(question.evaluationGuidelines || '');

  const relevance = Math.max(
    lexicalOverlap(questionTokens, answerTokens),
    sampleTokens.length ? lexicalOverlap(sampleTokens, answerTokens) : 0,
    guidelineTokens.length ? lexicalOverlap(guidelineTokens, answerTokens) : 0
  );
  const depth = depthScore(rawText);
  const specificity = specificityScore(rawText);
  const quality = clamp(0.55 * relevance + 0.3 * depth + 0.15 * specificity, 0, 1);
  const score = round1(quality * maxPoints);
  const sentiment = deriveSentiment(rawText);
  const confidence = round2(clamp(0.45 + 0.35 * relevance + 0.2 * depth, 0.4, 0.99));

  return {
    status: 'ANALYZED',
    aiScore: score,
    aiSentiment: sentiment,
    aiConfidenceLevel: confidence,
    aiSummary:
      `Scored ${score}/${maxPoints} from relevance (${round2(relevance)}), ` +
      `depth (${round2(depth)}) and specificity (${round2(specificity)}).`,
    aiScoreBreakdown: {
      scale: `0-${maxPoints}`,
      relevance: round2(relevance),
      depth: round2(depth),
      specificity: round2(specificity),
      quality: round2(quality),
    },
    aiKeyPoints: [...new Set(answerTokens.filter((token) => questionTokens.includes(token)))].slice(0, 8),
  };
}

export function toPrismaEvaluationFields(evaluation: ScreeningEvaluation) {
  return {
    status: evaluation.status,
    aiScore: evaluation.aiScore,
    aiSentiment: evaluation.aiSentiment,
    aiConfidenceLevel: evaluation.aiConfidenceLevel,
    aiSummary: evaluation.aiSummary,
    aiScoreBreakdown: evaluation.aiScoreBreakdown ?? undefined,
    aiKeyPoints: evaluation.aiKeyPoints,
  };
}

/** Mean of stored response scores. Null / unanswered scores are excluded. */
export function aggregateScreeningOverallScore(scores: Array<number | null | undefined>): number | null {
  const numeric = scores.filter((score): score is number => typeof score === 'number' && !Number.isNaN(score));
  if (numeric.length === 0) return null;
  return round2(numeric.reduce((sum, score) => sum + score, 0) / numeric.length);
}
