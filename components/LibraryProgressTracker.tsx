
import React from 'react';
import { LibraryCourse } from '../types';
import { LibraryIcon } from './icons/LibraryIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PencilIcon } from './icons/PencilIcon';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';

interface LibraryProgressTrackerProps {
  course: LibraryCourse;
  onReset: () => void;
  onSelectTopic: (topicId: string) => void;
  currentTopicId: string | null;
}

export const LibraryProgressTracker: React.FC<LibraryProgressTrackerProps> = ({ course, onReset, onSelectTopic, currentTopicId }) => {
  const { t } = useTranslations();

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-gray-800/50 p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-700 md:h-full max-h-[50vh] md:max-h-full flex-shrink-0">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
          {t('library.courseContent')}
        </h2>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button onClick={onReset} className="text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-md px-2 py-1 transition-colors">
            {t('dashboard.title')}
          </button>
        </div>
      </div>

      {course ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center mb-6 flex-shrink-0">
            <LibraryIcon className="w-10 h-10 mr-4 flex-shrink-0 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold">{course.courseName}</h3>
              <p className="text-sm text-gray-400">
                {course.topics.length} {t('progress.topics')}
              </p>
            </div>
          </div>

          <h4 className="font-semibold text-gray-300 mb-3 flex-shrink-0">{t('library.courseTopics')}</h4>
          <ul className="space-y-2 overflow-y-auto flex-1 pr-2 mb-4">
            {course.topics.map((topic) => {
              const isCurrent = topic.id === currentTopicId;
              let icon;
              let bgClass = "bg-gray-800/50 hover:bg-gray-700/80";

              if (isCurrent) {
                icon = <PencilIcon className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />;
                bgClass = "bg-green-900/50 border-green-500";
              } else {
                icon = <BookOpenIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />;
              }
              
              return (
                <li key={topic.id}>
                  <button
                    onClick={() => onSelectTopic(topic.id)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 border border-transparent ${bgClass} cursor-pointer`}
                  >
                    {icon}
                    <span className={`flex-1 ${isCurrent ? 'text-white font-semibold' : 'text-gray-300'}`}>{topic.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="text-center text-gray-400 flex-1 flex items-center justify-center">
          <p>{t('library.selectTopic')}</p>
        </div>
      )}
    </aside>
  );
};
