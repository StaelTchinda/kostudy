export interface PersonalContentSelection {
  lessonIds: string[];
  questionIds: string[];
  pathIds: string[];
}

export interface PersonalContentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface SourcedQuestion {
  id: string;
  source?: string;
}

interface OriginLesson {
  id: string;
  origin?: string;
}

interface LessonPath {
  id: string;
  lessonIds: string[];
}

interface TopicQuestion {
  id: string;
  category: string;
}

export interface QuestionTopicGroup<T extends TopicQuestion> {
  topic: string;
  questions: T[];
}

export const PERSONAL_CONTENT_STORAGE_KEY = 'personalLearningContent';

const LEGACY_LEARNING_STORAGE_KEYS = [
  'quizUsername',
  'customQuizQuestions',
  'customLessons',
  'quizProgress',
  'lessonProgress',
  'quizMistakes',
  'questionLearningState',
  'userAchievements',
  'achievementProgress',
];

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const normalizeIds = (ids: string[]): string[] => Array.from(new Set(ids));

const inferSelectedPathIds = (paths: readonly LessonPath[], lessonIds: readonly string[]): string[] => {
  const selectedLessonIds = new Set(lessonIds);
  return paths
    .filter((path) => path.lessonIds.every((lessonId) => selectedLessonIds.has(lessonId)))
    .map((path) => path.id);
};

export function getMarketplaceQuestions<T extends SourcedQuestion>(questions: readonly T[]): T[] {
  return questions.filter((question) => question.source === 'default');
}

export function groupQuestionsByTopic<T extends TopicQuestion>(questions: readonly T[]): QuestionTopicGroup<T>[] {
  const groups = new Map<string, T[]>();
  questions.forEach((question) => {
    const group = groups.get(question.category) || [];
    group.push(question);
    groups.set(question.category, group);
  });
  return Array.from(groups, ([topic, groupedQuestions]) => ({ topic, questions: groupedQuestions }));
}

export function getMarketplaceLessons<T extends OriginLesson>(lessons: readonly T[]): T[] {
  return lessons.filter((lesson) => lesson.origin === 'built-in');
}

export function getPersonalQuestions<T extends SourcedQuestion>(
  questions: readonly T[],
  selectedIds: ReadonlySet<string>,
): T[] {
  return questions.filter((question) => question.source !== 'default' || selectedIds.has(question.id));
}

export function getPersonalLessons<T extends OriginLesson>(
  lessons: readonly T[],
  selectedIds: ReadonlySet<string>,
): T[] {
  return lessons.filter((lesson) => lesson.origin !== 'built-in' || selectedIds.has(lesson.id));
}

export function getPersonalPaths<T extends LessonPath>(
  paths: readonly T[],
  selectedPathIds: ReadonlySet<string>,
): T[] {
  return paths.filter((path) => selectedPathIds.has(path.id));
}

export function getPersonalLessonIds(
  selection: Pick<PersonalContentSelection, 'lessonIds' | 'pathIds'>,
  paths: readonly LessonPath[],
): string[] {
  const selectedPaths = getPersonalPaths(paths, new Set(selection.pathIds));
  return normalizeIds([...selection.lessonIds, ...selectedPaths.flatMap((path) => path.lessonIds)]);
}

const parseSelection = (value: unknown, paths: readonly LessonPath[]): PersonalContentSelection => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('lessonIds' in value) ||
    !('questionIds' in value) ||
    !isStringArray(value.lessonIds) ||
    !isStringArray(value.questionIds)
  ) {
    throw new Error('Stored personal learning content is invalid.');
  }

  const storedPathIds = 'pathIds' in value ? value.pathIds : undefined;
  if ('pathIds' in value && !isStringArray(storedPathIds)) {
    throw new Error('Stored personal learning content is invalid.');
  }

  const lessonIds = normalizeIds(value.lessonIds);
  return {
    lessonIds,
    questionIds: normalizeIds(value.questionIds),
    pathIds: isStringArray(storedPathIds)
      ? normalizeIds(storedPathIds)
      : inferSelectedPathIds(paths, lessonIds),
  };
};

type PersonalContentCatalog = Pick<PersonalContentSelection, 'lessonIds' | 'questionIds'>;

export function initializePersonalContent(
  storage: PersonalContentStorage,
  catalog: PersonalContentCatalog,
  paths: readonly LessonPath[] = [],
): PersonalContentSelection {
  const savedSelection = storage.getItem(PERSONAL_CONTENT_STORAGE_KEY);
  if (savedSelection !== null) {
    const selection = parseSelection(JSON.parse(savedSelection), paths);
    storage.setItem(PERSONAL_CONTENT_STORAGE_KEY, JSON.stringify(selection));
    return selection;
  }

  const isLegacyLearner = LEGACY_LEARNING_STORAGE_KEYS.some((key) => storage.getItem(key) !== null);
  const lessonIds = isLegacyLearner ? normalizeIds(catalog.lessonIds) : [];
  const selection = isLegacyLearner
    ? {
        lessonIds,
        questionIds: normalizeIds(catalog.questionIds),
        pathIds: inferSelectedPathIds(paths, lessonIds),
      }
    : { lessonIds: [], questionIds: [], pathIds: [] };

  storage.setItem(PERSONAL_CONTENT_STORAGE_KEY, JSON.stringify(selection));
  return selection;
}

export function toggleSelection(ids: readonly string[], id: string, selected: boolean): string[] {
  const next = new Set(ids);
  if (selected) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return Array.from(next);
}

export function toggleSelectionGroup(ids: readonly string[], groupIds: readonly string[], selected: boolean): string[] {
  const next = new Set(ids);
  groupIds.forEach((id) => {
    if (selected) {
      next.add(id);
    } else {
      next.delete(id);
    }
  });
  return Array.from(next);
}
