

// To add a new language:
// 1. Add the JSON file in the 'translations' folder.
// 2. Add its metadata to the 'LANGUAGES' array below.
// 3. Add its mapping for Gemini in 'geminiLanguageMap' below.
// 4. Add its BCP-47 tag in 'bcp47LanguageMap' below.

import { enData, hiData, esData, frData, deData, jaData, zhData, arData } from './data';


export const LANGUAGES: { code: 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar'; name:string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'ar', name: 'العربية (Arabic)' },
];

const languageCodes = LANGUAGES.map(lang => lang.code);
export type Language = typeof languageCodes[number];

export const translationData: Record<Language, any> = {
  en: enData,
  hi: hiData,
  es: esData,
  fr: frData,
  de: deData,
  ja: jaData,
  zh: zhData,
  ar: arData,
};

export const geminiLanguageMap: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi (in the Latin script)',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ja: 'Japanese',
    zh: 'Chinese',
    ar: 'Arabic',
};

export const bcp47LanguageMap: Record<Language, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ar: 'ar-SA',
};