import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getMarketplaceLessons,
  getMarketplaceQuestions,
  getPersonalLessons,
  getPersonalLessonIds,
  getPersonalPaths,
  getPersonalQuestions,
  initializePersonalContent,
  PERSONAL_CONTENT_STORAGE_KEY,
  groupQuestionsByTopic,
  toggleSelection,
  toggleSelectionGroup,
} from '../src/utils/personalContent.ts';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test('fresh storage starts with no bundled selections and saves the marker', () => {
  const storage = new MemoryStorage();

  const selection = initializePersonalContent(storage, {
    lessonIds: ['lesson-a'],
    questionIds: ['question-a'],
  });

  assert.deepEqual(selection, { lessonIds: [], questionIds: [], pathIds: [] });
  assert.equal(storage.getItem(PERSONAL_CONTENT_STORAGE_KEY), JSON.stringify(selection));
});

test('legacy learning data keeps all bundled content available', () => {
  const storage = new MemoryStorage();
  storage.setItem('quizProgress', '{}');

  const selection = initializePersonalContent(storage, {
    lessonIds: ['lesson-a', 'lesson-b'],
    questionIds: ['question-a'],
  }, [
    { id: 'path-a', lessonIds: ['lesson-a', 'lesson-b'] },
    { id: 'path-b', lessonIds: ['lesson-b', 'lesson-c'] },
  ]);

  assert.deepEqual(selection, {
    lessonIds: ['lesson-a', 'lesson-b'],
    questionIds: ['question-a'],
    pathIds: ['path-a'],
  });
});

test('unrelated settings alone do not classify a fresh learner as legacy', () => {
  const storage = new MemoryStorage();
  storage.setItem('geminiApiKey', 'configured');

  const selection = initializePersonalContent(storage, {
    lessonIds: ['lesson-a'],
    questionIds: ['question-a'],
  });

  assert.deepEqual(selection, { lessonIds: [], questionIds: [], pathIds: [] });
});

test('a saved empty selection is not repopulated on later startup', () => {
  const storage = new MemoryStorage();
  initializePersonalContent(storage, { lessonIds: [], questionIds: [] });
  storage.setItem('quizUsername', 'Learner');

  const selection = initializePersonalContent(storage, {
    lessonIds: ['lesson-a'],
    questionIds: ['question-a'],
  });

  assert.deepEqual(selection, { lessonIds: [], questionIds: [], pathIds: [] });
});

test('legacy saved selections infer only fully selected paths and persist the migration', () => {
  const storage = new MemoryStorage();
  storage.setItem(PERSONAL_CONTENT_STORAGE_KEY, JSON.stringify({
    lessonIds: ['lesson-a', 'lesson-b'],
    questionIds: ['question-a'],
  }));
  const paths = [
    { id: 'complete', lessonIds: ['lesson-a', 'lesson-b'] },
    { id: 'partial', lessonIds: ['lesson-b', 'lesson-c'] },
  ];

  const selection = initializePersonalContent(storage, {
    lessonIds: ['lesson-a', 'lesson-b', 'lesson-c'],
    questionIds: ['question-a'],
  }, paths);

  assert.deepEqual(selection, {
    lessonIds: ['lesson-a', 'lesson-b'],
    questionIds: ['question-a'],
    pathIds: ['complete'],
  });
  assert.equal(storage.getItem(PERSONAL_CONTENT_STORAGE_KEY), JSON.stringify(selection));
});

test('an explicitly empty path selection does not infer legacy paths', () => {
  const storage = new MemoryStorage();
  storage.setItem(PERSONAL_CONTENT_STORAGE_KEY, JSON.stringify({
    lessonIds: ['lesson-a', 'lesson-b'],
    questionIds: [],
    pathIds: [],
  }));

  const selection = initializePersonalContent(storage, {
    lessonIds: ['lesson-a', 'lesson-b'],
    questionIds: [],
  }, [{ id: 'complete', lessonIds: ['lesson-a', 'lesson-b'] }]);

  assert.deepEqual(selection.pathIds, []);
});

test('selection updates are idempotent and can remove an item', () => {
  const once = toggleSelection([], 'question-a', true);
  const twice = toggleSelection(once, 'question-a', true);

  assert.deepEqual(twice, ['question-a']);
  assert.deepEqual(toggleSelection(twice, 'question-a', false), []);
});

test('question topics group questions using their existing category', () => {
  const questions = [
    { id: 'physics-a', category: 'Physics' },
    { id: 'math-a', category: 'Mathematics' },
    { id: 'physics-b', category: 'Physics' },
  ];

  assert.deepEqual(groupQuestionsByTopic(questions), [
    { topic: 'Physics', questions: [questions[0], questions[2]] },
    { topic: 'Mathematics', questions: [questions[1]] },
  ]);
});

test('topic selection adds or removes the whole group without changing other items', () => {
  const existing = ['question-outside-topic', 'physics-a'];
  const group = ['physics-a', 'physics-b'];

  assert.deepEqual(toggleSelectionGroup(existing, group, true), [
    'question-outside-topic',
    'physics-a',
    'physics-b',
  ]);
  assert.deepEqual(toggleSelectionGroup(existing, group, false), ['question-outside-topic']);
});

test('topic selection remains idempotent for repeated additions', () => {
  const once = toggleSelectionGroup(['physics-a'], ['physics-a', 'physics-b'], true);

  assert.deepEqual(toggleSelectionGroup(once, ['physics-a', 'physics-b'], true), once);
});

test('marketplace questions exclude personal questions while Learn keeps selected and custom questions', () => {
  const questions = [
    { id: 'built-in-a', source: 'default' },
    { id: 'built-in-b', source: 'default' },
    { id: 'personal', source: 'custom' },
  ];

  assert.deepEqual(getMarketplaceQuestions(questions), questions.slice(0, 2));
  assert.deepEqual(getPersonalQuestions(questions, new Set(['built-in-b'])), questions.slice(1));
});

test('marketplace lessons exclude custom lessons while Learn keeps selected and custom lessons', () => {
  const lessons = [
    { id: 'built-in-a', origin: 'built-in' },
    { id: 'built-in-b', origin: 'built-in' },
    { id: 'personal', origin: 'custom' },
  ];

  assert.deepEqual(getMarketplaceLessons(lessons), lessons.slice(0, 2));
  assert.deepEqual(getPersonalLessons(lessons, new Set(['built-in-b'])), lessons.slice(1));
});

test('only explicitly selected curriculum paths are shown', () => {
  const paths = [
    { id: 'path-a', lessonIds: ['lesson-a', 'lesson-b'] },
    { id: 'path-b', lessonIds: ['lesson-b'] },
  ];

  assert.deepEqual(getPersonalPaths(paths, new Set(['path-b'])), [paths[1]]);
});

test('selected paths add their lessons to personal Learn without duplicates', () => {
  const paths = [
    { id: 'path-a', lessonIds: ['lesson-a', 'lesson-b'] },
    { id: 'path-b', lessonIds: ['lesson-b', 'lesson-c'] },
  ];

  assert.deepEqual(
    getPersonalLessonIds({ lessonIds: ['lesson-direct', 'lesson-a'], pathIds: ['path-a', 'path-b'] }, paths),
    ['lesson-direct', 'lesson-a', 'lesson-b', 'lesson-c'],
  );
});

