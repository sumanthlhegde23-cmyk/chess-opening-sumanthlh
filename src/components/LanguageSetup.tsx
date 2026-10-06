import { useMemo, useState } from 'react';
import { Check, ChevronRight, Globe2, Languages } from 'lucide-react';
import { countryLanguageProfiles, findCountryByCallingCode } from '../data/countryLanguages';
import { isSupportedLanguage, languages } from '../data/languages';

interface LanguageSetupProps {
  currentLanguage: string;
  onContinue: (countryCode: string, language: string) => void;
}

export function LanguageSetup({ currentLanguage, onContinue }: LanguageSetupProps) {
  const storedCountryCode = localStorage.getItem('chess-openings-country');
  const initialCountry = countryLanguageProfiles.find(({ countryCode }) => countryCode === storedCountryCode)
    || countryLanguageProfiles[0];
  const [countryCode, setCountryCode] = useState(initialCountry.countryCode);
  const [phone, setPhone] = useState(initialCountry.callingCode);
  const selectedCountry = countryLanguageProfiles.find(({ countryCode: code }) => code === countryCode) || initialCountry;
  const languageChoices = useMemo(
    () => selectedCountry.languages
      .filter(isSupportedLanguage)
      .map((code) => languages.find((language) => language.code === code))
      .filter((language): language is (typeof languages)[number] => Boolean(language)),
    [selectedCountry],
  );
  const [languageSearch, setLanguageSearch] = useState('');
  const searchedLanguages = useMemo(() => {
    const query = languageSearch.trim().toLowerCase();
    if (!query) return [];
    return languages
      .filter((option) =>
        `${option.name} ${option.nativeName} ${option.code}`.toLowerCase().includes(query)
      )
      .slice(0, 12);
  }, [languageSearch]);
  const selectedLanguage = languages.find((option) => option.code === language);
  const preferredLanguage = languageChoices.length === 1
    ? languageChoices[0].code
    : languageChoices.some(({ code }) => code === currentLanguage) && storedCountryCode === countryCode
      ? currentLanguage
      : '';
  const [language, setLanguage] = useState(preferredLanguage);

  const updatePhone = (value: string) => {
    setPhone(value);
    const detectedCountry = findCountryByCallingCode(value, countryCode);
    if (detectedCountry && detectedCountry.countryCode !== countryCode) {
      setCountryCode(detectedCountry.countryCode);
      setLanguage(detectedCountry.languages.length === 1
        ? detectedCountry.languages[0]
        : detectedCountry.languages.includes(language) ? language : '');
    }
  };

  const updateCountry = (nextCountryCode: string) => {
    const nextCountry = countryLanguageProfiles.find(({ countryCode: code }) => code === nextCountryCode);
    if (!nextCountry) return;
    setCountryCode(nextCountryCode);
    setPhone((value) => value.startsWith('+') ? value.replace(/^\+\d+/, nextCountry.callingCode) : nextCountry.callingCode);
    setLanguage(nextCountry.languages.length === 1
      ? nextCountry.languages[0]
      : nextCountry.languages.includes(language) ? language : '');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101218] px-4 py-10 text-zinc-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.15),_transparent_55%)]" />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-700/80 bg-[#171a22]/95 shadow-2xl shadow-black/50">
        <div className="border-b border-zinc-800 bg-gradient-to-r from-amber-500/10 via-transparent to-cyan-500/10 px-6 py-7 sm:px-9">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
            <Languages className="h-6 w-6" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Chess Openings Master</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Choose your language</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">
            We’ll suggest languages based on your country. You can change your choice at any time in Settings.
          </p>
        </div>

        <div className="space-y-7 px-6 py-7 sm:px-9">
          <div>
            <label htmlFor="language-setup-country" className="mb-2 block text-sm font-semibold text-zinc-200">
              Country or region
            </label>
            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <select
                id="language-setup-country"
                value={countryCode}
                onChange={(event) => updateCountry(event.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-700 bg-[#101218] py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
              >
                {countryLanguageProfiles.map((country) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.country} ({country.callingCode})
                  </option>
                ))}
              </select>
            </div>
            <label htmlFor="language-setup-phone" className="mb-2 mt-4 block text-sm font-semibold text-zinc-200">
              Phone number / country code
            </label>
            <input
              id="language-setup-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => updatePhone(event.target.value)}
              placeholder={`${selectedCountry.callingCode} 98765 43210`}
              className="w-full rounded-xl border border-zinc-700 bg-[#101218] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Country code detected: {selectedCountry.country} {selectedCountry.callingCode}
            </p>
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-zinc-200">Your language</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {languageChoices.length > 1
                  ? 'Choose a regional language or search all supported languages. Your country is only a recommendation.'
                  : 'We selected the primary supported language for your region. You can still choose any other supported language.'}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {languageChoices.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  aria-pressed={language === option.code}
                  className={`flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    language === option.code
                      ? 'border-amber-400/80 bg-amber-400/10 text-amber-100 shadow-sm shadow-amber-950/30'
                      : 'border-zinc-700 bg-[#11141b] text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold" data-no-translate="true">{option.nativeName}</span>
                    {option.nativeName !== option.name && (
                      <span className="mt-0.5 block truncate text-xs text-zinc-500" data-no-translate="true">{option.name}</span>
                    )}
                  </span>
                  {language === option.code && <Check className="ml-3 h-4 w-4 shrink-0 text-amber-300" />}
                </button>
              ))}
            </div>
            {selectedLanguage && !languageChoices.some(({ code }) => code === selectedLanguage.code) && (
              <p className="mt-3 text-xs text-amber-200">
                Selected: <span data-no-translate="true">{selectedLanguage.nativeName} — {selectedLanguage.name}</span>
              </p>
            )}
            <label htmlFor="language-setup-search" className="mb-2 mt-4 block text-xs font-semibold text-zinc-400">
              Search all supported languages
            </label>
            <input
              id="language-setup-search"
              type="search"
              value={languageSearch}
              onChange={(event) => setLanguageSearch(event.target.value)}
              placeholder="Search by language name or native script"
              className="w-full rounded-xl border border-zinc-700 bg-[#101218] px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400"
            />
            {searchedLanguages.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-zinc-700 bg-[#101218] p-1">
                {searchedLanguages.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => {
                      setLanguage(option.code);
                      setLanguageSearch('');
                    }}
                    aria-pressed={language === option.code}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <span><span data-no-translate="true">{option.nativeName}</span>{option.nativeName !== option.name && <span className="ml-2 text-xs text-zinc-500" data-no-translate="true">{option.name}</span>}</span>
                    {language === option.code && <Check className="h-4 w-4 text-amber-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!language}
            onClick={() => onContinue(countryCode, isSupportedLanguage(language) ? language : 'en')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-950/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-[#171a22] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
          >
            Continue to Chess Openings Master <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
