import React, { useState, useEffect } from 'react';
import { Stethoscope, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchSymptomOptions, diagnoseSymptoms } from '../api';
import { translateCrop, translateDisease } from '../utils/agriI18n';
import { useTranslated } from '../utils/translateText';
import { Button } from '../components/ui/button';

const RecoText = ({ html }) => {
    const { i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const translated = useTranslated((html || '').replace(/<[^>]*>/g, ' '));
    if (!html) return null;
    if (lang === 'en') return <div className="prose prose-sm text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />;
    return <p className="text-sm text-gray-700 whitespace-pre-line">{translated}</p>;
};

// Emoji give a non-literate farmer something to recognise at a glance.
const ICON = {
    leaf: '🍃', stem: '🌾', fruit: '🍅', root: '🫚', whole: '🌱',
    spots: '🔴', powder: '⚪', rust: '🟠', wilt: '🥀', curl: '🌀',
    holes: '🕳️', rot: '🟤', mosaic: '🧩', growth: '🍄',
    brown: '🟫', yellow: '🟨', white: '⬜', black: '⬛',
    orange: '🟧', purple: '🟪', green: '🟩',
    spindle: '👁️', stripe: '📏', concentric: '🎯', patch: '🩹', tiny: '⋯',
};

const SymptomDiagnosis = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [opts, setOpts] = useState(null);
    const [optsError, setOptsError] = useState(null);
    const [ans, setAns] = useState({ crop: '', part: '', sign: '', colour: '', pattern: '' });
    const [res, setRes] = useState(null);
    const [askPattern, setAskPattern] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(null);

    useEffect(() => {
        fetchSymptomOptions()
            .then(r => setOpts(r.data))
            .catch(err => {
                console.error(err);
                // Without options there is no question UI to show, so say so
                // rather than sitting on a loading message forever.
                setOptsError(t('load_failed'));
            });
    }, [t]);

    const run = async (override = {}) => {
        const payload = { ...ans, ...override };
        if (!payload.sign && !payload.colour && !payload.part) return;
        setLoading(true);
        try {
            const r = await diagnoseSymptoms(payload);
            setRes(r.data.results);
            setAskPattern(r.data.ask_pattern);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const pick = (field, value) => {
        const next = { ...ans, [field]: ans[field] === value ? '' : value };
        // Changing a core answer invalidates the previous lesion-shape reply
        if (field !== 'pattern') next.pattern = '';
        setAns(next);
        if (next.sign || next.colour || next.part) run(next);
        else { setRes(null); setAskPattern(false); }
    };

    const reset = () => {
        setAns({ crop: '', part: '', sign: '', colour: '', pattern: '' });
        setRes(null); setAskPattern(false); setOpen(null);
    };

    if (optsError) return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <AlertCircle className="inline h-4 w-4 mr-2" />
            {optsError}
        </div>
    );

    if (!opts) return <p className="text-sm text-muted-foreground">{t('fd_loading')}</p>;

    const Row = ({ label, field, values, translate }) => (
        <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <div className="flex flex-wrap gap-2">
                {values.map(v => (
                    <button key={v} onClick={() => pick(field, v)}
                        className={`px-3 py-2 rounded-xl text-sm border-2 transition-colors ${ans[field] === v
                            ? 'border-primary bg-primary/10 font-semibold'
                            : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <span className="mr-1">{ICON[v] || ''}</span>
                        {translate ? translate(v) : t(`sx_${v}`)}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm">
                <Stethoscope className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{t('sx_intro')}</p>
            </div>

            <Row label={t('sx_q_crop')} field="crop" values={opts.crops}
                translate={v => translateCrop(v, lang)} />
            <Row label={t('sx_q_part')} field="part" values={opts.parts} />
            <Row label={t('sx_q_sign')} field="sign" values={opts.signs} />
            <Row label={t('sx_q_colour')} field="colour" values={opts.colours} />

            {askPattern && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-start gap-2 text-amber-900 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p>{t('sx_need_pattern')}</p>
                    </div>
                    <Row label={t('sx_q_pattern')} field="pattern" values={opts.patterns} />
                </div>
            )}

            {loading && <p className="text-sm text-muted-foreground">{t('fd_loading')}</p>}

            {res && res.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">{t('sx_results')}</p>
                        <button onClick={reset} className="text-xs flex items-center gap-1 text-primary font-semibold">
                            <RefreshCw className="h-3 w-3" /> {t('sx_reset')}
                        </button>
                    </div>
                    {res.map((r, i) => (
                        <div key={i} className="bg-white rounded-xl border overflow-hidden">
                            <button onClick={() => setOpen(open === i ? null : i)}
                                className="w-full text-left p-4 flex items-center justify-between gap-2 hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{translateDisease(r.disease, lang)}</p>
                                    <p className="text-sm text-muted-foreground">{translateCrop(r.crop, lang)}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-sm font-bold ${r.match >= 80 ? 'text-green-600' : r.match >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>
                                        {r.match}%
                                    </span>
                                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${open === i ? 'rotate-90' : ''}`} />
                                </div>
                            </button>
                            {open === i && (
                                <div className="px-4 pb-4 border-t pt-3">
                                    <RecoText html={r.recommendation} />
                                </div>
                            )}
                        </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-1">{t('sx_disclaimer')}</p>
                </div>
            )}

            {res && res.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('sx_no_match')}</p>
            )}
        </div>
    );
};

export default SymptomDiagnosis;
