import { Link } from 'react-router-dom';
import {
  ArrowPathIcon,
  BookOpenIcon,
  ChevronRightIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { usePersonalContent } from '../hooks/usePersonalContent';
import { useLanguage } from '../context/LanguageContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Mistakes, getTotalUniqueMistakes } from '../utils/mistakes';
import { useAchievements } from '../hooks/useAchievements';
import { LearningState } from '../utils/learningState';
import { LessonProgressState, getLessonCompletion, getMostRecentLessonId } from '../utils/lessonProgress';
import { buildConceptMastery, getWeakestConcepts } from '../utils/mastery';
import { useReviewQueue } from '../hooks/useReviewQueue';
import Header from '../components/Header';
import Card from '../components/Card';
import CategoryCard from '../components/CategoryCard';
import LessonCard from '../components/lessons/LessonCard';
import { aiFeaturesEnabled } from '../config';

export default function DashboardScreen() {
  const { t } = useLanguage();
  const { personalQuestions, personalLessons } = usePersonalContent();
  const [mistakes] = useLocalStorage<Mistakes>('quizMistakes', {});
  const [learningState] = useLocalStorage<LearningState>('questionLearningState', {});
  const [lessonProgress] = useLocalStorage<LessonProgressState>('lessonProgress', {});
  const { progress } = useAchievements();
  const personalQuestionIds = new Set(personalQuestions.map((question) => question.id));
  const personalMistakes = Object.fromEntries(
    Object.entries(mistakes)
      .map(([category, entries]) => [category, entries.filter((entry) => personalQuestionIds.has(entry.questionId))])
      .filter(([, entries]) => entries.length > 0),
  ) as Mistakes;
  const personalLearningState = Object.fromEntries(
    Object.entries(learningState).filter(([questionId]) => personalQuestionIds.has(questionId)),
  ) as LearningState;
  const { dueCount } = useReviewQueue(personalLearningState);
  const totalMistakes = getTotalUniqueMistakes(personalMistakes);
  const accuracy = progress.questionsAnswered > 0
    ? Math.round(progress.correctAnswers / progress.questionsAnswered * 100)
    : 0;
  const concepts = buildConceptMastery(personalLessons, personalQuestions, personalLearningState, lessonProgress);
  const weak = getWeakestConcepts(concepts, 1)[0];
  const recent = personalLessons.find((lesson) => lesson.id === getMostRecentLessonId(lessonProgress));
  const suggested = recent || personalLessons.find(
    (lesson) => getLessonCompletion(lesson, lessonProgress[lesson.id]) < 100,
  );
  const questionCounts = personalQuestions.reduce<Record<string, number>>((counts, question) => {
    counts[question.category] = (counts[question.category] || 0) + 1;
    return counts;
  }, {});
  const topics = Object.entries(questionCounts)
    .slice(0, 4)
    .map(([id, count]) => ({ id, count }));

  const next = totalMistakes > 0
    ? { to: '/mistakes', title: 'Repair unresolved mistakes', description: `${totalMistakes} need correction`, Icon: ArrowPathIcon, error: true }
    : dueCount > 0
      ? { to: '/quiz?mode=review', title: 'Scheduled review', description: `${dueCount} questions are due for recall`, Icon: ArrowPathIcon, error: false }
      : suggested
        ? {
            to: `/lessons/${suggested.id}`,
            title: recent ? `Continue ${suggested.title}` : `Start ${suggested.title}`,
            description: `${getLessonCompletion(suggested, lessonProgress[suggested.id])}% complete · ${suggested.durationMinutes} min lesson`,
            Icon: BookOpenIcon,
            error: false,
          }
        : personalQuestions.length > 0
          ? { to: '/play-all', title: 'Mixed practice', description: 'Mix topics to keep recall flexible', Icon: FireIcon, error: false }
          : { to: '/marketplace', title: 'Choose what to learn', description: 'Browse lessons and questions to add to your space', Icon: BookOpenIcon, error: false };

  return (
    <div className="pb-24">
      <Header title={t('nav.dashboard')} />
      <div className="space-y-9 px-4 pt-7">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Study next</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">One useful next step</h1>
          <Link to={next.to} className="mt-4 block">
            <Card variant="interactive" className={`group border ${next.error ? 'border-error/20 bg-error/5' : 'border-primary/20 bg-primary/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl p-3 ${next.error ? 'bg-error/10' : 'bg-primary/10'}`}>
                  <next.Icon className={`h-6 w-6 ${next.error ? 'text-error' : 'text-primary'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{next.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-base-content/65">{next.description}</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-base-content/35" />
              </div>
            </Card>
          </Link>
          {weak && (
            <div className="mt-3 rounded-2xl bg-base-200/60 px-4 py-3 text-sm text-base-content/70">
              <strong>Weak signal:</strong> {weak.label} · {weak.score}% from {weak.attempts} mapped retrieval attempts
            </div>
          )}
        </section>

        {progress.questionsAnswered > 0 && (
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-2xl bg-base-200/70 p-3 text-center"><div className="text-xl font-bold">{progress.questionsAnswered}</div><div className="mt-1 text-xs text-base-content/60">Answered</div></div>
            <div className="rounded-2xl bg-base-200/70 p-3 text-center"><div className="text-xl font-bold">{accuracy}%</div><div className="mt-1 text-xs text-base-content/60">Accuracy</div></div>
            <div className="rounded-2xl bg-base-200/70 p-3 text-center"><div className="text-xl font-bold">{dueCount}</div><div className="mt-1 text-xs text-base-content/60">Due</div></div>
            <div className="rounded-2xl bg-base-200/70 p-3 text-center"><div className="text-xl font-bold">{concepts.filter((concept) => concept.status === 'strong').length}</div><div className="mt-1 text-xs text-base-content/60">Strong concepts</div></div>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Learn</p>
              <h2 className="mt-1 text-xl font-bold">Build the model first</h2>
            </div>
            <div className="flex gap-3">
              <Link to="/marketplace" className="text-sm font-semibold text-primary">Marketplace</Link>
              <Link to="/categories" className="text-sm font-semibold text-primary">All learning</Link>
            </div>
          </div>
          {personalLessons.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {personalLessons.slice(0, 2).map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} completion={getLessonCompletion(lesson, lessonProgress[lesson.id])} compact />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">
              No lessons yet. <Link to="/marketplace" className="font-semibold text-primary underline">Browse the Marketplace</Link>.
            </p>
          )}
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Practice</p>
          <h2 className="mt-1 text-xl font-bold">Retrieve by topic</h2>
          {topics.length > 0 ? (
            <>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {topics.map((topic) => (
                  <CategoryCard
                    key={topic.id}
                    id={topic.id}
                    title={topic.id.replace(/_/g, ' ')}
                    description={t('dashboard.categoryDescription', { category: topic.id })}
                    questionCount={topic.count}
                    size="small"
                  />
                ))}
              </div>
              <Link to="/play-all" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                <FireIcon className="h-4 w-4" />Mixed practice
              </Link>
            </>
          ) : (
            <p className="mt-4 rounded-2xl bg-base-200/60 p-4 text-sm text-base-content/70">
              No questions yet. Add your own in the <Link to="/questions" className="font-semibold text-primary underline">Questions Bank</Link> or choose some from the <Link to="/marketplace" className="font-semibold text-primary underline">Marketplace</Link>.
            </p>
          )}
        </section>

        <section>
          <details className="rounded-2xl border border-base-300 bg-base-100">
            <summary className="cursor-pointer list-none p-4 font-semibold">More tools</summary>
            <div className="grid gap-3 border-t border-base-200 p-4 sm:grid-cols-3">
              <Link to="/achievements" className="rounded-2xl bg-base-200/60 p-4"><TrophyIcon className="h-5 w-5 text-warning" /><div className="mt-2 font-semibold">Progress</div></Link>
              {aiFeaturesEnabled && <Link to="/sagalearn" className="rounded-2xl bg-base-200/60 p-4"><SparklesIcon className="h-5 w-5 text-secondary" /><div className="mt-2 font-semibold">SagaLearn</div></Link>}
              <Link to="/questions" className="rounded-2xl bg-base-200/60 p-4"><WrenchScrewdriverIcon className="h-5 w-5 text-info" /><div className="mt-2 font-semibold">Question bank</div></Link>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
