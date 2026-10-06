const cache = new Map<string, string>();
const loadedLanguages = new Set<string>();
const maxCachedTranslations = 500;

function cacheKey(language: string, text: string): string {
  return `${language}\u0000${text}`;
}

function loadLanguage(language: string): void {
  if (loadedLanguages.has(language)) return;
  loadedLanguages.add(language);
  try {
    const stored = localStorage.getItem(`chess-openings-translation-cache:${language}`);
    if (!stored) return;
    const entries: unknown = JSON.parse(stored);
    if (entries && typeof entries === 'object' && !Array.isArray(entries)) {
      Object.entries(entries).forEach(([text, translated]) => {
        if (typeof translated === 'string') cache.set(cacheKey(language, text), translated);
      });
    }
  } catch {
    return;
  }
}

function saveLanguage(language: string): void {
  const entries = Array.from(cache.entries())
    .filter(([key]) => key.startsWith(`${language}\u0000`))
    .slice(-maxCachedTranslations)
    .map(([key, translated]) => [key.slice(language.length + 1), translated]);
  try {
    localStorage.setItem(`chess-openings-translation-cache:${language}`, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    return;
  }
}

export function getCachedTranslation(language: string, text: string): string | undefined {
  loadLanguage(language);
  return cache.get(cacheKey(language, text));
}

export async function translateTexts(language: string, texts: string[], signal?: AbortSignal): Promise<string[]> {
  if (language === 'en') return texts;
  if (texts.length < 1 || texts.length > 30 || texts.some((text) => text.length > 10000)
    || texts.reduce((total, text) => total + text.length, 0) > 10000) {
    throw new Error('Translation text is outside the supported request limits.');
  }

  loadLanguage(language);
  const missing = Array.from(new Set(texts.filter((text) => !cache.has(cacheKey(language, text)))));
  if (missing.length > 0) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, texts: missing }),
      signal,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Translation request failed.');
    if (!Array.isArray(result.translations) || result.translations.length !== missing.length
      || result.translations.some((translated: unknown) => typeof translated !== 'string')) {
      throw new Error('The translation service returned an invalid response.');
    }
    if (result.source !== 'fallback') {
      missing.forEach((text, index) => cache.set(cacheKey(language, text), result.translations[index]));
      saveLanguage(language);
    }
    return texts.map((text) => {
      const translated = cache.get(cacheKey(language, text));
      return translated ?? text;
    });
  }

  return texts.map((text) => cache.get(cacheKey(language, text)) || text);
}
