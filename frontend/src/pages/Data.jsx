import React, { useState, useEffect } from 'react';
import { TrendingUp, FlaskConical, CloudRain, Store, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../api';
import { translateCrop } from '../utils/agriI18n';

const Data = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [tab, setTab] = useState('yield');
    const [yieldRows, setYieldRows] = useState([]);
    const [soil, setSoil] = useState([]);
    const [rain, setRain] = useState([]);
    const [market, setMarket] = useState([]);
    const [loading, setLoading] = useState(false);

    const TABS = [
        { key: 'yield', label: t('fd_yield'), icon: TrendingUp },
        { key: 'soil', label: t('fd_soil'), icon: FlaskConical },
        { key: 'rainfall', label: t('fd_rain'), icon: CloudRain },
        { key: 'market', label: t('fd_market'), icon: Store },
    ];

    useEffect(() => {
        const fetchers = {
            yield: () => yieldRows.length || API.get('/dataset/crop-yield').then(r => setYieldRows(r.data.items.slice(0, 150))),
            soil: () => soil.length || API.get('/dataset/soil-lab').then(r => setSoil(r.data.items.slice(0, 150))),
            rainfall: () => rain.length || API.get('/dataset/rainfall').then(r => setRain(r.data.items.slice(0, 150))),
            market: () => market.length || API.get('/dataset/market-prices?limit=150').then(r => setMarket(r.data.items)),
        };
        if (fetchers[tab]) {
            setLoading(true);
            Promise.resolve(fetchers[tab]()).finally(() => setLoading(false));
        }
    }, [tab]);

    const rowsFor = { yield: yieldRows, soil, rainfall: rain, market }[tab] || [];

    // column key -> translated header; crop values also get localised
    const Table = ({ rows, cols }) => (
        <div className="overflow-x-auto bg-white rounded-xl border">
            <table className="w-full text-xs">
                <thead className="bg-gray-50 text-left">
                    <tr>{cols.map(c => (
                        <th key={c.k} className="px-3 py-2 font-semibold whitespace-nowrap">{c.label}</th>
                    ))}</tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className="border-t">
                            {cols.map(c => (
                                <td key={c.k} className="px-3 py-2 whitespace-nowrap">
                                    {c.k === 'crop' ? translateCrop(String(r[c.k] ?? ''), lang) : String(r[c.k] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-4 pb-24">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" /> {t('farm_data')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('fd_desc')}</p>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${tab === key ? 'bg-primary text-white' : 'bg-white border border-gray-300'}`}>
                        <Icon className="h-4 w-4" /> {label}
                    </button>
                ))}
            </div>

            {loading && <p className="text-sm text-muted-foreground">{t('fd_loading')}</p>}
            {!loading && rowsFor.length > 0 && (
                <p className="text-xs text-muted-foreground">{rowsFor.length} {t('fd_records')}</p>
            )}

            {tab === 'yield' && yieldRows.length > 0 && (
                <Table rows={yieldRows} cols={[
                    { k: 'state', label: t('fd_state') },
                    { k: 'crop', label: t('fd_crop') },
                    { k: 'crop_year', label: t('fd_year') },
                    { k: 'yield_t_per_ha', label: t('fd_yield_col') },
                    { k: 'season', label: t('fd_season') },
                ]} />
            )}
            {tab === 'soil' && soil.length > 0 && (
                <Table rows={soil} cols={[
                    { k: 'ph', label: 'pH' }, { k: 'ec', label: 'EC' }, { k: 'oc', label: 'OC' },
                    { k: 'n', label: 'N' }, { k: 'p', label: 'P' }, { k: 'k', label: 'K' },
                    { k: 'zn', label: 'Zn' }, { k: 'fe', label: 'Fe' }, { k: 'cu', label: 'Cu' },
                    { k: 'mn', label: 'Mn' }, { k: 'output', label: t('fd_result') },
                ]} />
            )}
            {tab === 'rainfall' && rain.length > 0 && (
                <Table rows={rain} cols={[
                    { k: 'subdivision', label: t('fd_subdiv') },
                    { k: 'year', label: t('fd_year') },
                    { k: 'jun', label: 'Jun' }, { k: 'jul', label: 'Jul' },
                    { k: 'aug', label: 'Aug' }, { k: 'sep', label: 'Sep' },
                    { k: 'annual', label: t('fd_annual') },
                ]} />
            )}
            {tab === 'market' && market.length > 0 && (
                <Table rows={market} cols={[
                    { k: 'state', label: t('fd_state') },
                    { k: 'district', label: t('fd_district') },
                    { k: 'market', label: t('fd_market_col') },
                    { k: 'variety', label: t('fd_variety') },
                    { k: 'min_price', label: t('fd_min') },
                    { k: 'max_price', label: t('fd_max') },
                    { k: 'modal_price_rs_per_quintal', label: t('fd_modal') },
                    { k: 'year', label: t('fd_year') },
                ]} />
            )}
        </div>
    );
};

export default Data;
