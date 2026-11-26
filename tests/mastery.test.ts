import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQuestionTopicPerformance, buildLessonProgressSummary } from '../src/utils/personalProgress.ts';
import type { LearningState } from '../src/utils/learningState.ts';
import type { Lesson } from '../src/types/lesson.ts';
import type { LessonProgressState } from '../src/utils/lessonProgress.ts';
import type { Question } from '../src/types/question.ts';

const question = (id: string, category: string): Question => ({
  id,
  category,
  type: 'true-false',
  question: `Question ${id}`,
  explanation: 'Explanation',
  difficulty: 'easy',
  correctAnswer: true,
});

const lesson = (id: string, blockIds: string[]): Lesson => ({
  id,
  title: id,
  subtitle: '',
  description: '',
  coreQuestion: '',
  firstPrinciple: '',
  durationMinutes: 1,
  difficulty: 'foundation',
  emoji: '📚',
  concepts: [],
  blocks: blockIds.map((blockId) => ({
    id: blockId,
    title: blockId,
    type: 'explain',
    body: '',
  })),
  tutorBrief: '',
});

test('question topic performance is calculated only from the supplied personal questions', () => {
  const personalQuestions = [question('personal-a', 'Physics'), question('personal-b', 'Physics')];
  const learningState: LearningState = {
    'personal-a': {
      attempts: 2,
      correctAttempts: 1,
      incorrectAttempts: 1,
      consecutiveCorrect: 0,
      reviewStage: 0,
      lapses: 0,
      lastAttemptAt: 1,
      lastResult: 'incorrect',
      nextReviewAt: 1,
    },
    'unselected-question': {
      attempts: 10,
      correctAttempts: 10,
      incorrectAttempts: 0,
      consecutiveCorrect: 10,
      reviewStage: 5,
      lapses: 0,
      lastAttemptAt: 1,
      lastResult: 'correct',
      nextReviewAt: 1,
    },
  };

  assert.deepEqual(buildQuestionTopicPerformance(personalQuestions, learningState), [
    {
      topic: 'Physics',
      totalQuestions: 2,
      practicedQuestions: 1,
      attempts: 2,
      correctAttempts: 1,
      accuracy: 50,
    },
  ]);
});

test('lesson progress summary counts only the supplied personal lessons', () => {
  const personalLessons = [lesson('selected-complete', ['a', 'b']), lesson('selected-started', ['c', 'd'])];
  const lessonProgress: LessonProgressState = {
    'selected-complete': {
      startedAt: 1,
      updatedAt: 2,
      completedBlockIds: ['a', 'b'],
      checkpointResults: {},
      reflections: {},
      completedAt: 2,
    },
    'selected-started': {
      startedAt: 1,
      updatedAt: 2,
      completedBlockIds: ['c'],
      checkpointResults: {},
      reflections: {},
    },
    'unselected-lesson': {
      startedAt: 1,
      updatedAt: 2,
      completedBlockIds: ['x'],
      checkpointResults: {},
      reflections: {},
    },
  };

  assert.deepEqual(buildLessonProgressSummary(personalLessons, lessonProgress), {
    totalLessons: 2,
    startedLessons: 2,
    completedLessons: 1,
  });
});
