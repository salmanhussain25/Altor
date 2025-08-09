
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { LANGUAGES, Language } from '../translations';
import { GlobeIcon } from './icons/GlobeIcon';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslations();

  return (
    <div className="relative">
      <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold py-2 pl-10 pr-4 rounded-lg transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label="Select language"
      >
        {LANGUAGES.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};
