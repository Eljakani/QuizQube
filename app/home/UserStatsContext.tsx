'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface UserStats {
  quizCount: number;
  documentCount: number;
  averageScore: number;
}

const defaultStats: UserStats = {
  quizCount: 0,
  documentCount: 0,
  averageScore: 0
};

interface UserStatsContextType {
  stats: UserStats;
  updateStats: (newStats: Partial<UserStats> | ((prevStats: UserStats) => Partial<UserStats>)) => void;
  handleQuizCompletion: (score: number, totalQuestions: number) => void;
  handleDocumentUpload: () => void;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

const getStoredStats = (): UserStats => {
  if (typeof window !== 'undefined') {
    const storedStats = localStorage.getItem('userStats');
    return storedStats ? JSON.parse(storedStats) : defaultStats;
  }
  return defaultStats;
};

export const UserStatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(defaultStats);

  useEffect(() => {
    setStats(getStoredStats());
  }, []);

  const updateStats = useCallback((newStats: Partial<UserStats> | ((prevStats: UserStats) => Partial<UserStats>)) => {
    setStats(prevStats => {
      const updatedStats = typeof newStats === 'function' 
        ? { ...prevStats, ...newStats(prevStats) }
        : { ...prevStats, ...newStats };
      
      localStorage.setItem('userStats', JSON.stringify(updatedStats));
      return updatedStats;
    });
  }, []);

  const handleQuizCompletion = useCallback((score: number, totalQuestions: number) => {
    updateStats((prevStats) => {
      const newQuizCount = prevStats.quizCount + 1;
      const totalPreviousScore = prevStats.averageScore * prevStats.quizCount;
      const newTotalScore = totalPreviousScore + (score / totalQuestions) * 100;
      const newAverageScore = newTotalScore / newQuizCount;

      return {
        quizCount: newQuizCount,
        averageScore: Math.round(newAverageScore)
      };
    });
  }, [updateStats]);

  const handleDocumentUpload = useCallback(() => {
    updateStats((prevStats) => ({
      documentCount: prevStats.documentCount + 1
    }));
  }, [updateStats]);

  return (
    <UserStatsContext.Provider value={{ stats, updateStats, handleQuizCompletion, handleDocumentUpload }}>
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};