import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  aggregateScreeningOverallScore,
  evaluateScreeningAnswer,
  isUnanswered,
} from './screeningAnswerScoring';

const samples = JSON.parse(
  readFileSync(resolve(__dirname, '../../../testdata/ai-27-sample-screening-answers.json'), 'utf8')
);

const QUESTION = {
  questionText: 'Describe your experience with React and TypeScript, including a production example.',
  maxPoints: 10,
  sampleAnswer:
    'I used React and TypeScript in production to ship a dashboard, implemented hooks, and measured load time impact.',
};

test('unanswered responses are not given a low score', () => {
  const empty = evaluateScreeningAnswer({ textResponse: '   ' }, QUESTION);
  assert.equal(empty.status, 'UNANSWERED');
  assert.equal(empty.aiScore, null);
  assert.equal(empty.aiSentiment, null);
  assert.equal(empty.aiConfidenceLevel, null);
  assert.equal(isUnanswered({ textResponse: '' }), true);
});

test('a strong answer scores higher than a weak answer to the same question', () => {
  const strong = evaluateScreeningAnswer(
    {
      textResponse:
        'In production I implemented a React and TypeScript dashboard with custom hooks, measured load time, and delivered a 30% faster experience. For example we shipped it to 12 teams.',
    },
    QUESTION
  );
  const weak = evaluateScreeningAnswer({ textResponse: 'I used some tools.' }, QUESTION);
  assert.equal(strong.status, 'ANALYZED');
  assert.equal(weak.status, 'ANALYZED');
  assert.ok(typeof strong.aiScore === 'number' && typeof weak.aiScore === 'number');
  assert.ok(strong.aiScore > weak.aiScore, `expected ${strong.aiScore} > ${weak.aiScore}`);
});

test('evaluation is deterministic', () => {
  const answer = { textResponse: 'I built React TypeScript hooks in production for example.' };
  const first = evaluateScreeningAnswer(answer, QUESTION);
  const second = evaluateScreeningAnswer(answer, QUESTION);
  assert.deepEqual(first, second);
});

test('overall score averages stored numeric scores and skips unanswered', () => {
  assert.equal(aggregateScreeningOverallScore([8, null, 6, undefined]), 7);
  assert.equal(aggregateScreeningOverallScore([null, null]), null);
});

test('scores stay on the question maxPoints scale', () => {
  const result = evaluateScreeningAnswer(
    { textResponse: 'React TypeScript production dashboard hooks example measured impact.' },
    { ...QUESTION, maxPoints: 10 }
  );
  assert.ok(result.aiScore === null || (result.aiScore >= 0 && result.aiScore <= 10));
});

test('multiple-choice uses the expected answer', () => {
  const question = {
    questionText: 'Which testing strategy do you use?',
    maxPoints: 10,
    correctAnswer: 'All of the above',
  };
  const correct = evaluateScreeningAnswer({ selectedOptions: ['All of the above'] }, question);
  const incorrect = evaluateScreeningAnswer({ selectedOptions: ['Unit Testing'] }, question);
  assert.equal(correct.aiScore, 10);
  assert.equal(incorrect.aiScore, 0);
});

test('committed sample set records different scores for strong vs weak', () => {
  const question = samples.question;
  const strong = evaluateScreeningAnswer(samples.answers.strong, question);
  const weak = evaluateScreeningAnswer(samples.answers.weak, question);
  const unanswered = evaluateScreeningAnswer(samples.answers.unanswered, question);
  assert.equal(strong.aiScore, samples.expected.strong.aiScore);
  assert.equal(strong.aiSentiment, samples.expected.strong.aiSentiment);
  assert.equal(weak.aiScore, samples.expected.weak.aiScore);
  assert.equal(unanswered.status, 'UNANSWERED');
  assert.equal(unanswered.aiScore, null);
  assert.ok(strong.aiScore > weak.aiScore);
  const overall = aggregateScreeningOverallScore([strong.aiScore, weak.aiScore, unanswered.aiScore]);
  assert.equal(overall, samples.expected.overallScore);
});

test('controller no longer uses Math.random', () => {
  const controllerPath = resolve(__dirname, '../../controllers/batch17AIScreening.controller.ts');
  const source = readFileSync(controllerPath, 'utf8');
  assert.equal(source.includes('Math.random'), false);
});
