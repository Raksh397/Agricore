import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Volume2, VolumeX, Mic, MicOff, Sparkles, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../api';
import { translateText } from '../utils/translateText';
import { speak, stopSpeaking } from '../utils/speech';

const RECOG_LOCALES = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN' };

// Translate non-English user input to English for the KB
const toEnglish = async (text, lang) => {
    if (lang === 'en') return text;
    try {
        const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${lang}|en`);
        const j = await r.json();
        return j?.responseData?.translatedText || text;
    } catch { return text; }
};

const Chatbot = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [listening, setListening] = useState(false);
    const [speakingIdx, setSpeakingIdx] = useState(null);
    const endRef = useRef(null);
    const recogRef = useRef(null);

    // Nothing is ever read out on its own — only this button starts speech, and
    // tapping it again (or tapping another message) stops the current one.
    const toggleSpeak = (i, text) => {
        if (speakingIdx === i) { stopSpeaking(); setSpeakingIdx(null); return; }
        setSpeakingIdx(i);
        speak(text, lang, () => setSpeakingIdx(null));
    };

    // Leaving the page or switching language must not leave a voice talking.
    useEffect(() => () => stopSpeaking(), []);

    useEffect(() => {
        stopSpeaking();
        setSpeakingIdx(null);
        API.post('/chatbot', { message: 'hello', lang }).then(async r => {
            const txt = r.data.lang === lang ? r.data.reply : await translateText(r.data.reply, lang);
            setMessages([{ from: 'bot', text: txt }]);
        }).catch(() => {
            setMessages([{ from: 'bot', text: t('chatbot_offline') }]);
        });
    }, [lang]);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

    const send = async (text) => {
        const q = (text ?? input).trim();
        if (!q || busy) return;
        setInput('');
        const history = messages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', text: m.text }));
        setMessages(m => [...m, { from: 'user', text: q }]);
        setBusy(true);
        try {
            // message = English for the offline keyword KB; message_raw = what the
            // farmer actually typed, which the AI path reads directly.
            const en = await toEnglish(q, lang);
            const r = await API.post('/chatbot', { message: en, message_raw: q, lang, history });
            // The AI already answers in the selected language; only the offline
            // KB (which is English) still needs machine translation.
            const reply = r.data.lang === lang ? r.data.reply : await translateText(r.data.reply, lang);
            // No auto-speak: the farmer taps Listen on a message when they want it read out.
            setMessages(m => [...m, { from: 'bot', text: reply }]);
        } catch {
            setMessages(m => [...m, { from: 'bot', text: t('chatbot_offline') }]);
        } finally { setBusy(false); }
    };

    const toggleMic = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Voice input not supported in this browser'); return; }
        if (listening) { recogRef.current?.stop(); return; }
        const rec = new SR();
        rec.lang = RECOG_LOCALES[lang] || 'en-IN';
        rec.interimResults = false;
        rec.onstart = () => setListening(true);
        rec.onend = () => setListening(false);
        rec.onerror = () => setListening(false);
        rec.onresult = (e) => {
            const text = e.results[e.resultIndex][0].transcript;
            send(text);
        };
        recogRef.current = rec;
        rec.start();
    };

    const quick = [t('qb_loan'), t('qb_disease'), t('qb_fert'), t('qb_scheme'), t('qb_app')];

    return (
        <div className="flex flex-col h-[calc(100vh-9rem)] pb-20 -mx-4 md:mx-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-b-3xl md:rounded-3xl shadow-lg">
                <span className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center"><Bot className="h-6 w-6" /></span>
                <div className="flex-1">
                    <h1 className="text-lg font-bold flex items-center gap-1.5">KisanBot <Sparkles className="h-4 w-4" /></h1>
                    <p className="text-xs text-white/85">{t('chatbot_sub')}</p>
                </div>
                <button onClick={() => { stopSpeaking(); setSpeakingIdx(null); setMessages(messages.slice(0, 1)); }} className="p-2 rounded-full hover:bg-white/15"><Trash2 className="h-5 w-5" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex items-end gap-2 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.from === 'bot' && (
                            <span className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0"><Bot className="h-4 w-4" /></span>
                        )}
                        <div className={`max-w-[82%] px-4 py-3 text-sm whitespace-pre-line shadow-sm ${m.from === 'user'
                            ? 'bg-green-600 text-white rounded-2xl rounded-br-md'
                            : 'bg-white border border-gray-100 rounded-2xl rounded-bl-md'}`}>
                            {m.text}
                            {m.from === 'bot' && (
                                <button onClick={() => toggleSpeak(i, m.text)}
                                    className={`flex items-center gap-1 mt-2 text-xs font-medium ${speakingIdx === i ? 'text-rose-600' : 'text-green-600'}`}>
                                    {speakingIdx === i
                                        ? <><VolumeX className="h-3.5 w-3.5" /> {t('stop')}</>
                                        : <><Volume2 className="h-3.5 w-3.5" /> {t('listen')}</>}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {busy && (
                    <div className="flex items-end gap-2">
                        <span className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center"><Bot className="h-4 w-4" /></span>
                        <div className="bg-white border rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                            <span className="inline-flex gap-1">
                                <span className="h-2 w-2 bg-green-400 rounded-full animate-bounce" />
                                <span className="h-2 w-2 bg-green-400 rounded-full animate-bounce [animation-delay:120ms]" />
                                <span className="h-2 w-2 bg-green-400 rounded-full animate-bounce [animation-delay:240ms]" />
                            </span>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2">
                {quick.map(q => (
                    <button key={q} onClick={() => send(q)} className="shrink-0 text-xs bg-white border border-green-200 text-green-700 rounded-full px-3.5 py-2 hover:bg-green-50 font-medium">{q}</button>
                ))}
            </div>

            {/* Input bar */}
            <div className="flex gap-2 px-4 pb-1">
                <button onClick={toggleMic}
                    className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white border border-gray-300 text-gray-700'}`}>
                    {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder={listening ? t('listening') : t('ask_anything')}
                    className="flex-1 h-12 rounded-full border border-gray-300 px-5 outline-none focus:border-green-500 bg-white text-sm"
                />
                <button onClick={() => send()} disabled={busy} className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center disabled:opacity-50 shrink-0 hover:bg-green-700">
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
