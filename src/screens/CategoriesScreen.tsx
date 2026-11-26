import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BeakerIcon, FireIcon } from '@heroicons/react/24/outline';
import { curriculumPaths } from '../data/curriculumPaths';
import { usePersonalContent } from '../hooks/usePersonalContent';
import { useLanguage } from '../context/LanguageContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LessonProgressState, getLessonCompletion, getMostRecentLessonId } from '../utils/lessonProgress';
import { getPersonalPaths } from '../utils/personalContent';
import Header from '../components/Header';
import Card from '../components/Card';
import CategoryCard from '../components/CategoryCard';
import LessonCard from '../components/lessons/LessonCard';
import LearningPathCard from '../components/lessons/LearningPathCard';

export default function CategoriesScreen() {
  const { t } = useLanguage();
  const { personalLessons, personalQuestions, selectedLessonIds } = usePersonalContent();
  const [lessonProgress] = useLocalStorage<LessonProgressState>('lessonProgress', {});
  const [selectedField, setSelectedField] = useState('All');
  const questionCounts = personalQuestions.reduce<Record<string, number>>((counts, question) => {
    counts[question.category] = (counts[question.category] || 0) + 1;
    return counts;
  }, {});
  const categories = Object.entries(questionCounts).map(([id, questionCount]) => ({ id, questionCount }));
  const paths = getPersonalPaths(curriculumPaths, selectedLessonIds);
  const fields = useMemo(
    () => ['All', ...Array.from(new Set(personalLessons.map((lesson) => lesson.field || 'General'))).sort()],
    [personalLessons],
  );
  const visibleLessons = useMemo(
    () => selectedField === 'All'
      ? personalLessons
      : personalLessons.filter((lesson) => (lesson.field || 'General') === selectedField),
    [personalLessons, selectedField],
  );
  const recentId = getMostRecentLessonId(lessonProgress);
  const recent = personalLessons.find((lesson) => lesson.id === recentId);
  const labCount = personalLessons.reduce(
    (total, lesson) => total + lesson.blocks.filter((block) => block.type === 'interactive').length,
    0,
  );
  const checkpointCount = personalLessons.reduce(
    (total, lesson) => total + lesson.blocks.filter((block) => block.type === 'checkpoint').length,
    0,
  );

  if (!personalLessons.length && !personalQuestions.length) {
    return (
      <div className="pb-24 pt-4">
        <Header title={t('nav.categories')} />
        <section className="px-4 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Personal Learn</p>
          <h2 className="mt-2 text-2xl font-bold">Your space is empty</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-base-content/65">
            Add your own questions or choose lessons and practice questions from the Marketplace.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
            <Link to="/questions" className="btn btn-outline">Add custom questions</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4">
      <Header title={t('nav.categories')} />
      <div className="space-y-9 pb-4">
        <div className="flex flex-wrap gap-2">
          <Link to="/marketplace" className="btn btn-primary btn-sm">Browse Marketplace</Link>
          <Link to="/questions" className="btn btn-outline btn-sm">Add custom questions</Link>
        </div>

        {recent && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Continue</p>
            <h2 className="mb-3 mt-1 text-xl font-bold">Pick up where you stopped</h2>
            <LessonCard lesson={recent} completion={getLessonCompletion(recent, lessonProgress[recent.id])} compact />
          </section>
        )}

        {paths.length > 0 && (
          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Paths</p>
              <h2 className="mt-1 text-xl font-bold">Learn through connected mental models</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-base-content/65">
                Use a path when you want direction. Lessons remain independently accessible, and nothing is hard-locked.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {paths.map((path) => (
                <LearningPathCard key={path.id} path={path} lessons={personalLessons} progress={lessonProgress} />
              ))}
            </div>
          </section>
        )}

        {personalLessons.length > 0 && (
          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Lessons</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="mt-1 text-xl font-bold">Understand before you drill</h2>
                <Link to="/lessons/new" className="btn btn-primary btn-sm">Create lesson</Link>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-base-content/65">
                Lessons you chose and lessons you created.
              </p>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2 rounded-3xl border border-primary/15 bg-primary/5 p-3 sm:gap-4 sm:p-5">
              <div className="text-center"><div className="text-2xl font-black sm:text-3xl">{personalLessons.length}</div><div className="text-[11px] text-base-content/55 sm:text-xs">lessons</div></div>
              <div className="text-center"><div className="text-2xl font-black sm:text-3xl">{labCount}</div><div className="text-[11px] text-base-content/55 sm:text-xs">coded labs</div></div>
              <div className="text-center"><div className="text-2xl font-black sm:text-3xl">{checkpointCount}</div><div className="text-[11px] text-base-content/55 sm:text-xs">retrieval checks</div></div>
            </div>

            <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2" aria-label="Filter lessons by field">
              {fields.map((field) => {
                const count = field === 'All'
                  ? personalLessons.length
                  : personalLessons.filter((lesson) => (lesson.field || 'General') === field).length;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => setSelectedField(field)}
                    aria-pressed={selectedField === field}
                    className={`btn btn-sm shrink-0 rounded-full ${selectedField === field ? 'btn-primary' : 'btn-ghost bg-base-200/70'}`}
                  >
                    {field}<span className="text-[10px] opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="mb-3 flex items-center justify-between text-xs text-base-content/55">
              <span>{selectedField === 'All' ? 'All fields' : selectedField}</span>
              <span>{visibleLessons.length} lesson{visibleLessons.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  completion={getLessonCompletion(lesson, lessonProgress[lesson.id])}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Practice</p>
            <h2 className="mt-1 text-xl font-bold">Retrieve what you know</h2>
            <p className="mt-1 text-sm leading-6 text-base-content/65">
              Practice uses only questions in your Learn space.
            </p>
          </div>
          {personalQuestions.length > 0 ? (
            <>
              <Link to="/play-all" className="mb-4 block">
                <Card variant="interactive" className="group border-primary/15 bg-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3"><FireIcon className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-bold">Mixed practice</h3>
                      <p className="mt-1 text-sm text-base-content/65">Mix only the questions you added.</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    id={category.id}
                    title={category.id.replace(/_/g, ' ')}
                    description={t('dashboard.categoryDescription', { category: category.id.replace(/_/g, ' ') })}
                    questionCount={category.questionCount}
                    size="small"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">
              No practice questions yet. <Link to="/marketplace" className="font-semibold text-primary underline">Choose questions from the Marketplace</Link>.
            </div>
          )}
          <div className="flex items-center gap-2 rounded-2xl bg-base-200/50 p-3 text-xs text-base-content/60">
            <BeakerIcon className="h-4 w-4 shrink-0" />
            <span>Add only the questions you want to practice; general content stays in the Marketplace.</span>
          </div>
        </section>
      </div>
    </div>
  );
}
