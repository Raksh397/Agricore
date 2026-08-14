import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { speak } from '../utils/speech';

const load = () => { try { return JSON.parse(localStorage.getItem('reminders')) || []; } catch { return []; } };
const save = (r) => localStorage.setItem('reminders', JSON.stringify(r));

// Checks due reminders; fires browser notification + voice. Called from App too.
export const checkReminders = (lang = 'en') => {
    const rs = load();
    const now = Date.now();
    let changed = false;
    rs.forEach(r => {
        if (!r.done && new Date(r.when).getTime() <= now) {
            r.done = true; changed = true;
            if (Notification?.permission === 'granted') new Notification('🌾 Agricore', { body: r.text });
            speak(r.text, lang);
        }
    });
    if (changed) save(rs);
    return rs;
};

const PRESETS = ['spray_reminder', 'fert_reminder', 'irrigate_reminder', 'harvest_reminder'];

const Reminders = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [items, setItems] = useState(load);
    const [text, setText] = useState('');
    const [when, setWhen] = useState('');

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
        const id = setInterval(() => setItems([...checkReminders(lang)]), 30000);
        return () => clearInterval(id);
    }, [lang]);

    const add = (txt) => {
        const w = when || new Date(Date.now() + 3600e3).toISOString().slice(0, 16);
        const next = [...items, { id: Date.now(), text: txt || text, when: w, done: false }];
        setItems(next); save(next); setText('');
    };
    const del = (id) => { const next = items.filter(r => r.id !== id); setItems(next); save(next); };

    return (
        <div className="space-y-5 pb-24">
            <h1 className="text-3xl font-bold flex items-center gap-2"><Bell className="h-8 w-8 text-primary" /> {t('reminders')}</h1>

            <div className="bg-white rounded-2xl border p-4 space-y-3">
                <Input value={text} onChange={e => setText(e.target.value)} placeholder={t('reminder_text')} />
                <Input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
                <Button className="w-full gap-2" onClick={() => add()} disabled={!text.trim()}><Plus className="h-4 w-4" /> {t('add_reminder')}</Button>
                <div className="flex gap-2 flex-wrap">
                    {PRESETS.map(p => (
                        <button key={p} onClick={() => add(t(p))} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5">{t(p)}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {items.sort((a, b) => new Date(a.when) - new Date(b.when)).map(r => (
                    <div key={r.id} className={`flex items-center gap-3 bg-white border rounded-xl p-3 ${r.done ? 'opacity-50' : ''}`}>
                        <Bell className={`h-5 w-5 ${r.done ? 'text-gray-400' : 'text-primary'}`} />
                        <div className="flex-1">
                            <p className="font-medium text-sm">{r.text}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.when).toLocaleString(i18n.language)}</p>
                        </div>
                        <button onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" /></button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-center text-muted-foreground py-8">{t('no_reminders')}</p>}
            </div>
        </div>
    );
};

export default Reminders;
