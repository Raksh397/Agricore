import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Droplets, Wind, CloudRain } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const WMO = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '🌨️', 80: '🌦️', 81: '🌧️', 82: '⛈️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
};

const Weather = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);
    const [place, setPlace] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const locate = () => {
        setLoading(true);
        setError(null);
        if (!navigator.geolocation) { setError(t('geo_not_supported')); setLoading(false); return; }
        // enableHighAccuracy + no cache => exact GPS fix
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
                try {
                    const [w, g] = await Promise.all([
                        axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weathercode,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=7&timezone=auto`),
                        axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14&accept-language=${i18n.language}`)
                    ]);
                    setData(w.data);
                    const a = g.data.address || {};
                    setPlace([a.village || a.town || a.suburb || a.city_district || a.city, a.state_district || a.county, a.state].filter(Boolean).join(', ') || g.data.display_name);
                } catch (e) {
                    setError(t('market_fetch_failed'));
                } finally { setLoading(false); }
            },
            (err) => { setError(t('region_not_detected') + ' (' + err.message + ')'); setLoading(false); },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    useEffect(() => { locate(); }, []);

    const fmtDay = (d) => new Date(d).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric' });
    const nowHour = new Date().getHours();

    return (
        <div className="space-y-5 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t('weather_title')}</h1>
                <button onClick={locate} className="p-2 rounded-full bg-white border hover:border-primary">
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && <p className="text-red-600 bg-red-50 rounded-xl p-3 text-sm">{error}</p>}

            {place && (
                <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {place}</p>
            )}

            {data && (
                <>
                    {/* Current */}
                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-3xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-5xl font-bold">{Math.round(data.current.temperature_2m)}°C</p>
                                <p className="text-white/90 mt-1">{t('now')}</p>
                            </div>
                            <span className="text-6xl">{WMO[data.current.weathercode] || '☀️'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
                            <div className="bg-white/15 rounded-xl p-2.5 flex items-center gap-2"><Droplets className="h-4 w-4" /> {data.current.relative_humidity_2m}%</div>
                            <div className="bg-white/15 rounded-xl p-2.5 flex items-center gap-2"><Wind className="h-4 w-4" /> {Math.round(data.current.wind_speed_10m)} km/h</div>
                            <div className="bg-white/15 rounded-xl p-2.5 flex items-center gap-2"><CloudRain className="h-4 w-4" /> {data.current.precipitation} mm</div>
                        </div>
                    </div>

                    {/* Hourly (next 24h) */}
                    <div>
                        <h2 className="font-bold text-lg mb-2">{t('hourly')}</h2>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {data.hourly.time.slice(nowHour, nowHour + 24).map((tm, i) => {
                                const idx = nowHour + i;
                                return (
                                    <div key={tm} className="shrink-0 bg-white border rounded-2xl p-3 text-center w-18 min-w-[4.5rem]">
                                        <p className="text-xs text-muted-foreground">{new Date(tm).getHours()}:00</p>
                                        <p className="text-xl my-1">{WMO[data.hourly.weathercode[idx]] || '☀️'}</p>
                                        <p className="font-semibold text-sm">{Math.round(data.hourly.temperature_2m[idx])}°</p>
                                        <p className="text-xs text-blue-500">{data.hourly.precipitation_probability[idx]}%</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 7-day */}
                    <div>
                        <h2 className="font-bold text-lg mb-2">{t('week_forecast')}</h2>
                        <div className="bg-white border rounded-2xl divide-y">
                            {data.daily.time.map((d, i) => (
                                <div key={d} className="flex items-center justify-between px-4 py-3">
                                    <span className="w-20 font-medium">{i === 0 ? t('today') : fmtDay(d)}</span>
                                    <span className="text-2xl">{WMO[data.daily.weathercode[i]] || '☀️'}</span>
                                    <span className="text-blue-500 text-sm w-16 text-center">{data.daily.precipitation_sum[i]} mm</span>
                                    <span className="w-24 text-right">
                                        <b>{Math.round(data.daily.temperature_2m_max[i])}°</b>
                                        <span className="text-muted-foreground"> / {Math.round(data.daily.temperature_2m_min[i])}°</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Weather;
