import React, { useState } from 'react';
import { Droplets, Sprout, RefreshCw, AlertCircle } from 'lucide-react';
import { recommendFertilizer } from '../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

import { useTranslation } from 'react-i18next'; // Add import
import { speak } from '../utils/speech';
import { translateCrop } from '../utils/agriI18n';

const Fertilizer = () => {
    const { t, i18n } = useTranslation(); // Init hook
    const [formData, setFormData] = useState({
        crop: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        soil_type: ''
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const lang = (i18n.language || 'en').split('-')[0];
            const response = await recommendFertilizer({ ...formData, lang });
            setResult(response.data);

            // Speak the crop name + full recommendation in the selected language
            const cropName = translateCrop(formData.crop, lang);
            const intro = {
                en: `Fertilizer advice for ${cropName}.`,
                hi: `${cropName} के लिए उर्वरक सलाह।`,
                kn: `${cropName} ಗಾಗಿ ಗೊಬ್ಬರ ಸಲಹೆ.`,
                ta: `${cropName} க்கான உர ஆலோசனை.`,
                te: `${cropName} కోసం ఎరువుల సలహా.`,
                ml: `${cropName} നുള്ള വള ഉപദേശം.`
            };
            speak(`${intro[lang] || intro.en} ${response.data.recommendation}`, lang);

        } catch (err) {
            setError("Failed to get advice. Make sure all fields are filled.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const crops = [
        "Rice", "Maize", "Chickpea", "Kidney Beans", "Pigeon Peas", "Moth Beans",
        "Mung Bean", "Black Gram", "Lentil", "Pomegranate", "Banana", "Mango",
        "Grapes", "Watermelon", "Muskmelon", "Apple", "Orange", "Papaya",
        "Coconut", "Cotton", "Jute", "Coffee"
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('fert_guide_title')}</h1>
                <p className="text-muted-foreground">{t('fert_desc')}</p>
            </div>

            <Card className="border-none">
                <CardHeader>
                    <CardTitle>{t('nutrient_calc')}</CardTitle>
                    <CardDescription>{t('nutrient_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>{t('select_crop')}</Label>
                            <select
                                name="crop"
                                value={formData.crop}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">{t('select_crop')}...</option>
                                {crops.map(crop => (
                                    <option key={crop} value={crop}>{translateCrop(crop, (i18n.language || 'en').split('-')[0])}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>{t('nitrogen')}</Label>
                                <Input type="number" name="nitrogen" placeholder="50" value={formData.nitrogen} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('phosphorus')}</Label>
                                <Input type="number" name="phosphorus" placeholder="50" value={formData.phosphorus} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('potassium')}</Label>
                                <Input type="number" name="potassium" placeholder="50" value={formData.potassium} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('soil_type') || 'Soil Type'} <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <select
                                name="soil_type"
                                value={formData.soil_type}
                                onChange={handleChange}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="">{t('select') || 'Select'}...</option>
                                {["Sandy", "Loamy", "Black", "Red", "Clayey"].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Droplets className="mr-2 h-4 w-4" />}
                            {loading ? t('analyzing') : t('get_advice')}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-6 flex items-center justify-center rounded-md bg-destructive/10 p-4 text-destructive font-medium">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-4 rounded-lg border bg-blue-50/50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Sprout className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-blue-600">{t('status_assessment')}</h4>
                                    <p className="text-lg font-bold text-foreground">{result.analysis.status_label || result.analysis.status}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border p-6 bg-muted/20">
                                <div
                                    className="prose prose-sm max-w-none text-foreground"
                                    dangerouslySetInnerHTML={{ __html: result.recommendation }}
                                />
                            </div>

                            {result.doses && (
                                <div className="rounded-lg border p-5 bg-green-50/50 space-y-2 text-sm">
                                    <p className="font-bold text-green-700 uppercase text-xs">{t('exact_dose')}</p>
                                    <div className="flex justify-between"><span>{t('ideal_npk')} ({formData.crop})</span><b>{result.doses.ideal_npk}</b></div>
                                    <div className="flex justify-between"><span>{t('your_npk')}</span><b>{result.doses.your_npk}</b></div>
                                    {result.doses.urea_kg_ha > 0 && <div className="flex justify-between"><span>Urea (46% N)</span><b>{result.doses.urea_kg_ha} kg/ha</b></div>}
                                    {result.doses.dap_kg_ha > 0 && <div className="flex justify-between"><span>DAP (46% P)</span><b>{result.doses.dap_kg_ha} kg/ha</b></div>}
                                    {result.doses.mop_kg_ha > 0 && <div className="flex justify-between"><span>MOP (60% K)</span><b>{result.doses.mop_kg_ha} kg/ha</b></div>}
                                    {result.doses.urea_kg_ha === 0 && result.doses.dap_kg_ha === 0 && result.doses.mop_kg_ha === 0 && (
                                        <p className="text-green-700 font-medium">{t('no_fert_needed')}</p>
                                    )}
                                </div>
                            )}

                            {result.suggested_product && (
                                <div className="rounded-lg border p-4 bg-amber-50/50 text-sm">
                                    <p className="font-bold text-amber-700 uppercase text-xs mb-1">{t('suggested_product') || 'Suggested Product'}</p>
                                    <p className="font-semibold text-foreground">{result.suggested_product}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Fertilizer;
