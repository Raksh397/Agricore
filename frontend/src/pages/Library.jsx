import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api';
import { CROP_CATALOG } from '../utils/cropCatalog';
import { translateCrop, translateDisease } from '../utils/agriI18n';
import CropInfoModal from '../components/CropInfoModal';
import { TText, useTranslated } from '../utils/translateText';
import { Input } from '../components/ui/input';

const DiseaseDesc = ({ html }) => {
    const translated = useTranslated(html.replace(/<[^>]*>/g, ' '));
    const { i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    if (lang === 'en') return <div className="prose prose-sm text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />;
    return <p className="text-sm text-gray-700 whitespace-pre-line">{translated}</p>;
};

const Library = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [params] = useSearchParams();
    const [tab, setTab] = useState(params.get('tab') || 'crops');
    const [diseases, setDiseases] = useState([]);
    const [guides, setGuides] = useState([]);
    const [npk, setNpk] = useState([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [infoCrop, setInfoCrop] = useState(null);

    useEffect(() => {
        API.get('/disease-library').then(r => setDiseases(r.data.items.filter(d => d.disease.toLowerCase() !== 'healthy'))).catch(console.error);
        API.get('/dataset/cultivation-guides').then(r => setGuides(r.data.items)).catch(console.error);
        API.get('/dataset/ideal-npk').then(r => setNpk(r.data.items)).catch(console.error);
    }, []);

    const q = search.toLowerCase();
    const crops = CROP_CATALOG.filter(c => c.name.toLowerCase().includes(q));
    const filteredDiseases = diseases.filter(d => (d.crop + d.disease).toLowerCase().includes(q));
    const filteredGuides = guides.filter(g => (g.crop || '').toLowerCase().includes(q));
    const filteredNpk = npk.filter(n => (n.crop || '').toLowerCase().includes(q));

    return (
        <div className="space-y-4 pb-24">
            <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="h-8 w-8 text-primary" /> {t('library')}</h1>

            <div className="flex gap-2">
                {['crops', 'diseases', 'tips', 'npk'].map(k => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${tab === k ? 'bg-primary text-white' : 'bg-white border border-gray-300'}`}>
                        {k === 'npk' ? (t('ideal_npk') || 'Ideal NPK') : t(k === 'crops' ? 'crops_lib' : k === 'diseases' ? 'pests_lib' : 'tips_lib')}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_community')} className="pl-10" />
            </div>

            {tab === 'crops' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {crops.map(c => (
                        <button key={c.id} onClick={() => setInfoCrop(c)} className="flex flex-col items-center gap-1.5 bg-white rounded-2xl border p-3 hover:border-primary">
                            <span className="h-16 w-16 rounded-full flex items-center justify-center text-3xl" style={{ background: c.bg }}>{c.emoji}</span>
                            <span className="text-xs text-center font-medium">{translateCrop(c.name, lang)}</span>
                        </button>
                    ))}
                </div>
            )}

            {tab === 'diseases' && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{filteredDiseases.length} diseases · from disease_treatments dataset</p>
                    {filteredDiseases.map((d, i) => (
                        <button key={i} onClick={() => setSelected(d)} className="w-full text-left bg-white rounded-xl border p-4 hover:border-primary">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold">{translateDisease(d.disease, lang)}</p>
                                    <p className="text-sm text-muted-foreground">{translateCrop(d.crop, lang)}</p>
                                </div>
                                {d.scannable && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">📷 Scannable</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {tab === 'tips' && (
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">{filteredGuides.length} crops · from cultivation_guides dataset</p>
                    {filteredGuides.map((g, i) => (
                        <div key={i} className="bg-white rounded-xl border p-4 space-y-2">
                            <p className="font-semibold">🌱 {translateCrop(g.crop, lang)}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                <span>🌡️ {g.temperature}</span>
                                <span>🌧️ {g.rainfall}</span>
                                <span>⚗️ pH {g.ph}</span>
                                <span>📅 {g.season}</span>
                            </div>
                            <p className="text-xs text-gray-600">🪱 {g.soil}</p>
                            <p className="text-sm text-gray-700"><TText text={g.how_to_grow} /></p>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'npk' && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{filteredNpk.length} crops · from fertilizer_ideal_npk dataset</p>
                    {filteredNpk.map((n, i) => (
                        <div key={i} className="bg-white rounded-xl border p-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{translateCrop(n.crop, lang)}</p>
                                <p className="text-xs text-muted-foreground">pH {n.ph} · moisture {n.soil_moisture}%</p>
                            </div>
                            <div className="flex gap-2 text-sm font-bold">
                                <span className="px-2 py-1 rounded bg-green-100 text-green-700">N {n.n}</span>
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">P {n.p}</span>
                                <span className="px-2 py-1 rounded bg-amber-100 text-amber-700">K {n.k}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {infoCrop && <CropInfoModal crop={infoCrop} onClose={() => setInfoCrop(null)} />}

            {selected && (
                <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
                    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h2 className="text-xl font-bold">{translateDisease(selected.disease, lang)}</h2>
                                <p className="text-muted-foreground">{translateCrop(selected.crop, lang)}</p>
                            </div>
                            <button onClick={() => setSelected(null)}><X className="h-6 w-6 text-gray-500" /></button>
                        </div>
                        <DiseaseDesc html={selected.description} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;
