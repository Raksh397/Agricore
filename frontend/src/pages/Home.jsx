import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ScanLine, FileCheck2, Pill, XCircle, CheckCircle2, Leaf, SprayCan, Calculator, X, Bot, Database } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CROP_CATALOG } from '../utils/cropCatalog';
import { translateCrop } from '../utils/agriI18n';
import CropInfoModal from '../components/CropInfoModal';
import { getPreciseLocation } from '../utils/geo';
import { CROP_INFO } from '../utils/cropCatalog';
import { Button } from '../components/ui/button';

const DEFAULT_CROPS = ['almond', 'barley', 'bean', 'black_gram', 'cabbage'];

const Home = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [weather, setWeather] = useState(null);
    const [daily, setDaily] = useState(null);
    const [myCrops, setMyCrops] = useState(() => {
        try { return JSON.parse(localStorage.getItem('myCrops')) || DEFAULT_CROPS; }
        catch { return DEFAULT_CROPS; }
    });
    const [showCropPicker, setShowCropPicker] = useState(false);
    const [infoCrop, setInfoCrop] = useState(null);
    const [place, setPlace] = useState('');

    useEffect(() => {
        getPreciseLocation().then(({ latitude, longitude }) => {
            fetchWeather(latitude, longitude);
            axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=16`)
                .then(r => {
                    const a = r.data.address || {};
                    setPlace([a.hamlet || a.village || a.suburb || a.neighbourhood || a.town || a.city, a.state_district || a.county].filter(Boolean).join(', '));
                }).catch(() => { });
        }).catch(() => {
            const stored = localStorage.getItem('userLocation');
            if (stored) { const { latitude, longitude } = JSON.parse(stored); fetchWeather(latitude, longitude); }
        });
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {
            const res = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,wind_speed_10m_max&forecast_days=3&timezone=auto`
            );
            setWeather(res.data.current);
            setDaily(res.data.daily);
        } catch (err) {
            console.error("weather:", err);
        }
    };

    const toggleCrop = (id) => {
        setMyCrops(prev => {
            const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
            localStorage.setItem('myCrops', JSON.stringify(next));
            return next;
        });
    };

    // Spraying is unfavourable when windy, raining or very hot
    const sprayOk = weather && weather.wind_speed_10m <= 15 && weather.precipitation === 0 && weather.temperature_2m < 35;
    const today = new Date().toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' });

    const cropCircles = CROP_CATALOG.filter(c => myCrops.includes(c.id));

    const tools = [
        { label: 'AgriBot', icon: Bot, path: '/chatbot', isNew: true },
        { label: t('fert_calc'), icon: Leaf, path: '/fertilizer', isNew: false },
        { label: t('pest_calc'), icon: SprayCan, path: '/pesticide', isNew: true },
        { label: t('farm_calc'), icon: Calculator, path: '/farmcalc', isNew: true },
        { label: t('farm_data'), icon: Database, path: '/data', isNew: true },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 -mx-4 md:mx-0">
            {/* Title row */}
            <div className="flex items-center justify-between px-4 pt-1">
                <h1 className="text-2xl font-extrabold tracking-tight">Agri<span className="text-primary">core</span></h1>
            </div>

            {/* Crop circles */}
            <div className="flex gap-4 overflow-x-auto px-4 py-4 items-start">
                {cropCircles.map(c => (
                    <button key={c.id} onClick={() => setInfoCrop(c)} className="flex flex-col items-center gap-1.5 shrink-0 w-20">
                        <div className="h-20 w-20 rounded-full border border-gray-200 shadow-sm flex items-center justify-center text-4xl hover:scale-105 transition-transform" style={{ background: c.bg }}>
                            {c.emoji}
                        </div>
                        <span className="text-sm text-gray-800 truncate w-20 text-center">{translateCrop(c.name, (i18n.language || 'en').split('-')[0])}</span>
                    </button>
                ))}
                <button onClick={() => setShowCropPicker(true)} className="shrink-0 mt-5 h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                    <Plus className="h-6 w-6" />
                </button>
            </div>

            {/* Weather + spraying strip */}
            <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 px-4 py-4">
                <div className="flex gap-3">
                    <button onClick={() => navigate('/weather')} className="bg-white rounded-2xl border border-sky-100 px-4 py-3 text-center shadow-sm shrink-0 hover:border-sky-300">
                        <p className="text-sm text-gray-600">{today}</p>
                        <p className="text-xl font-bold">{weather ? `${Math.round(weather.temperature_2m)} °C` : '--'}</p>
                        {place && <p className="text-[10px] text-gray-500 max-w-[5rem] truncate">📍{place}</p>}
                    </button>
                    <div className={`flex-1 rounded-full border-2 flex items-center justify-between px-5 ${sprayOk ? 'border-green-200 bg-white' : 'border-rose-200 bg-white'}`}>
                        <div>
                            <p className="text-sm text-gray-600">{t('spray_cond')}</p>
                            <p className="font-bold text-gray-900">{weather ? (sprayOk ? t('favourable') : t('unfavourable')) : '…'}</p>
                        </div>
                        {sprayOk
                            ? <CheckCircle2 className="h-8 w-8 text-green-500" />
                            : <XCircle className="h-8 w-8 text-rose-400" />}
                    </div>
                </div>

                {/* 3-day forecast with crop-aware advice */}
                {daily && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {daily.time.map((d, i) => {
                            const rain = daily.precipitation_sum[i];
                            const wind = daily.wind_speed_10m_max[i];
                            const tmax = daily.temperature_2m_max[i];
                            const good = rain < 2 && wind <= 20 && tmax < 36;
                            const advice = rain >= 2 ? t('adv_rain') : wind > 20 ? t('adv_wind') : tmax >= 36 ? t('adv_heat') : t('adv_ok');
                            const WMOE = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 51: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 80: '🌦️', 95: '⛈️' };
                            return (
                                <button key={d} onClick={() => navigate('/weather')} className={`rounded-2xl border-2 p-3 text-center bg-white ${good ? 'border-green-200' : 'border-rose-200'}`}>
                                    <p className="text-xs text-gray-500">{i === 0 ? t('today') : new Date(d).toLocaleDateString(i18n.language, { weekday: 'short' })}</p>
                                    <p className="text-2xl my-0.5">{WMOE[daily.weathercode[i]] || '☀️'}</p>
                                    <p className="text-sm font-bold">{Math.round(tmax)}° <span className="text-gray-400 font-normal">{Math.round(daily.temperature_2m_min[i])}°</span></p>
                                    <p className={`text-[10px] font-semibold mt-1 ${good ? 'text-green-600' : 'text-rose-500'}`}>{good ? t('favourable') : t('unfavourable')}</p>
                                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{advice}</p>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Take a picture flow */}
                <div className="bg-gray-50 rounded-3xl p-6 mt-4 border border-gray-100">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <ScanLine className="h-10 w-10 text-gray-800" strokeWidth={1.3} />
                            <span className="text-sm text-gray-700">{t('take_photo')}</span>
                        </div>
                        <span className="text-gray-400 text-2xl">›</span>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <FileCheck2 className="h-10 w-10 text-gray-800" strokeWidth={1.3} />
                            <span className="text-sm text-gray-700">{t('see_diagnosis')}</span>
                        </div>
                        <span className="text-gray-400 text-2xl">›</span>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <Pill className="h-10 w-10 text-gray-800" strokeWidth={1.3} />
                            <span className="text-sm text-gray-700">{t('get_medicine')}</span>
                        </div>
                    </div>
                    <Button
                        className="w-full h-13 mt-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3"
                        onClick={() => navigate('/disease?camera=true')}
                    >
                        {t('take_photo')}
                    </Button>
                </div>
            </div>

            {/* Tools */}
            <div className="px-4 mt-6">
                <h2 className="text-2xl font-bold mb-3">{t('tools')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {tools.map(tool => (
                        <button
                            key={tool.path + tool.label}
                            onClick={() => navigate(tool.path)}
                            className="relative bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-primary transition-colors"
                        >
                            {tool.isNew && (
                                <span className="absolute -top-2 right-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t('new')}</span>
                            )}
                            <span className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                                <tool.icon className="h-5 w-5" />
                            </span>
                            <span className="text-sm font-medium text-gray-900 leading-tight block">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Library */}
            <div className="px-4 mt-8">
                <h2 className="text-2xl font-bold mb-3">{t('library')}</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-3">
                        <button onClick={() => navigate('/library?tab=crops')} className="w-full bg-indigo-100/70 rounded-2xl p-4 flex items-start justify-between h-28 hover:bg-indigo-100">
                            <span className="font-semibold text-gray-900">{t('crops_lib')}</span>
                            <span className="h-9 w-9 rounded-full bg-white flex items-center justify-center">🍅</span>
                        </button>
                        <button onClick={() => navigate('/library?tab=tips')} className="w-full bg-indigo-100/70 rounded-2xl p-4 flex items-end justify-between h-40 hover:bg-indigo-100">
                            <span className="font-semibold text-gray-900 text-left">{t('tips_lib')}</span>
                            <span className="h-9 w-9 rounded-full bg-white flex items-center justify-center">🌱</span>
                        </button>
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => navigate('/library?tab=diseases')} className="w-full bg-indigo-100/70 rounded-2xl p-4 flex items-center justify-between h-40 hover:bg-indigo-100">
                            <span className="font-semibold text-gray-900 text-left">{t('pests_lib')}</span>
                            <span className="h-9 w-9 rounded-full bg-white flex items-center justify-center">🐛</span>
                        </button>
                        <button onClick={() => navigate('/weather')} className="relative w-full bg-indigo-100/70 rounded-2xl p-4 flex items-center justify-between h-28 hover:bg-indigo-100">
                            <span className="font-semibold text-gray-900 text-left">{t('weather_title')}</span>
                            <span className="h-9 w-9 rounded-full bg-white flex items-center justify-center">🌦️</span>
                        </button>
                    </div>
                </div>
            </div>

            {infoCrop && <CropInfoModal crop={infoCrop} onClose={() => setInfoCrop(null)} />}

            {/* Crop picker modal */}
            {showCropPicker && (
                <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setShowCropPicker(false)}>
                    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{t('select_your_crops')}</h2>
                            <button onClick={() => setShowCropPicker(false)}><X className="h-6 w-6 text-gray-500" /></button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {CROP_CATALOG.map(c => (
                                <button key={c.id} onClick={() => toggleCrop(c.id)} className="flex flex-col items-center gap-1">
                                    <span
                                        className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl border-2 ${myCrops.includes(c.id) ? 'border-primary' : 'border-transparent'}`}
                                        style={{ background: c.bg }}
                                    >{c.emoji}</span>
                                    <span className="text-[11px] text-gray-700 w-16 truncate text-center">{translateCrop(c.name, (i18n.language || 'en').split('-')[0])}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Home;
