import { createContext, Dispatch, SetStateAction, useContext } from 'react';

export interface CurrentQuiz {
  category?: string;
  difficulty?: string;
  progress?: number;
  score?: number;
  currentLevel?: string;
  playAllMode?: boolean;
  currentStreak?: number;
  maxStreak?: number;
}

export interface QuizContextType {
  currentQuiz: CurrentQuiz;
  setCurrentQuiz: Dispatch<SetStateAction<CurrentQuiz>>;
}

export const QuizContext = createContext<QuizContextType | null>(null);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};