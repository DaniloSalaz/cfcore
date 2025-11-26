import enMessages from './en.json';
import esMessages from './es.json';

export type Language = 'en' | 'es';

const messages: Record<Language, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
}

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem('language');
  if (stored === 'en' || stored === 'es') {
    currentLanguage = stored;
    return stored;
  }
  
  return 'en';
}

export function useI18n() {
  const lang = getLanguage();
  
  function t(key: string): string {
    const keys = key.split('.');
    let value: any = messages[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    return key;
  }
  
  return {
    t,
    lang,
    setLanguage,
  };
}

export function initI18n() {
  getLanguage();
}
