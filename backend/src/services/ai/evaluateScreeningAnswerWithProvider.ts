import { generateStructured } from '../../integrations/ai';
import {
  evaluateScreeningAnswer,
  evaluationFromModelOutput,
  ScreeningAnswerInput,
  ScreeningEvaluation,
  ScreeningQuestionContext,
  extractAnswerText,
} from './screeningAnswerScoring';

const SCORE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['aiScore', 'aiSentiment', 'aiConfidenceLevel', 'aiSummary'],
  properties: {
    aiScore: { type: 'number', description: 'Score from 0 to maxPoints' },
    aiSentiment: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] },
    aiConfidenceLevel: { type: 'number', description: '0 to 1' },
    aiSummary: { type: 'string' },
  },
};

/**
 * Uses AI-02 generateStructured when AI_PROVIDER is set.
 * Falls back to the deterministic lexical scorer if the provider is missing or fails (AI-03 not complete).
 */
export async function evaluateScreeningAnswerWithProvider(
  answer: ScreeningAnswerInput,
  question: ScreeningQuestionContext
): Promise<ScreeningEvaluation> {
  const lexical = evaluateScreeningAnswer(answer, question);
  if (lexical.status === 'UNANSWERED') return lexical;
  if (!process.env.AI_PROVIDER) return lexical;

  const maxPoints = question.maxPoints && question.maxPoints > 0 ? question.maxPoints : 10;
  const text = extractAnswerText(answer);

  try {
    const result = await generateStructured<{
      aiScore: number;
      aiSentiment: string;
      aiConfidenceLevel: number;
      aiSummary: string;
    }>({
      system:
        'You score interview screening answers. Return JSON only. Keep aiScore on the 0-maxPoints scale.',
      prompt:
        `maxPoints=${maxPoints}\nQuestion: ${question.questionText}\nAnswer: ${text}`,
      schema: SCORE_SCHEMA,
      schemaName: 'screening_answer_score',
    });

    return evaluationFromModelOutput(result.output, maxPoints, lexical);
  } catch {
    return lexical;
  }
}
