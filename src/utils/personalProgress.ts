import type { Lesson } from '../types/lesson';
import type { Question } from '../types/question';
import type { LearningState } from './learningState';
import type { LessonProgressState } from './lessonProgress';
import { getLessonCompletion } from './lessonProgress.ts';

export interface QuestionTopicPerformance {
  topic: string;
  totalQuestions: number;
  practicedQuestions: number;
  attempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface LessonProgressSummary {
  totalLessons: number;
  startedLessons: number;
  completedLessons: number;
}

export function buildQuestionTopicPerformance(
  questions: readonly Question[],
  learningState: LearningState,
): QuestionTopicPerformance[] {
  const groups = new Map<string, QuestionTopicPerformance>();
  questions.forEach((question) => {
    const performance = groups.get(question.category) || {
      topic: question.category,
      totalQuestions: 0,
      practicedQuestions: 0,
      attempts: 0,
      correctAttempts: 0,
      accuracy: 0,
    };
    const state = learningState[question.id];
    performance.totalQuestions += 1;
    if (state?.attempts) {
      performance.practicedQuestions += 1;
      performance.attempts += state.attempts;
      performance.correctAttempts += state.correctAttempts;
    }
    groups.set(question.category, performance);
  });

  return Array.from(groups.values())
    .map((performance) => ({
      ...performance,
      accuracy: performance.attempts
        ? Math.round((performance.correctAttempts / performance.attempts) * 100)
        : 0,
    }))
    .sort((a, b) => a.topic.localeCompare(b.topic));
}

export function buildLessonProgressSummary(
  lessons: readonly Lesson[],
  lessonProgress: LessonProgressState,
): LessonProgressSummary {
  return {
    totalLessons: lessons.length,
    startedLessons: lessons.filter((lesson) => Boolean(lessonProgress[lesson.id])).length,
    completedLessons: lessons.filter((lesson) => getLessonCompletion(lesson, lessonProgress[lesson.id]) === 100).length,
  };
}
