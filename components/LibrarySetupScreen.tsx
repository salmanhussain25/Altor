
import React, { useState } from 'react';
import { LibraryIcon } from './icons/LibraryIcon';
import { useTranslations } from '../hooks/useTranslations';

interface LibrarySetupScreenProps {
  onBuildCourse: (topic: string) => void;
  isLoading: boolean;
  onExit: () => void;
  error: string | null;
}

export const LibrarySetupScreen: React.FC<LibrarySetupScreenProps> = ({ onBuildCourse, isLoading, onExit, error }) => {
  const [topic, setTopic] = useState('');
  const { t } = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onBuildCourse(topic.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="w-full text-left">
          <button onClick={onExit} className="text-green-400 hover:text-green-300 mb-8">
            {t('dashboard.backToModeSelection')}
          </button>
        </div>
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
            {t('library.setupTitle')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mt-2">{t('library.setupDescription')}</p>
        </header>
        
        <form
          onSubmit={handleSubmit}
          className="w-full bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl fade-in space-y-6"
        >
          <div>
            <label htmlFor="topic" className="block text-lg font-semibold text-gray-200 mb-2">{t('library.courseTopics')}</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('library.topicPlaceholder')}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LibraryIcon className="w-6 h-6 mr-2" />
                {t('library.buildCourse')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
