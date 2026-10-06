export function getLanguageName(language: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(language) || language;
  } catch {
    return language;
  }
}

export function buildChessLanguageInstruction(language: string): string {
  const name = getLanguageName(language);
  return `Respond in ${name} (language code: ${language}). Keep all standard chess notation and data unchanged, including SAN moves (e.g. 1.e4, Nf3, O-O, O-O-O, +, #), coordinates, FEN, PGN, and ECO codes. Explain naturally in the requested language and retain established chess terms when translating them would be confusing.`;
}
