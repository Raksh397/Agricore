import React, { useState } from 'react';
import { SprayCan, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// Dose rates (ml or g per litre of water) for common pesticide types
const PRODUCTS = [
    { id: 'neem', name: 'Neem Oil (organic)', rate: 5, unit: 'ml' },
    { id: 'copper', name: 'Copper Oxychloride (fungicide)', rate: 3, unit: 'g' },
    { id: 'mancozeb', name: 'Mancozeb 75% WP (fungicide)', rate: 2.5, unit: 'g' },
    { id: 'imidacloprid', name: 'Imidacloprid 17.8% SL (insecticide)', rate: 0.5, unit: 'ml' },
    { id: 'chlorpyrifos', name: 'Chlorpyrifos 20% EC (insecticide)', rate: 2, unit: 'ml' },
    { id: 'carbendazim', name: 'Carbendazim 50% WP (fungicide)', rate: 1, unit: 'g' },
    { id: 'bordeaux', name: 'Bordeaux Mixture 1%', rate: 10, unit: 'g' },
];

// Typical spray volume: ~500 L water per hectare for field crops
const WATER_L_PER_HA = 500;

const PesticideCalc = () => {
    const { t } = useTranslation();
    const [product, setProduct] = useState(PRODUCTS[0].id);
    const [area, setArea] = useState('1');
    const [tank, setTank] = useState('15');

    const p = PRODUCTS.find(x => x.id === product);
    const areaNum = parseFloat(area) || 0;
    const tankNum = parseFloat(tank) || 0;
    const totalWater = areaNum * WATER_L_PER_HA;
    const totalProduct = totalWater * p.rate;
    const perTank = tankNum * p.rate;
    const tanks = tankNum > 0 ? Math.ceil(totalWater / tankNum) : 0;

    const fmt = (v) => v >= 1000 ? `${(v / 1000).toFixed(2)} ${p.unit === 'ml' ? 'L' : 'kg'}` : `${v.toFixed(1)} ${p.unit}`;

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2"><SprayCan className="h-8 w-8 text-primary" /> {t('pest_calc')}</h1>
                <p className="text-muted-foreground mt-1">{t('pest_calc_desc')}</p>
            </div>

            <Card className="border-none">
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label>{t('product')}</Label>
                        <select value={product} onChange={e => setProduct(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                            {PRODUCTS.map(x => <option key={x.id} value={x.id}>{x.name} — {x.rate} {x.unit}/L</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('area_ha')}</Label>
                            <Input type="number" step="0.1" value={area} onChange={e => setArea(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('tank_size')}</Label>
                            <Input type="number" value={tank} onChange={e => setTank(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none bg-green-50/50">
                <CardHeader><CardTitle className="text-lg">{t('results')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between"><span>{t('water_needed')}</span><b>{totalWater.toFixed(0)} L</b></div>
                    <div className="flex justify-between"><span>{t('product_needed')}</span><b>{fmt(totalProduct)}</b></div>
                    <div className="flex justify-between"><span>{t('per_tank')} ({tank} L)</span><b>{perTank.toFixed(1)} {p.unit}</b></div>
                    <div className="flex justify-between"><span>{t('num_tanks')}</span><b>{tanks}</b></div>
                    <p className="text-xs text-muted-foreground pt-2">{t('pest_disclaimer')}</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default PesticideCalc;
