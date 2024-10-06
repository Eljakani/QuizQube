import { useState, useEffect } from 'react';

interface QuizSettings {
  defaultQuestions: string;
  difficulty: string;
}

const defaultSettings: QuizSettings = {
  defaultQuestions: '10',
  difficulty: 'medium',
};

export const useQuizSettings = () => {
  const [settings, setSettings] = useState<QuizSettings | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      const storedSettings = localStorage.getItem('quizSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as Partial<QuizSettings>;
        setSettings({
          ...defaultSettings,
          ...parsedSettings,
        });
      } else {
        setSettings(defaultSettings);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = (key: keyof QuizSettings, value: string) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      localStorage.setItem('quizSettings', JSON.stringify(newSettings));
    }
  };

  return { settings, updateSetting };
};