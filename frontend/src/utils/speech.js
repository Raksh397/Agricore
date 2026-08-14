// Text-to-speech in the user's selected app language.
// Maps i18n language codes to BCP-47 speech locales.
const SPEECH_LOCALES = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
    ta: "ta-IN",
    te: "te-IN",
    ml: "ml-IN"
};

let cachedVoices = [];
if (typeof window !== "undefined" && window.speechSynthesis) {
    const load = () => { cachedVoices = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
}

// onEnd (optional) fires once the last chunk finishes, so callers can reset a
// "playing" indicator on their Listen button.
export const speak = (text, langCode = "en", onEnd) => {
    if (!window.speechSynthesis || !text) return;

    // Strip HTML tags so <br/> etc. are not read out
    const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!plain) return;

    const locale = SPEECH_LOCALES[langCode] || "en-IN";

    // Pick a matching installed voice if available (exact locale, then language prefix)
    const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
    const voice =
        voices.find(v => v.lang === locale) ||
        voices.find(v => v.lang.startsWith(langCode + "-")) ||
        voices.find(v => v.lang.startsWith(langCode)) ||
        voices.find(v => v.lang.replace("_", "-") === locale);

    window.speechSynthesis.cancel();

    // Chrome silently cuts off long utterances — split into sentence chunks (~180 chars)
    const sentences = plain.split(/(?<=[.।?!])\s+|\n+/).filter(Boolean);
    const chunks = [];
    let cur = "";
    for (const s of sentences) {
        if ((cur + " " + s).length > 180 && cur) { chunks.push(cur); cur = s; }
        else cur = cur ? cur + " " + s : s;
    }
    if (cur) chunks.push(cur);

    chunks.forEach((chunk, i) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = locale;
        if (voice) utterance.voice = voice;
        utterance.rate = 0.95;
        if (onEnd && i === chunks.length - 1) {
            utterance.onend = onEnd;
            utterance.onerror = onEnd;
        }
        window.speechSynthesis.speak(utterance);
    });
};

// Stop any playback immediately (used by a Listen button acting as a toggle).
export const stopSpeaking = () => window.speechSynthesis?.cancel();

export default speak;
