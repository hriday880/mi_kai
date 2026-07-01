'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import en from '@/i18n/en.json';
import jp from '@/i18n/jp.json';
import cn from '@/i18n/cn.json';

/* ── Types ────────────────────────────────────────────────── */
export type Lang = 'en' | 'jp' | 'cn';

type Translations = Record<string, unknown>;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

/* ── Translation map ──────────────────────────────────────── */
const translations: Record<Lang, Translations> = { en, jp, cn };

/**
 * Safely resolve a dot-delimited path against a nested object.
 * Returns the original key if the path cannot be resolved.
 */
function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return path; // fallback: return the dot path so missing keys are visible
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : path;
}

/* ── Context ──────────────────────────────────────────────── */
const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

/* ── Provider ─────────────────────────────────────────────── */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mikai-lang') as Lang | null;
      if (stored && translations[stored]) {
        setLangState(stored);
      }
    } catch {
      // localStorage may be unavailable (SSR, private browsing restrictions)
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('mikai-lang', newLang);
    } catch {
      // silently ignore if storage is unavailable
    }
  }, []);

  const t = useCallback(
    (key: string): string => getNestedValue(translations[lang], key),
    [lang],
  );

  return (
    <LanguageContext value={{ lang, setLang, t }}>
      {children}
    </LanguageContext>
  );
}

/* ── Hook ─────────────────────────────────────────────────── */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
