import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { speak } from '../utils/speech';

// Localized voice responses
const REPLIES = {
    disease: {
        en: "Opening disease prediction camera.", hi: "रोग पहचान कैमरा खोल रहा हूँ।", kn: "ರೋಗ ಪತ್ತೆ ಕ್ಯಾಮೆರಾ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
        ta: "நோய் கண்டறிதல் கேமராவைத் திறக்கிறேன்.", te: "వ్యాధి గుర్తింపు కెమెరా తెరుస్తున్నాను.", ml: "രോഗ നിർണ്ണയ ക്യാമറ തുറക്കുന്നു."
    },
    crop: {
        en: "Opening crop recommendation.", hi: "फसल सिफारिश खोल रहा हूँ।", kn: "ಬೆಳೆ ಶಿಫಾರಸು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
        ta: "பயிர் பரிந்துரையைத் திறக்கிறேன்.", te: "పంట సిఫార్సు తెరుస్తున్నాను.", ml: "വിള ശുപാർശ തുറക്കുന്നു."
    },
    fertilizer: {
        en: "Opening fertilizer recommendation.", hi: "उर्वरक सिफारिश खोल रहा हूँ।", kn: "ಗೊಬ್ಬರ ಶಿಫಾರಸು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
        ta: "உர பரிந்துரையைத் திறக்கிறேன்.", te: "ఎరువుల సిఫార్సు తెరుస్తున్నాను.", ml: "വള ശുപാർശ തുറക്കുന്നു."
    },
    home: {
        en: "Going home.", hi: "होम पेज पर जा रहा हूँ।", kn: "ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇನೆ.",
        ta: "முகப்புக்குச் செல்கிறேன்.", te: "హోమ్‌కు వెళ్తున్నాను.", ml: "ഹോമിലേക്ക് പോകുന്നു."
    },
    unknown: {
        en: "I didn't catch that. Please try again.", hi: "मैं समझ नहीं पाया। कृपया फिर से कोशिश करें।", kn: "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        ta: "எனக்குப் புரியவில்லை. மீண்டும் முயற்சிக்கவும்.", te: "నాకు అర్థం కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.", ml: "എനിക്ക് മനസ്സിലായില്ല. വീണ്ടും ശ്രമിക്കുക."
    }
};

const RECOG_LOCALES = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN' };

// Keywords per language so commands work when spoken in the local language too
const KEYWORDS = {
    disease: ['disease', 'predict', 'रोग', 'बीमारी', 'ರೋಗ', 'நோய்', 'వ్యాధి', 'രോഗം'],
    crop: ['crop', 'recommend', 'फसल', 'ಬೆಳೆ', 'பயிர்', 'పంట', 'വിള'],
    fertilizer: ['fertilizer', 'उर्वरक', 'खाद', 'ಗೊಬ್ಬರ', 'உரம்', 'ఎరువు', 'വളം'],
    home: ['home', 'होम', 'घर', 'ಮುಖಪುಟ', 'முகப்பு', 'హోమ్', 'ഹോം']
};

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const lang = (i18n.language || 'en').split('-')[0];
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = RECOG_LOCALES[lang] || 'en-IN';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript.toLowerCase();
            console.log("Transcript:", transcript);

            const say = (key) => speak(REPLIES[key][lang] || REPLIES[key].en, lang);
            const matches = (key) => KEYWORDS[key].some(k => transcript.includes(k));

            if (matches('disease')) {
                say('disease');
                navigate('/disease?camera=true');
            } else if (matches('crop')) {
                say('crop');
                navigate('/crop');
            } else if (matches('fertilizer')) {
                say('fertilizer');
                navigate('/fertilizer');
            } else if (matches('home')) {
                say('home');
                navigate('/');
            } else {
                say('unknown');
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [navigate, i18n.language]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return null;

    return (
        <div
            className={`fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-50 rounded-full overflow-hidden cursor-pointer shadow-xl transition-all duration-500 ease-in-out ${isListening ? 'w-32 h-32 shadow-2xl' : 'w-16 h-16 hover:scale-110'
                }`}
            onClick={toggleListening}
            role="button"
            tabIndex={0}
            aria-label={isListening ? "Stop listening" : "Start listening"}
        >
            <video
                src="https://firebasestorage.googleapis.com/v0/b/test-storage-ai.appspot.com/o/tropica-hive-asset%2Fagent%2Fagent.mp4?alt=media&token=135b88ee-0a4e-4f7f-9f8e-7ca0a4555e8c"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-150 pointer-events-none"
            />
        </div>
    );
};

export default VoiceAssistant;
