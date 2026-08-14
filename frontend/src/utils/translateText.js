// Auto-translate English app content to the selected language.
// Uses free MyMemory API with localStorage caching.
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const cache = {};
const store = (k, v) => { try { localStorage.setItem('tt_' + k, v); } catch { } };
const read = (k) => { try { return localStorage.getItem('tt_' + k); } catch { return null; } };

export async function translateText(text, lang) {
    if (!text || lang === 'en') return text;
    const plain = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const key = lang + ':' + plain.slice(0, 60) + plain.length;
    if (cache[key]) return cache[key];
    const cached = read(key);
    if (cached) { cache[key] = cached; return cached; }
    try {
        // MyMemory limit ~500 chars/request — translate in chunks
        const chunks = [];
        for (let i = 0; i < plain.length && i < 2000; i += 450) chunks.push(plain.slice(i, i + 450));
        const parts = await Promise.all(chunks.map(async c => {
            const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(c)}&langpair=en|${lang}`);
            const j = await r.json();
            return j?.responseData?.translatedText || c;
        }));
        const out = parts.join(' ');
        cache[key] = out; store(key, out);
        return out;
    } catch { return text; }
}

// React hook: returns translated text (English until loaded)
export function useTranslated(text) {
    const { i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [out, setOut] = useState(text);
    useEffect(() => {
        let live = true;
        if (lang === 'en') { setOut(text); return; }
        setOut(text);
        translateText(text, lang).then(v => live && setOut(v));
        return () => { live = false; };
    }, [text, lang]);
    return out;
}

// Drop-in component
export const TText = ({ text }) => useTranslated(text);
