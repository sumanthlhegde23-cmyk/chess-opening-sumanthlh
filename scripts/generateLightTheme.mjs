/**
 * Generates src/lightTheme.generated.css.
 *
 * The UI is authored dark-first with Tailwind utilities (bg-[#141916], text-zinc-200, ...).
 * Bright mode (`[data-color-mode="light"]`) re-skins every dark-themed utility that is actually
 * used in src/ by pointing it at the --lm-* theme variables defined in src/index.css.
 *
 * Scanning the source (instead of hand-listing colours) means new dark utilities are picked up
 * automatically; this runs before `dev` and `build`, or manually: `npm run theme:light`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(SRC, 'lightTheme.generated.css');
const SCOPE = '[data-color-mode="light"]';

const NEUTRALS = new Set(['zinc', 'slate', 'gray', 'neutral', 'stone']);
const HUES = new Set(['emerald', 'amber', 'cyan', 'rose', 'red', 'sky', 'blue', 'purple', 'yellow', 'indigo', 'violet', 'teal', 'green', 'orange', 'lime', 'pink', 'fuchsia']);
const MEDIA = { sm: '(min-width: 640px)', md: '(min-width: 768px)', lg: '(min-width: 1024px)', xl: '(min-width: 1280px)', '2xl': '(min-width: 1536px)' };
const STATES = { hover: ':hover', focus: ':focus', 'focus-visible': ':focus-visible', 'focus-within': ':focus-within', active: ':active', disabled: ':disabled' };

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const TOKEN = /(?<![\w\-\[\]#.\/])((?:[a-z0-9\-]+:)*)(bg|text|border|ring|from|via|to|divide)-(\[#[0-9a-fA-F]{3,8}\]|[a-z]+-\d{2,3}|[a-z]+)(?:\/(\d{1,3}))?(?![\w\-\[\]#.])/g;

function parseHex(raw) {
  let h = raw.slice(2, -1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
const brightness = ([r, g, b]) => (r + g + b) / 3;
const chroma = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);

/** Pick the light surface for a dark colour of the given brightness. */
function surfaceVar(b, hover) {
  if (hover) return 'var(--lm-hover)';
  if (b < 18) return 'var(--lm-well)';
  if (b < 28) return 'var(--lm-card)';
  if (b < 45) return 'var(--lm-raised)';
  return 'var(--lm-hover)';
}
const withAlpha = (color, alpha) => (alpha == null || alpha >= 100 ? color : `color-mix(in srgb, ${color} ${alpha}%, transparent)`);
const hueRgb = (hue) => `rgb(var(--lm-${hue}-rgb))`;
const hueTint = (hue, alpha) => {
  const pct = alpha == null ? 14 : Math.min(16, Math.max(8, Math.round(alpha * 0.3)));
  return `color-mix(in srgb, ${hueRgb(hue)} ${pct}%, transparent)`;
};

const NEUTRAL_BG = { 950: 'var(--lm-well)', 900: 'var(--lm-card)', 850: 'var(--lm-card)', 800: 'var(--lm-raised)', 700: 'var(--lm-hover)', 600: 'var(--lm-hover-2)' };
const NEUTRAL_TEXT = { 50: 1, 100: 1, 200: 1, 300: 2, 400: 3, 500: 4, 600: 4, 700: 4 };
const NEUTRAL_BORDER = { 950: 'var(--lm-border)', 900: 'var(--lm-border)', 800: 'var(--lm-border)', 700: 'var(--lm-border)', 600: 'var(--lm-border-2)', 500: 'var(--lm-border-3)', 400: 'var(--lm-border-3)' };

/**
 * Returns the declaration that re-skins one utility in bright mode, or null if it is already
 * fine on a light surface. `ctx` carries hints from the surrounding class string.
 */
