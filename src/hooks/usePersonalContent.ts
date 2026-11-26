import { useCallback, useMemo, useState } from 'react';
import { curriculumPaths } from '../data/curriculumPaths';
import { useLessons } from './useLessons';
import { useLocalStorage } from './useLocalStorage';
import { shuffle, useQuestions } from './useQuestions';
import {
  getMarketplaceLessons,
  getMarketplaceQuestions,
  getPersonalLessons,
  getPersonalLessonIds,
  getPersonalPaths,
  getPersonalQuestions,
  initializePersonalContent,
  PERSONAL_CONTENT_STORAGE_KEY,
  PersonalContentSelection,
  toggleSelection,
  toggleSelectionGroup,
} from '../utils/personalContent';

const EMPTY_SELECTION: PersonalContentSelection = { lessonIds: [], questionIds: [], pathIds: [] };

function usePersonalCatalog() {
  const { allLessons } = useLessons();
  const { allQuestions } = useQuestions();
  const builtInLessons = useMemo(
    () => getMarketplaceLessons(allLessons),
    [allLessons],
  );
  const builtInQuestions = useMemo(
    () => getMarketplaceQuestions(allQuestions),
    [allQuestions],
  );
  return { allLessons, allQuestions, builtInLessons, builtInQuestions };
}

export function usePersonalContent() {
  const { allLessons, allQuestions, builtInLessons, builtInQuestions } = usePersonalCatalog();
  const [initialSelection] = useState(() => {
    if (typeof window === 'undefined') return EMPTY_SELECTION;
    return initializePersonalContent(window.localStorage, {
      lessonIds: builtInLessons.map((lesson) => lesson.id),
      questionIds: builtInQuestions.map((question) => question.id),
    }, curriculumPaths);
  });
  const [selection, setSelection] = useLocalStorage(PERSONAL_CONTENT_STORAGE_KEY, initialSelection);
  const { lessonIds, pathIds } = selection;
  const personalLessonIds = useMemo(
    () => new Set(getPersonalLessonIds({ lessonIds, pathIds }, curriculumPaths)),
    [lessonIds, pathIds],
  );
  const personalPaths = useMemo(
    () => getPersonalPaths(curriculumPaths, new Set(pathIds)),
    [pathIds],
  );
  const selectedQuestionIds = useMemo(() => new Set(selection.questionIds), [selection.questionIds]);
  const personalLessons = useMemo(
    () => getPersonalLessons(allLessons, personalLessonIds),
    [allLessons, personalLessonIds],
  );
  const personalQuestions = useMemo(
    () => getPersonalQuestions(allQuestions, selectedQuestionIds),
    [allQuestions, selectedQuestionIds],
  );
  const getQuestionsByCategory = useCallback(
    (category: string) => personalQuestions.filter((question) => question.category === category),
    [personalQuestions],
  );
  const getRandomQuestions = useCallback(
    (count = 10) => shuffle(personalQuestions).slice(0, count),
    [personalQuestions],
  );

  const addLesson = (id: string) => {
    setSelection((current) => ({
      ...current,
      lessonIds: toggleSelection(current.lessonIds, id, true),
    }));
  };
  const addPath = (id: string) => {
    setSelection((current) => ({
      ...current,
      pathIds: toggleSelection(current.pathIds, id, true),
    }));
  };
  const removeLesson = (id: string) => {
    setSelection((current) => ({
      ...current,
      lessonIds: toggleSelection(current.lessonIds, id, false),
    }));
  };
  const addQuestion = (id: string) => {
    setSelection((current) => ({
      ...current,
      questionIds: toggleSelection(current.questionIds, id, true),
    }));
  };
  const removeQuestion = (id: string) => {
    setSelection((current) => ({
      ...current,
      questionIds: toggleSelection(current.questionIds, id, false),
    }));
  };
  const addQuestionGroup = (ids: string[]) => {
    setSelection((current) => ({
      ...current,
      questionIds: toggleSelectionGroup(current.questionIds, ids, true),
    }));
  };
  const removeQuestionGroup = (ids: string[]) => {
    setSelection((current) => ({
      ...current,
      questionIds: toggleSelectionGroup(current.questionIds, ids, false),
    }));
  };

  return {
    builtInLessons,
    builtInQuestions,
    personalLessons,
    personalQuestions,
    getQuestionsByCategory,
    getRandomQuestions,
    selection,
    personalPaths,
    selectedQuestionIds,
    addLesson,
    addPath,
    removeLesson,
    addQuestion,
    removeQuestion,
    addQuestionGroup,
    removeQuestionGroup,
  };
}
