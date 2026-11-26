import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { builtInLessons } from './hooks/useLessons';
import { builtInQuestions } from './hooks/useQuestions';
import { initializePersonalContent } from './utils/personalContent';
import './index.css';
import './styles/appShell.css';

initializePersonalContent(window.localStorage, {
  lessonIds: builtInLessons.map((lesson) => lesson.id),
  questionIds: builtInQuestions.map((question) => question.id),
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
