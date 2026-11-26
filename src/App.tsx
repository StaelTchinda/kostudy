import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LanguageProvider } from './context/LanguageContext';
import { UserContext } from './context/UserContext';
import { QuizContext, QuizContextType } from './context/QuizContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { aiFeaturesEnabled, config } from './config';
import CategoriesScreen from './screens/CategoriesScreen';
import CategoryScreen from './screens/CategoryScreen';
import LessonScreen from './screens/LessonScreen';
import LessonCreatorScreen from './screens/LessonCreatorScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MistakesScreen from './screens/MistakesScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import ShareScreen from './screens/ShareScreen';
import DashboardScreen from './screens/DashboardScreen';
import LandingPage from './screens/LandingPage';
import QuestionBankScreen from './screens/QuestionBankScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import QuestionFormScreen from './screens/QuestionFormScreen';
import ChatScreen from './screens/ChatScreen';
import SagaLearnScreen from './screens/SagaLearnScreen';
import AIGeneratorScreen from './screens/AIGeneratorScreen';
import AchievementNotification from './components/AchievementNotification';

function App() {
  const [username, setUsername] = useLocalStorage('quizUsername', '');
  const [currentQuiz, setCurrentQuiz] = useState<QuizContextType['currentQuiz']>({});

  useEffect(() => {
    document.title = config.appName;
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <UserContext.Provider value={{ username, setUsername }}>
          <QuizContext.Provider value={{ currentQuiz, setCurrentQuiz }}>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <div className="relative min-h-screen w-full max-w-full overflow-x-hidden">
                <AchievementNotification />
                <Routes>
                  <Route path="/" element={<div className="w-full max-w-full overflow-x-hidden"><LandingPage /></div>} />
                  <Route path="/dashboard" element={<Layout><DashboardScreen /></Layout>} />
                  <Route path="/categories" element={<Layout><CategoriesScreen /></Layout>} />
                  <Route path="/categories/marketplace" element={<Layout><MarketplaceScreen /></Layout>} />
                  <Route path="/categories/:categoryId" element={<Layout><CategoryScreen /></Layout>} />
                  {aiFeaturesEnabled && <Route path="/lessons/new" element={<Layout><LessonCreatorScreen /></Layout>} />}
                  {!aiFeaturesEnabled && <Route path="/lessons/new" element={<Navigate to="/categories" replace />} />}
                  <Route path="/lessons/:lessonId" element={<Layout><LessonScreen /></Layout>} />
                  <Route path="/quiz" element={<Layout hideNav><QuizScreen /></Layout>} />
                  <Route path="/play-all" element={<Layout hideNav><QuizScreen /></Layout>} />
                  <Route path="/results" element={<Layout><ResultsScreen /></Layout>} />
                  <Route path="/achievements" element={<Layout><AchievementsScreen /></Layout>} />
                  <Route path="/mistakes" element={<Layout><MistakesScreen /></Layout>} />
                  <Route path="/questions" element={<Layout><QuestionBankScreen /></Layout>} />
                  <Route path="/marketplace" element={<Navigate to="/categories/marketplace" replace />} />
                  <Route path="/questions/new" element={<Layout><QuestionFormScreen /></Layout>} />
                  <Route path="/questions/edit/:questionId" element={<Layout><QuestionFormScreen /></Layout>} />
                  <Route path="/settings" element={<Layout><SettingsScreen /></Layout>} />
                  <Route path="/about" element={<Layout><AboutScreen /></Layout>} />
                  <Route path="/contact" element={<Layout><ContactScreen /></Layout>} />
                  <Route path="/share" element={<Layout><ShareScreen /></Layout>} />
                  {aiFeaturesEnabled && <Route path="/chat" element={<Layout><ChatScreen /></Layout>} />}
                  {aiFeaturesEnabled && <Route path="/sagalearn" element={<Layout><SagaLearnScreen /></Layout>} />}
                  {aiFeaturesEnabled && <Route path="/ai-generator" element={<Layout><AIGeneratorScreen /></Layout>} />}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </BrowserRouter>
          </QuizContext.Provider>
        </UserContext.Provider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
