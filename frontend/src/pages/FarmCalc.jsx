import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// Approximate per-hectare economics for common crops (India, indicative)
const CROPS = [
    { id: 'rice', name: 'Rice', seedKg: 30, seedCost: 1500, fertCost: 8000, yieldQt: 45, priceQt: 2300 },
    { id: 'wheat', name: 'Wheat', seedKg: 100, seedCost: 3500, fertCost: 6500, yieldQt: 40, priceQt: 2275 },
    { id: 'maize', name: 'Maize', seedKg: 20, seedCost: 2500, fertCost: 7000, yieldQt: 50, priceQt: 2090 },
    { id: 'cotton', name: 'Cotton', seedKg: 2.5, seedCost: 3000, fertCost: 9000, yieldQt: 18, priceQt: 6620 },
    { id: 'potato', name: 'Potato', seedKg: 2500, seedCost: 35000, fertCost: 12000, yieldQt: 250, priceQt: 1200 },
    { id: 'tomato', name: 'Tomato', seedKg: 0.4, seedCost: 4000, fertCost: 10000, yieldQt: 350, priceQt: 1000 },
    { id: 'onion', name: 'Onion', seedKg: 8, seedCost: 6000, fertCost: 9000, yieldQt: 250, priceQt: 1500 },
    { id: 'sugarcane', name: 'Sugarcane', seedKg: 6000, seedCost: 25000, fertCost: 15000, yieldQt: 800, priceQt: 315 },
];

const FarmCalc = () => {
    const { t } = useTranslation();
    const [crop, setCrop] = useState(CROPS[0].id);
    const [area, setArea] = useState('1');
    const [labour, setLabour] = useState('15000');
    const [other, setOther] = useState('5000');

    const c = CROPS.find(x => x.id === crop);
    const a = parseFloat(area) || 0;
    const costs = (c.seedCost + c.fertCost) * a + (parseFloat(labour) || 0) + (parseFloat(other) || 0);
    const revenue = c.yieldQt * c.priceQt * a;
    const profit = revenue - costs;

    const inr = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2"><Calculator className="h-8 w-8 text-primary" /> {t('farm_calc')}</h1>
                <p className="text-muted-foreground mt-1">{t('farm_calc_desc')}</p>
            </div>

            <Card className="border-none">
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label>{t('select_crop')}</Label>
                        <select value={crop} onChange={e => setCrop(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                            {CROPS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <Label>{t('area_ha')}</Label>
                            <Input type="number" step="0.1" value={area} onChange={e => setArea(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('labour_cost')}</Label>
                            <Input type="number" value={labour} onChange={e => setLabour(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('other_cost')}</Label>
                            <Input type="number" value={other} onChange={e => setOther(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none bg-green-50/50">
                <CardHeader><CardTitle className="text-lg">{t('estimate')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between"><span>{t('seed_needed')}</span><b>{(c.seedKg * a).toLocaleString()} kg</b></div>
                    <div className="flex justify-between"><span>{t('seed_fert_cost')}</span><b>{inr((c.seedCost + c.fertCost) * a)}</b></div>
                    <div className="flex justify-between"><span>{t('total_cost')}</span><b>{inr(costs)}</b></div>
                    <div className="flex justify-between"><span>{t('expected_yield')}</span><b>{(c.yieldQt * a).toLocaleString()} {t('quintal')}</b></div>
                    <div className="flex justify-between"><span>{t('expected_revenue')}</span><b>{inr(revenue)}</b></div>
                    <div className={`flex justify-between text-lg font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        <span>{t('net_profit')}</span><span>{inr(profit)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">{t('farm_disclaimer')}</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default FarmCalc;
