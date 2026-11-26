import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import { usePersonalContent } from '../hooks/usePersonalContent';

type CatalogType = 'lessons' | 'questions';

export default function MarketplaceScreen() {
  const { builtInLessons, builtInQuestions, selection, selectedLessonIds, selectedQuestionIds, addLesson, removeLesson, addQuestion, removeQuestion } = usePersonalContent();
  const [catalogType, setCatalogType] = useState<CatalogType>('lessons');
  const [searchTerm, setSearchTerm] = useState('');
  const searchId = useId();
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleLessons = useMemo(
    () => builtInLessons.filter((lesson) =>
      `${lesson.title} ${lesson.field || ''} ${lesson.description}`.toLowerCase().includes(normalizedSearch),
    ),
    [builtInLessons, normalizedSearch],
  );
  const visibleQuestions = useMemo(
    () => builtInQuestions.filter((question) =>
      `${question.question} ${question.category}`.toLowerCase().includes(normalizedSearch),
    ),
    [builtInQuestions, normalizedSearch],
  );
  const selectedCount = selection.lessonIds.length + selection.questionIds.length;

  return (
    <div className="pb-24 pt-4">
      <Header title="Marketplace" showBackButton />
      <div className="space-y-5 px-4">
        <div>
          <p className="text-sm leading-6 text-base-content/65">
            Browse KoStudy's built-in lessons and questions. Add only what you want in your Learn space.
          </p>
          <p className="mt-2 text-xs text-base-content/55">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} in your Learn space
          </p>
        </div>

        <div className="tabs tabs-boxed bg-base-200/50" aria-label="Marketplace content type">
          <button
            type="button"
            aria-pressed={catalogType === 'lessons'}
            className={`tab flex-1 ${catalogType === 'lessons' ? 'tab-active !bg-primary !text-primary-content' : ''}`}
            onClick={() => setCatalogType('lessons')}
          >
            Lessons ({builtInLessons.length})
          </button>
          <button
            type="button"
            aria-pressed={catalogType === 'questions'}
            className={`tab flex-1 ${catalogType === 'questions' ? 'tab-active !bg-primary !text-primary-content' : ''}`}
            onClick={() => setCatalogType('questions')}
          >
            Questions ({builtInQuestions.length})
          </button>
        </div>

        <div className="relative">
          <label htmlFor={searchId} className="sr-only">Search Marketplace</label>
          <MagnifyingGlassIcon aria-hidden="true" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />
          <input
            id={searchId}
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={catalogType === 'lessons' ? 'Search lessons' : 'Search questions or topics'}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {catalogType === 'lessons' ? (
          <div className="space-y-3">
            {visibleLessons.length ? visibleLessons.map((lesson) => {
              const added = selectedLessonIds.has(lesson.id);
              return (
                <article key={lesson.id} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="text-2xl">{lesson.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {lesson.field || 'General'} · {lesson.durationMinutes} min · {lesson.difficulty}
                      </p>
                      <h2 className="mt-1 font-bold">{lesson.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-base-content/65">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      aria-pressed={added}
                      aria-label={`${added ? 'Remove' : 'Add'} ${lesson.title} ${added ? 'from' : 'to'} Learn`}
                      className={`btn btn-sm ${added ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => added ? removeLesson(lesson.id) : addLesson(lesson.id)}
                    >
                      {added ? 'Remove' : 'Add to Learn'}
                    </button>
                  </div>
                </article>
              );
            }) : <p className="py-12 text-center text-sm text-base-content/60">No lessons match your search.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleQuestions.length ? visibleQuestions.map((question) => {
              const added = selectedQuestionIds.has(question.id);
              return (
                <article key={question.id} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <h2 className="font-semibold leading-6">{question.question}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-base-content/70">
                    <span className="badge badge-ghost">{question.category}</span>
                    <span className="badge badge-outline">{question.difficulty}</span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      aria-pressed={added}
                      aria-label={`${added ? 'Remove' : 'Add'} question from Learn`}
                      className={`btn btn-sm ${added ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => added ? removeQuestion(question.id) : addQuestion(question.id)}
                    >
                      {added ? 'Remove' : 'Add to Learn'}
                    </button>
                  </div>
                </article>
              );
            }) : <p className="py-12 text-center text-sm text-base-content/60">No questions match your search.</p>}
          </div>
        )}

        <div className="rounded-2xl bg-base-200/60 p-4 text-sm">
          Want to make your own questions? <Link to="/questions" className="font-semibold text-primary underline">Open the Questions Bank</Link>.
        </div>
      </div>
    </div>
  );
}
