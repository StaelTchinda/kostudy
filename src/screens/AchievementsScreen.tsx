import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ChartBarIcon, TrophyIcon, GlobeAmericasIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePersonalContent } from '../hooks/usePersonalContent';
import { Mistakes, getTotalUniqueMistakes } from '../utils/mistakes';
import { useAchievements } from '../hooks/useAchievements';
import { ACHIEVEMENT_TIER_KEYS, Achievement } from '../types/achievement';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import PerformanceChart from '../components/PerformanceChart';
import MasteryOverview from '../components/MasteryOverview';
import { achievements as achievementCatalog } from '../data/achievements';
import { LearningState } from '../utils/learningState';
import { LessonProgressState } from '../utils/lessonProgress';
import { buildLessonProgressSummary, buildQuestionTopicPerformance } from '../utils/personalProgress';

export interface CategoryColor {
  bg: string;
  text: string;
  bar: string;
  icon: string;
}

export interface CategoryPerformance {
  name:string;
  color: CategoryColor;
  completed: number;
  total: number;
  accuracy: number;
}

// Consistent styling for categories to avoid the "all green" issue
const categoryStyles: CategoryColor[] = [
  { bg: 'bg-primary', text: 'text-primary', bar: 'bg-primary', icon: 'sparkles' },
  { bg: 'bg-secondary', text: 'text-secondary', bar: 'bg-secondary', icon: 'book' },
  { bg: 'bg-accent', text: 'text-accent', bar: 'bg-accent', icon: 'academic' },
  { bg: 'bg-info', text: 'text-info', bar: 'bg-info', icon: 'globe' },
  { bg: 'bg-warning', text: 'text-warning', bar: 'bg-warning', icon: 'trophy' },
  { bg: 'bg-error', text: 'text-error', bar: 'bg-error', icon: 'trophy' },
];

const getCategoryStyle = (index: number): CategoryColor => {
  return categoryStyles[index % categoryStyles.length];
};


