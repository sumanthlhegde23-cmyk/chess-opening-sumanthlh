export interface CountryLanguageProfile {
  country: string;
  countryCode: string;
  callingCode: string;
  languages: string[];
}

export const countryLanguageProfiles: CountryLanguageProfile[] = [
  { country: 'India', countryCode: 'IN', callingCode: '+91', languages: ['en', 'kn', 'hi', 'ta', 'te', 'ml', 'mr', 'bn', 'gu', 'pa', 'or', 'as'] },
  { country: 'United States', countryCode: 'US', callingCode: '+1', languages: ['en', 'es'] },
  { country: 'Canada', countryCode: 'CA', callingCode: '+1', languages: ['en', 'fr'] },
  { country: 'United Kingdom', countryCode: 'GB', callingCode: '+44', languages: ['en', 'cy', 'gd'] },
  { country: 'Australia', countryCode: 'AU', callingCode: '+61', languages: ['en'] },
  { country: 'New Zealand', countryCode: 'NZ', callingCode: '+64', languages: ['en', 'mi'] },
  { country: 'Ireland', countryCode: 'IE', callingCode: '+353', languages: ['en', 'ga'] },
  { country: 'South Africa', countryCode: 'ZA', callingCode: '+27', languages: ['en', 'af', 'zu', 'xh'] },
  { country: 'Singapore', countryCode: 'SG', callingCode: '+65', languages: ['en', 'zh', 'ms', 'ta'] },
  { country: 'Malaysia', countryCode: 'MY', callingCode: '+60', languages: ['ms', 'en', 'zh', 'ta'] },
  { country: 'Pakistan', countryCode: 'PK', callingCode: '+92', languages: ['ur', 'en', 'pa'] },
  { country: 'Bangladesh', countryCode: 'BD', callingCode: '+880', languages: ['bn', 'en'] },
  { country: 'Nepal', countryCode: 'NP', callingCode: '+977', languages: ['ne', 'en'] },
  { country: 'Sri Lanka', countryCode: 'LK', callingCode: '+94', languages: ['si', 'ta', 'en'] },
  { country: 'United Arab Emirates', countryCode: 'AE', callingCode: '+971', languages: ['ar', 'en'] },
  { country: 'Nigeria', countryCode: 'NG', callingCode: '+234', languages: ['en', 'ha', 'yo', 'ig'] },
  { country: 'Philippines', countryCode: 'PH', callingCode: '+63', languages: ['en', 'tl'] },
  { country: 'France', countryCode: 'FR', callingCode: '+33', languages: ['fr'] },
  { country: 'Germany', countryCode: 'DE', callingCode: '+49', languages: ['de'] },
  { country: 'Spain', countryCode: 'ES', callingCode: '+34', languages: ['es', 'ca', 'eu', 'gl'] },
  { country: 'Brazil', countryCode: 'BR', callingCode: '+55', languages: ['pt'] },
  { country: 'Mexico', countryCode: 'MX', callingCode: '+52', languages: ['es'] },
  { country: 'China', countryCode: 'CN', callingCode: '+86', languages: ['zh'] },
  { country: 'Japan', countryCode: 'JP', callingCode: '+81', languages: ['ja'] },
  { country: 'South Korea', countryCode: 'KR', callingCode: '+82', languages: ['ko'] },
  { country: 'Russia', countryCode: 'RU', callingCode: '+7', languages: ['ru'] },
  { country: 'Saudi Arabia', countryCode: 'SA', callingCode: '+966', languages: ['ar'] },
  { country: 'Italy', countryCode: 'IT', callingCode: '+39', languages: ['it'] },
];

export function findCountryByCallingCode(phone: string, preferredCountryCode?: string): CountryLanguageProfile | undefined {
  const normalized = phone.replace(/[^\d+]/g, '');
  if (!normalized.startsWith('+')) return undefined;

  const matches = countryLanguageProfiles
    .filter(({ callingCode }) => normalized.startsWith(callingCode))
    .sort((first, second) => second.callingCode.length - first.callingCode.length);
  return matches.find(({ countryCode }) => countryCode === preferredCountryCode) || matches[0];
}