function declFor(kind, value, alphaRaw, { hover, ctx }) {
  const alpha = alphaRaw == null ? null : Number(alphaRaw);
  const hex = value.startsWith('[#') ? parseHex(value) : null;
  const [family, shadeRaw] = hex ? [null, null] : value.split('-');
  const shade = shadeRaw ? Number(shadeRaw) : null;
  const isNeutral = NEUTRALS.has(family);
  const isHue = HUES.has(family);

  if (kind === 'bg') {
    if (hex) {
      const b = brightness(hex);
      if (b >= 80) return null;
      if (chroma(hex) >= 60 && ctx.whiteText) return null; // brand tile with white text
      if (chroma(hex) >= 24) return `background-color: color-mix(in srgb, rgb(${hex.join(' ')}) 7%, #ffffff) !important`;
      return `background-color: ${withAlpha(surfaceVar(b, hover), alpha)} !important`;
    }
    if (value === 'black') {
      if (alpha == null || alpha >= 70 || ctx.overlay) return null; // scrims keep darkening the page
      return `background-color: rgb(var(--lm-ink-rgb) / ${(alpha * 0.2) / 100}) !important`;
    }
    if (value === 'white') return alpha == null ? null : `background-color: rgb(var(--lm-ink-rgb) / ${(alpha * 0.5) / 100}) !important`;
    if (isNeutral && NEUTRAL_BG[shade]) {
      const base = hover && shade >= 700 ? 'var(--lm-hover)' : NEUTRAL_BG[shade];
      return `background-color: ${withAlpha(base, alpha)} !important`;
    }
    if (isHue && shade >= 800) return `background-color: ${hueTint(family, alpha)} !important`;
    return null;
  }

  if (kind === 'from' || kind === 'via' || kind === 'to') {
    const prop = `--tw-gradient-${kind}`;
    if (hex) {
      const b = brightness(hex);
      if (b >= 80) return null;
      if (chroma(hex) >= 24) return `${prop}: color-mix(in srgb, rgb(${hex.join(' ')}) 7%, #ffffff) !important`;
      return `${prop}: ${surfaceVar(b, false)} !important`;
    }
    if (isNeutral && NEUTRAL_BG[shade]) return `${prop}: ${NEUTRAL_BG[shade]} !important`;
    if (isHue && shade >= 800) return `${prop}: ${hueTint(family, alpha)} !important`;
    return null;
  }

  if (kind === 'text') {
    if (value === 'white') return `color: ${hover ? 'var(--lm-text-strong)' : 'var(--lm-text)'} !important`;
    if (hex) return brightness(hex) >= 150 && chroma(hex) >= 40 ? `color: var(--lm-purple) !important` : null;
    if (isNeutral && NEUTRAL_TEXT[shade]) return `color: var(--lm-text-${NEUTRAL_TEXT[shade]}) !important`;
    if (isHue && shade <= 500) return `color: var(--lm-${family}) !important`;
    return null;
  }

  if (kind === 'border' || kind === 'ring') {
    const prop = kind === 'border' ? 'border-color' : '--tw-ring-color';
    if (value === 'white') return `${prop}: rgb(var(--lm-ink-rgb) / ${((alpha ?? 100) * 0.6) / 100}) !important`;
    if (hex) return brightness(hex) < 60 && chroma(hex) < 24 ? `${prop}: var(--lm-border) !important` : null;
    if (kind === 'border' && isNeutral && NEUTRAL_BORDER[shade]) return `${prop}: ${NEUTRAL_BORDER[shade]} !important`;
    if (isHue && shade >= 300) {
      const a = alpha == null ? 1 : Math.min(0.9, (alpha / 100) * 1.3);
      return `${prop}: rgb(var(--lm-${family}-rgb) / ${Number(a.toFixed(2))}) !important`;
    }
    return null;
  }

  if (kind === 'divide' && isNeutral && NEUTRAL_BORDER[shade]) return `border-color: ${NEUTRAL_BORDER[shade]} !important`;
  return null;
}

/** A bg that stays saturated/dark in bright mode, so white text on it must stay white. */
function keepsLightText(kind, value, alphaRaw, ctx) {
  const alpha = alphaRaw == null ? null : Number(alphaRaw);
  if (kind !== 'bg' && kind !== 'from') return false;
  if (value.startsWith('[#')) {
    const hex = parseHex(value);
    return chroma(hex) >= 60;
  }
  if (value === 'black') return alpha != null && (alpha >= 70 || ctx.overlay);
  const [family, shade] = value.split('-');
  return HUES.has(family) && Number(shade) >= 400 && Number(shade) <= 700 && (alpha == null || alpha >= 70);
}

const rules = new Map(); // key -> { media, selectors:Set, decl }
const skipped = new Map();
const keepWhite = new Set();