function AchievementPath({
  all,
  unlockedMap,
  t,
}: {
  all: Achievement[];
  unlockedMap: Record<string, boolean>;
  t: (key: string) => string;
}) {
  // Visual path: vertical progression with nodes and connectors
  return (
    <div className="mt-6 px-4">
      <div className="bg-base-100 rounded-2xl p-6 shadow-lg border-2 border-b-4 border-base-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-base-content">Achievement Path</h3>
          <div className="text-sm text-base-content/60">
            {Object.keys(unlockedMap).length} / {all.length} unlocked
          </div>
        </div>
        
        {/* Vertical Achievement Path */}
        <div className="relative">
          {/* Background path line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-base-300 via-base-200 to-base-300 rounded-full" />
          
          {/* Achievement nodes */}
          <div className="space-y-8">
            {all.map((achievement, idx) => {
              const isUnlocked = !!unlockedMap[achievement.id];
              const isNext = !isUnlocked && (idx === 0 || !!unlockedMap[all[idx - 1]?.id]);
              const isPrevious = idx > 0 && !!unlockedMap[all[idx - 1]?.id];
              
              return (
                <div key={achievement.id} className="relative flex items-center">
                  {/* Connection line to previous achievement */}
                  {idx > 0 && (
                    <div className={`absolute left-8 -top-4 w-1 h-4 ${
                      isUnlocked || isPrevious
                        ? 'bg-gradient-to-b from-primary to-success'
                        : 'bg-base-300'
                    } rounded-full`} />
                  )}
                  
                  {/* Achievement badge */}
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-primary to-success ring-4 ring-primary/20 shadow-lg transform scale-110'
                        : isNext
                        ? 'bg-gradient-to-br from-warning/80 to-warning ring-4 ring-warning/30 shadow-md animate-pulse'
                        : 'bg-base-300 ring-2 ring-base-200 shadow-sm'
                    }`}>
                      <span className={`text-2xl select-none transition-all duration-300 ${
                        isUnlocked ? 'opacity-100 drop-shadow-sm' : 'opacity-60'
                      }`}>
                        {achievement.icon}
                      </span>
                    </div>
                    
                    {/* Unlock indicator */}
                    {isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Next indicator */}
                    {isNext && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full animate-ping" />
                    )}
                  </div>
                  
                  {/* Achievement info */}
                  <div className="ml-6 flex-1">
                    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-success/10 border-success/30 shadow-sm'
                        : isNext
                        ? 'bg-warning/10 border-warning/30 shadow-sm'
                        : 'bg-base-200/50 border-base-300'
                    }`}>
                      <h4 className={`font-bold text-sm mb-1 ${
                        isUnlocked ? 'text-success' : isNext ? 'text-warning' : 'text-base-content/60'
                      }`}>
                        {t(achievement.title)}
                      </h4>
                      <p className={`text-xs ${
                        isUnlocked ? 'text-base-content' : 'text-base-content/50'
                      }`}>
                        {t(achievement.description)}
                      </p>
                      
                      {/* Achievement tier and points */}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`badge badge-sm ${
                          isUnlocked ? 'badge-success' : isNext ? 'badge-warning' : 'badge-ghost'
                        }`}>
                          {t(ACHIEVEMENT_TIER_KEYS[achievement.tier])}
                        </span>
                        <span className={`text-xs font-medium ${
                          isUnlocked ? 'text-success' : 'text-base-content/40'
                        }`}>
                          +{achievement.reward.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Path completion indicator */}
          {Object.keys(unlockedMap).length === all.length && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-success text-white rounded-full shadow-lg">
                <TrophyIcon className="w-5 h-5 mr-2" />
                <span className="font-bold text-sm">Path Complete!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AchievementsScreen() {
  const navigate = useNavigate();
  const { username } = useUser();
  const { t } = useLanguage();
  const { getAchievementStats, getUnlockedAchievements } = useAchievements();
  const { personalQuestions, personalLessons } = usePersonalContent();
  const [learningState] = useLocalStorage<LearningState>('questionLearningState', {});
  const [lessonProgress] = useLocalStorage<LessonProgressState>('lessonProgress', {});
  const [mistakes] = useLocalStorage<Mistakes>('quizMistakes', {});
  const questionTopicProgress = buildQuestionTopicPerformance(personalQuestions, learningState);
  const performanceData: CategoryPerformance[] = questionTopicProgress.map((topic, index) => {
    const color = getCategoryStyle(index);
    return {
      name: topic.topic,
      color,
      completed: topic.practicedQuestions,
      total: topic.totalQuestions,
      accuracy: topic.accuracy,
    };
  });
  const practicedQuestions = questionTopicProgress.reduce((sum, topic) => sum + topic.practicedQuestions, 0);
  const totalQuestionAttempts = questionTopicProgress.reduce((sum, topic) => sum + topic.attempts, 0);
  const totalCorrectAttempts = questionTopicProgress.reduce((sum, topic) => sum + topic.correctAttempts, 0);
  const lessonSummary = buildLessonProgressSummary(personalLessons, lessonProgress);
  const totalMistakes = getTotalUniqueMistakes(mistakes);
  const achievementStats = getAchievementStats();

  // Build unlocked map for path visualization
  const unlockedMap = Object.fromEntries(
    getUnlockedAchievements().map(a => [a.id, true] as const)
  );

  return (
    <div className="pb-20">
      <Header title={t('achievementsScreen.title')} />

      {/* Profile Section */}
      <div className="flex items-center justify-between px-4 mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-medium">
              {username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="ml-3 font-medium text-base-content">{username}</span>
        </div>
      </div>

      {personalLessons.length + personalQuestions.length === 0 && (
        <section className="mx-4 mb-6 rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="font-bold">Your Learn space is empty</h2>
          <p className="mt-1 text-sm text-base-content/65">Add a topic or lesson to see progress here.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/categories/marketplace" className="btn btn-primary btn-sm">Browse Marketplace</Link>
            <Link to="/questions" className="btn btn-ghost btn-sm">Add custom questions</Link>
          </div>
        </section>
      )}

      {/* Personal learning stats */}
      <div className="grid grid-cols-3 gap-4 px-4 mb-8">
        <StatCard
          icon={<BookOpenIcon className="w-6 h-6" />}
          label="Questions practiced"
          value={personalQuestions.length ? `${practicedQuestions} / ${personalQuestions.length}` : '—'}
          color="info"
        />
        <StatCard
          icon={<ChartBarIcon className="w-6 h-6" />}
          label="Learning accuracy"
          value={totalQuestionAttempts ? `${Math.round(totalCorrectAttempts / totalQuestionAttempts * 100)}%` : '—'}
          color="success"
        />
        <StatCard
          icon={<GlobeAmericasIcon className="w-6 h-6" />}
          label="Lessons completed"
          value={personalLessons.length ? `${lessonSummary.completedLessons} / ${lessonSummary.totalLessons}` : '—'}
          color="info"
        />
      </div>

      <MasteryOverview />

      {performanceData.length > 0 && (
        <PerformanceChart performanceData={performanceData} />
      )}

      {personalLessons.length > 0 && (
        <section className="mx-4 mt-6 rounded-2xl border border-base-300 bg-base-100 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Lesson progress in Learn</h2>
            <span className="text-sm text-base-content/65">
              {lessonSummary.completedLessons} / {lessonSummary.totalLessons} complete
            </span>
          </div>
          <p className="mt-1 text-sm text-base-content/60">{lessonSummary.startedLessons} started</p>
        </section>
      )}

      {/* All-time achievements */}
      <section className="px-4 mt-8">
        <h2 className="text-xl font-bold text-base-content mb-2">All-time achievements</h2>
        <p className="mb-4 text-sm text-base-content/60">Rewards earned across your full learning history, independent of your current Learn selections.</p>
        
        {/* Achievement Stats */}
        <div className="grid grid-cols-2 gap-4 bg-base-100 rounded-2xl p-4 shadow-lg mb-6 border-2 border-b-4 border-base-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/70">{t('achievementsScreen.points')}</p>
              <p className="text-2xl font-bold text-accent">{achievementStats.points}</p>
            </div>
            <SparklesIcon className="h-7 w-7 text-accent" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/70">{t('achievementsScreen.unlocked')}</p>
              <p className="text-2xl font-bold text-primary">{achievementStats.unlocked} / {achievementStats.total}</p>
            </div>
            <TrophyIcon className="h-7 w-7 text-warning" />
          </div>
        </div>

        {/* Achievement Path - replaces the old achievements grid */}
        <AchievementPath all={achievementCatalog} unlockedMap={unlockedMap} t={t} />
      </section>

      {/* Practice Mistakes Button */}
      {totalMistakes > 0 && (
        <div className="px-4 mt-6">
          <button
            onClick={() => navigate('/mistakes')}
            className="btn btn-primary rounded-2xl font-bold border-2 border-b-4 w-full"
          >
            Practice all-time mistakes ({totalMistakes})
          </button>
        </div>
      )}
    </div>
  );
}
