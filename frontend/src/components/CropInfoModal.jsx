import React from 'react';
import { X, Thermometer, CloudRain, Mountain, FlaskConical, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CROP_INFO } from '../utils/cropCatalog';
import { translateCrop } from '../utils/agriI18n';
import { TText } from '../utils/translateText';

const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
        <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="text-sm text-gray-800"><TText text={value} /></p>
        </div>
    </div>
);

const CropInfoModal = ({ crop, onClose }) => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const info = CROP_INFO[crop.id];

    return (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto space-y-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="h-14 w-14 rounded-full flex items-center justify-center text-3xl" style={{ background: crop.bg }}>{crop.emoji}</span>
                        <h2 className="text-2xl font-bold">{translateCrop(crop.name, lang)}</h2>
                    </div>
                    <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
                </div>

                {info ? (
                    <>
                        <Row icon={Thermometer} label={t('ideal_temp')} value={info.temp} />
                        <Row icon={CloudRain} label={t('rainfall_req')} value={info.rain} />
                        <Row icon={Mountain} label={t('soil_req')} value={info.soil} />
                        <Row icon={FlaskConical} label={t('ph_req')} value={info.ph} />
                        <Row icon={CalendarDays} label={t('season_label')} value={info.season} />
                        <div className="bg-green-50 rounded-xl p-4">
                            <p className="text-xs font-semibold uppercase text-green-700 mb-1">{t('how_grow')}</p>
                            <p className="text-sm text-gray-800 leading-relaxed"><TText text={info.how} /></p>
                        </div>
                    </>
                ) : <p className="text-muted-foreground">{t('no_market_data')}</p>}
            </div>
        </div>
    );
};

export default CropInfoModal;
