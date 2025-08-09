
import { useLanguage } from './useLanguage';
import { translationData, type Language } from '../translations';

// Helper to access nested properties using dot notation
const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

export const useTranslations = () => {
  const { language, setLanguage } = useLanguage();
  const translations = translationData[language] || translationData.en;
  const englishTranslations = translationData.en;

  const t = (key: string, replacements?: { [key:string]: string | number }) => {
    let text = getNestedTranslation(translations, key);

    // If a key is not found in the current language, fall back to English.
    if (!text) {
        text = getNestedTranslation(englishTranslations, key);
    }
    
    // If still not found, it's a genuine missing key.
    if(!text) {
        console.warn(`Translation key "${key}" not found for language "${language}".`);
        return key;
    }

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            text = text!.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
    }

    return text;
  };

  return { t, language, setLanguage };
};
