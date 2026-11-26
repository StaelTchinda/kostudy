import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import { usePersonalContent } from '../hooks/usePersonalContent';
import { groupQuestionsByTopic } from '../utils/personalContent';

type CatalogType = 'lessons' | 'questions';

export default function MarketplaceScreen() {
  const { builtInLessons, builtInQuestions, personalLessons, personalQuestions, selectedLessonIds, selectedQuestionIds, addLesson, removeLesson, addQuestionGroup, removeQuestionGroup } = usePersonalContent();
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
  const visibleQuestionGroups = useMemo(
    () => groupQuestionsByTopic(builtInQuestions)
      .filter((group) => group.topic.toLowerCase().includes(normalizedSearch)),
    [builtInQuestions, normalizedSearch],
  );
  const personalContentCount = personalLessons.length + personalQuestions.length;

  return (
    <div className="pb-24 pt-4">
      <Header title="Marketplace" showBackButton backTo="/categories" backLabel="Learn" />
      <nav aria-label="Breadcrumb" className="mb-4 px-4 text-sm">
        <Link to="/categories" className="font-medium text-primary underline">Learn</Link>
        <span aria-hidden="true" className="mx-2 text-base-content/50">/</span>
        <span aria-current="page" className="text-base-content/65">Marketplace</span>
      </nav>
      <div className="space-y-5 px-4">
        <div>
          <p className="text-sm leading-6 text-base-content/65">
            Browse KoStudy's built-in lessons and questions. Add only what you want in your Learn space.
          </p>
          <p className="mt-2 text-xs text-base-content/55">
            {personalContentCount} {personalContentCount === 1 ? 'item' : 'items'} in your Learn space
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
            placeholder={catalogType === 'lessons' ? 'Search lessons' : 'Search topics'}
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
            {visibleQuestionGroups.length ? visibleQuestionGroups.map((group) => {
              const questionIds = group.questions.map((question) => question.id);
              const selectedInGroup = questionIds.filter((id) => selectedQuestionIds.has(id)).length;
              const added = selectedInGroup === questionIds.length;
              const partial = selectedInGroup > 0 && !added;
              return (
                <article key={group.topic} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold leading-6">{group.topic}</h2>
                    <span className="badge badge-ghost shrink-0">{questionIds.length} {questionIds.length === 1 ? 'question' : 'questions'}</span>
                  </div>
                  <p className="mt-2 text-sm text-base-content/65">
                    {partial
                      ? `${selectedInGroup} of ${questionIds.length} questions in your Learn space`
                      : added ? 'In your Learn space' : 'Add this topic to Learn'}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      aria-pressed={added}
                      aria-label={`${added ? 'Remove' : 'Add'} all ${questionIds.length} questions in ${group.topic} ${added ? 'from' : 'to'} Learn`}
                      className={`btn btn-sm ${added ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => added ? removeQuestionGroup(questionIds) : addQuestionGroup(questionIds)}
                    >
                      {added ? 'Remove topic' : partial ? 'Add remaining questions' : 'Add topic'}
                    </button>
                  </div>
                </article>
              );
            }) : <p className="py-12 text-center text-sm text-base-content/60">No topics match your search.</p>}
          </div>
        )}

        <div className="rounded-2xl bg-base-200/60 p-4 text-sm">
          Want to make your own questions? <Link to="/questions" className="font-semibold text-primary underline">Open the Questions Bank</Link>.
        </div>
      </div>
    </div>
  );
}
