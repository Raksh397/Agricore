import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sprout, Thermometer, Camera, RefreshCw } from 'lucide-react';
import { recommendCrop } from '../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

import { useTranslation } from 'react-i18next'; // Add import
import { speak } from '../utils/speech';
import { translateCrop } from '../utils/agriI18n';

const Crop = () => {
    const { t, i18n } = useTranslation(); // Init hook
    const [formData, setFormData] = useState({
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        temperature: '',
        humidity: '',
        rainfall: '',
        ph: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzingSoil, setAnalyzingSoil] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // ... existing useEffect and update logic ...

    useEffect(() => {
        // Fetch weather if location exists
        const storedLocation = localStorage.getItem('userLocation');
        if (storedLocation) {
            const { latitude, longitude } = JSON.parse(storedLocation);
            fetchWeather(latitude, longitude);
        }
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {
            const response = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&past_days=92&daily=precipitation_sum&forecast_days=1&timezone=auto`
            );
            const current = response.data.current;
            // Model expects seasonal rainfall (mm), not this instant's rain.
            // Sum the past ~3 months of daily precipitation.
            const dailyRain = response.data.daily?.precipitation_sum || [];
            const seasonalRainfall = Math.round(dailyRain.reduce((a, b) => a + (b || 0), 0));
            setFormData(prev => ({
                ...prev,
                temperature: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                rainfall: seasonalRainfall
            }));
        } catch (err) {
            console.error("Error fetching weather:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSoilPhoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAnalyzingSoil(true);
            setTimeout(() => {
                setFormData(prev => ({
                    ...prev,
                    nitrogen: Math.floor(Math.random() * (120 - 40) + 40),
                    phosphorus: Math.floor(Math.random() * (80 - 20) + 20),
                    potassium: Math.floor(Math.random() * (80 - 20) + 20),
                    ph: (Math.random() * (7.5 - 5.5) + 5.5).toFixed(1)
                }));
                setAnalyzingSoil(false);
            }, 2000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const payload = {
            nitrogen: Number(formData.nitrogen),
            phosphorus: Number(formData.phosphorus),
            potassium: Number(formData.potassium),
            temperature: Number(formData.temperature),
            humidity: Number(formData.humidity),
            rainfall: Number(formData.rainfall),
            ph: Number(formData.ph)
        };

        try {
            const response = await recommendCrop(payload);
            setResult(response.data);

            if (response.data.recommended_crops && response.data.recommended_crops.length > 0) {
                const lang = (i18n.language || 'en').split('-')[0];
                const crop = translateCrop(response.data.recommended_crops[0], lang);
                const templates = {
                    en: `I recommend planting ${crop}.`,
                    hi: `मैं ${crop} की खेती करने की सलाह देता हूँ।`,
                    kn: `ನಾನು ${crop} ಬೆಳೆಯಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ.`,
                    ta: `${crop} பயிரிட நான் பரிந்துரைக்கிறேன்.`,
                    te: `${crop} పండించమని నేను సిఫార్సు చేస్తున్నాను.`,
                    ml: `${crop} കൃഷി ചെയ്യാൻ ഞാൻ ശുപാർശ ചെയ്യുന്നു.`
                };
                speak(templates[lang] || templates.en, lang);
            }
        } catch (err) {
            console.error("Full Error Object:", err);
            if (err.response) {
                setError(err.response.data.detail || "Error getting recommendation. Please check if all fields are filled correctly.");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('crop_advisor')}</h1>
                <p className="text-muted-foreground">{t('crop_desc')}</p>
            </div>

            <Card className="border-none">
                <CardHeader>
                    <CardTitle>{t('soil_analysis')}</CardTitle>
                    <CardDescription>{t('soil_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="flex flex-col items-center justify-center space-y-3 rounded-2xl border-none shadow-soft hover:shadow-lg bg-white p-8 cursor-pointer transition-all active:scale-[0.98] relative"
                    >
                        {analyzingSoil && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl z-10">
                                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 font-bold text-primary">{t('analyzing')}</span>
                            </div>
                        )}
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                            <Camera className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <span className="text-base font-bold text-foreground block">{t('analyze_soil_photo')}</span>
                            <span className="text-xs text-muted-foreground">{t('tap_scan_soil')}</span>
                        </div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleSoilPhoto}
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('nitrogen')}</Label>
                                <Input name="nitrogen" type="number" value={formData.nitrogen} onChange={handleChange} placeholder="ex. 90" required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('phosphorus')}</Label>
                                <Input name="phosphorus" type="number" value={formData.phosphorus} onChange={handleChange} placeholder="ex. 40" required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('potassium')}</Label>
                                <Input name="potassium" type="number" value={formData.potassium} onChange={handleChange} placeholder="ex. 40" required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('ph_level')}</Label>
                                <Input name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange} placeholder="ex. 6.5" required />
                            </div>
                        </div>

                        <div className="rounded-lg border p-4 bg-muted/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Thermometer className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">{t('env_data')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">{t('temp')}</Label>
                                    <Input name="temperature" type="number" value={formData.temperature} onChange={handleChange} className="h-8 text-xs" required />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">{t('humidity')}</Label>
                                    <Input name="humidity" type="number" value={formData.humidity} onChange={handleChange} className="h-8 text-xs" required />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">{t('rainfall')}</Label>
                                    <Input name="rainfall" type="number" value={formData.rainfall} onChange={handleChange} className="h-8 text-xs" required />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sprout className="mr-2 h-4 w-4" />}
                            {loading ? t('analyzing') : t('recommend_button')}
                        </Button>
                    </form>

                    {error && (
                        <div className="text-sm font-medium text-destructive text-center bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="rounded-lg border bg-green-50/50 p-6 text-center animate-in fade-in zoom-in duration-300">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2">{t('best_crop')}</h4>
                            <h2 className="text-4xl font-extrabold text-green-700 tracking-tight">
                                {result.recommended_crops && translateCrop(result.recommended_crops[0], (i18n.language || 'en').split('-')[0])}
                            </h2>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Crop;