function addRule(media, state, group, token, decl, suffix = '') {
  const attr = `[class~="${token}"]`;
  const target = group ? `${SCOPE} .group${state} ${attr}${suffix}` : `${SCOPE} ${attr}${state}${suffix}`;
  const key = `${media}\u0000${decl}`;
  if (!rules.has(key)) rules.set(key, { media, decl, selectors: new Set() });
  rules.get(key).selectors.add(target);
}

for (const file of walk(SRC)) {
  if (file.endsWith('.generated.css')) continue;
  const text = fs.readFileSync(file, 'utf8');
  // Class strings are the quoted/backticked fragments of the source; analysing per fragment lets
  // us see which utilities share an element (e.g. a coloured button with white text).
  for (const fragment of text.split(/["'`]/)) {
    if (!/(?:^|\s)(?:[a-z0-9\-]+:)*(?:bg|text|border|ring|from|via|to|divide)-/.test(fragment)) continue;
    const ctx = {
      whiteText: /(?:^|\s)text-white(?:\s|$)/.test(fragment),
      overlay: /(?:^|\s)(?:fixed|absolute|inset-0)(?:\s|$)|backdrop-blur/.test(fragment),
    };
    TOKEN.lastIndex = 0;
    let m;
    while ((m = TOKEN.exec(fragment))) {
      const [full, prefixRaw, kind, value, alphaRaw] = m;
      const prefixes = prefixRaw.split(':').filter(Boolean);
      let media = '';
      let state = '';
      let group = false;
      let unsupported = false;
      for (const p of prefixes) {
        if (MEDIA[p]) media = MEDIA[p];
        else if (STATES[p]) state += STATES[p];
        else if (p === 'group-hover') { group = true; state += ':hover'; }
        else unsupported = true;
      }
      if (unsupported) { skipped.set(full, (skipped.get(full) ?? 0) + 1); continue; }
      const hover = state.includes(':hover') || state.includes(':focus') || state.includes(':active');
      const token = full.replace(/\//g, '/');
      const decl = declFor(kind, value, alphaRaw, { hover, ctx });
      if (decl) addRule(media, state, group, token, decl, kind === 'divide' ? ' > :not(:last-child)' : '');
    }

    // White text sitting on a bg that stays saturated keeps its white (buttons, badges, scrims).
    if (ctx.whiteText) {
      TOKEN.lastIndex = 0;
      let m2;
      while ((m2 = TOKEN.exec(fragment))) {
        const [full, prefixRaw, kind, value, alphaRaw] = m2;
        if (prefixRaw || !keepsLightText(kind, value, alphaRaw, ctx)) continue;
        keepWhite.add(full);
      }
    }
  }
}

const css = [];
css.push('/* AUTO-GENERATED by scripts/generateLightTheme.mjs - do not edit by hand. */');
css.push('/* Re-skins the dark-first Tailwind utilities used in src/ for bright mode via the --lm-* variables in index.css. */');

const byMedia = new Map();
for (const rule of rules.values()) {
  if (!byMedia.has(rule.media)) byMedia.set(rule.media, []);
  byMedia.get(rule.media).push(rule);
}
// Base rules first, then responsive ones, so breakpoints win at equal specificity.
const orderedMedia = ['', ...Object.values(MEDIA)];
const emit = (rule, indent = '') => {
  const selectors = [...rule.selectors].sort();
  return `${indent}${selectors.join(`,\n${indent}`)} {\n${indent}  ${rule.decl};\n${indent}}`;
};
for (const media of orderedMedia) {
  const list = byMedia.get(media);
  if (!list) continue;
  list.sort((a, b) => a.decl.localeCompare(b.decl));
  if (!media) list.forEach((rule) => css.push(emit(rule)));
  else css.push(`@media ${media} {\n${list.map((rule) => emit(rule, '  ')).join('\n')}\n}`);
}

if (keepWhite.size) {
  const selectors = [...keepWhite].sort().map((token) => `${SCOPE} [class~="text-white"][class~="${token}"]`);
  css.push(`/* White text on saturated fills / scrims stays white. */\n${selectors.join(',\n')} {\n  color: #ffffff !important;\n}`);
}

fs.writeFileSync(OUT, `${css.join('\n\n')}\n`);
console.log(`light theme: ${rules.size} rule groups, ${keepWhite.size} white-text exceptions -> ${path.relative(ROOT, OUT)}`);
if (skipped.size) console.log(`skipped (unsupported variants): ${[...skipped.keys()].join(', ')}`);
