const languageCodes = `
aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo za zh zu`
  .trim()
  .split(/\s+/);

const englishNames = new Intl.DisplayNames(['en'], { type: 'language' });

function getNativeName(code: string, englishName: string): string {
  try {
    return new Intl.DisplayNames([code], { type: 'language' }).of(code) || englishName;
  } catch {
    return englishName;
  }
}

export const languages = languageCodes
  .map((code) => {
    const name = englishNames.of(code) || code;
    return { code, name, nativeName: getNativeName(code, name) };
  })
  .sort((first, second) => {
    if (first.code === 'en') return -1;
    if (second.code === 'en') return 1;
    return first.name.localeCompare(second.name);
  });

export const supportedLanguageCodes = languages.map(({ code }) => code);

export function isSupportedLanguage(value: string | null): value is string {
  return value !== null && supportedLanguageCodes.includes(value);
}

const rightToLeftLanguageCodes = new Set(['ar', 'dv', 'fa', 'he', 'ps', 'sd', 'ug', 'ur', 'yi']);

export function isRightToLeftLanguage(code: string): boolean {
  return rightToLeftLanguageCodes.has(code.split('-')[0]);
}