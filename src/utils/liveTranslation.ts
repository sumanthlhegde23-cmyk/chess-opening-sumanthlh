import { getCachedTranslation, translateTexts } from './translationClient';

type TranslationEntry = {
  original: string;
  read: () => string | null;
  write: (value: string) => void;
};

type TranslationBatchEntry = {
  text: string;
  entries: TranslationEntry[];
};

const originals = new WeakMap<Text, string>();
const lastWritten = new WeakMap<Text, string>();
const trackedText = new Set<Text>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const lastWrittenAttributes = new WeakMap<Element, Map<string, string>>();
const trackedAttributes = new Map<Element, Set<string>>();
const translatedAttributes = ['title', 'aria-label', 'placeholder'];
const ignoredSelector = 'script, style, noscript, svg, [data-no-translate], .opening-cinematic__board';

let generation = 0;
let observer: MutationObserver | null = null;
let controller: AbortController | null = null;

function shouldIgnore(element: Element | null): boolean {
  return !element || Boolean(element.closest(ignoredSelector));
}

function writeText(node: Text, value: string): void {
  lastWritten.set(node, value);
  node.nodeValue = value;
}

function writeAttribute(element: Element, name: string, value: string): void {
  const written = lastWrittenAttributes.get(element) || new Map<string, string>();
  written.set(name, value);
  lastWrittenAttributes.set(element, written);
  element.setAttribute(name, value);
}

function restoreOriginalContent(): void {
  trackedText.forEach((node) => {
    const written = lastWritten.get(node);
    const original = originals.get(node);
    if (node.isConnected && written !== undefined && node.nodeValue === written && original !== undefined) {
      node.nodeValue = original;
    }
    lastWritten.delete(node);
  });

  trackedAttributes.forEach((names, element) => {
    names.forEach((name) => {
      const written = lastWrittenAttributes.get(element)?.get(name);
      const original = originalAttributes.get(element)?.get(name);
      if (element.isConnected && written !== undefined && element.getAttribute(name) === written && original !== undefined) {
        element.setAttribute(name, original);
      }
    });
    lastWrittenAttributes.delete(element);
  });
}

function splitText(value: string): { leading: string; text: string; trailing: string } {
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  return { leading, text: value.slice(leading.length, value.length - trailing.length), trailing };
}

function startTranslation(language: string, onError: (message: string) => void): () => void {
  generation += 1;
  const currentGeneration = generation;
  observer?.disconnect();
  controller?.abort();
  controller = new AbortController();
  restoreOriginalContent();

  if (language === 'en') {
    return () => {
      if (generation === currentGeneration) generation += 1;
    };
  }
  const pending = new Map<string, TranslationBatchEntry>();
  let scheduled = false;
  let flushing = false;
  let failed = false;

  const applyTranslation = (entry: TranslationEntry, translated: string) => {
    if (generation === currentGeneration && entry.read() === entry.original) {
      entry.write(translated);
    }
  };

  const queueTranslation = (text: string, entry: TranslationEntry) => {
    if (failed || generation !== currentGeneration) return;
    const cached = getCachedTranslation(language, text);
    if (cached !== undefined) {
      applyTranslation(entry, cached);
      return;
    }
    const batchEntry = pending.get(text) || { text, entries: [] };
    batchEntry.entries.push(entry);
    pending.set(text, batchEntry);
    if (!scheduled && !flushing) {
      scheduled = true;
      window.setTimeout(() => void flush(), 40);
    }
  };

  const flush = async () => {
    scheduled = false;
    if (flushing || failed || generation !== currentGeneration) return;
    flushing = true;

    try {
      while (pending.size > 0 && generation === currentGeneration) {
        const batch: TranslationBatchEntry[] = [];
        let characterCount = 0;
        for (const [text, entry] of pending) {
          if (batch.length >= 30 || (batch.length > 0 && characterCount + text.length > 9000)) break;
          pending.delete(text);
          batch.push(entry);
          characterCount += text.length;
        }
        if (!batch.length) break;

        const translations = await translateTexts(language, batch.map(({ text }) => text), controller?.signal);
        batch.forEach((item, index) => {
          const translated = translations[index];
          item.entries.forEach((entry) => applyTranslation(entry, translated));
        });
      }
    } catch (error) {
      if (generation === currentGeneration && !(error instanceof DOMException && error.name === 'AbortError')) {
        failed = true;
        pending.clear();
        onError(error instanceof Error ? error.message : 'Translation is unavailable.');
      }
    } finally {
      flushing = false;
      if (pending.size > 0 && !failed && generation === currentGeneration && !scheduled) {
        scheduled = true;
        window.setTimeout(() => void flush(), 40);
      }
    }
  };

  const processText = (node: Text) => {
    const parent = node.parentElement;
    if (shouldIgnore(parent)) return;
    const current = node.nodeValue || '';
    if (!current.trim() || lastWritten.get(node) === current) return;

    const previousTranslation = lastWritten.get(node);
    const original = previousTranslation === undefined ? current : current;
    originals.set(node, original);
    trackedText.add(node);
    const { leading, text, trailing } = splitText(original);
    if (text.length < 2) return;

    queueTranslation(text, {
      original,
      read: () => node.isConnected ? node.nodeValue : null,
      write: (translated) => writeText(node, `${leading}${translated}${trailing}`),
    });
  };

  const processElement = (element: Element) => {
    if (shouldIgnore(element)) return;
    translatedAttributes.forEach((name) => {
      const current = element.getAttribute(name);
      if (!current || !current.trim()) return;
      const written = lastWrittenAttributes.get(element)?.get(name);
      if (written === current) return;

      const originalsForElement = originalAttributes.get(element) || new Map<string, string>();
      originalsForElement.set(name, current);
      originalAttributes.set(element, originalsForElement);
      const names = trackedAttributes.get(element) || new Set<string>();
      names.add(name);
      trackedAttributes.set(element, names);
      queueTranslation(current, {
        original: current,
        read: () => element.isConnected ? element.getAttribute(name) : null,
        write: (translated) => writeAttribute(element, name, translated),
      });
    });
  };

  const scan = (root: Node) => {
    if (root instanceof Text) processText(root);
    if (root instanceof Element) processElement(root);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) processText(walker.currentNode as Text);

    if (root instanceof Element) {
      root.querySelectorAll('*').forEach(processElement);
    }
  };

  observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === 'characterData' && record.target instanceof Text) {
        processText(record.target);
      } else if (record.type === 'attributes' && record.target instanceof Element) {
        processElement(record.target);
      } else {
        record.addedNodes.forEach(scan);
      }
    });
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: translatedAttributes,
  });
  scan(document.body);

  return () => {
    if (generation !== currentGeneration) return;
    generation += 1;
    observer?.disconnect();
    observer = null;
    controller?.abort();
    controller = null;
  };
}

export { startTranslation as startLiveTranslation };