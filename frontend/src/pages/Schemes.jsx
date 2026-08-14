
import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import { tScheme, tCategory, tLevel, tTitle } from '../utils/schemesI18n';
import { TText } from '../utils/translateText';
import API from '../api';
import ApplyModal from '../components/ApplyModal';
import { useEffect } from 'react';

// Schemes Data provided by user
const SCHEMES_DATA = [
    {
        "id": "pm_kisan",
        "title": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "level": "National",
        "category": "Income Support",
        "benefit": "₹6,000 per year in three installments",
        "eligibility": "All landholding farmer families",
        "officialLink": "https://pmkisan.gov.in"
    },
    {
        "id": "pmfby",
        "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "level": "National",
        "category": "Crop Insurance",
        "benefit": "Insurance coverage at low farmer premium",
        "eligibility": "Farmers growing notified crops",
        "officialLink": "https://pmfby.gov.in"
    },
    {
        "id": "kcc",
        "title": "Kisan Credit Card (KCC)",
        "level": "National",
        "category": "Agricultural Credit",
        "benefit": "Short-term crop loans at subsidized interest rates",
        "eligibility": "Farmers, livestock and fisheries farmers",
        "officialLink": "https://www.myscheme.gov.in"
    },
    {
        "id": "pmksy",
        "title": "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
        "level": "National",
        "category": "Irrigation",
        "benefit": "Subsidy for micro irrigation (drip & sprinkler)",
        "eligibility": "Farmers adopting water-saving irrigation methods",
        "officialLink": "https://pmksy.gov.in"
    },
    {
        "id": "enam",
        "title": "e-NAM (National Agriculture Market)",
        "level": "National",
        "category": "Market Access",
        "benefit": "Online agricultural commodity trading platform",
        "eligibility": "Registered farmers & traders",
        "officialLink": "https://www.enam.gov.in"
    },
    {
        "id": "soil_health_card",
        "title": "Soil Health Card Scheme",
        "level": "National",
        "category": "Soil Management",
        "benefit": "Free soil testing & nutrient recommendations",
        "eligibility": "All farmers",
        "officialLink": "https://soilhealth.dac.gov.in"
    },
    {
        "id": "pm_kusum",
        "title": "Pradhan Mantri KUSUM Scheme",
        "level": "National",
        "category": "Solar Subsidy",
        "benefit": "Subsidy for solar pumps & grid-connected solar plants",
        "eligibility": "Individual farmers & cooperatives",
        "officialLink": "https://mnre.gov.in"
    },
    {
        "id": "pkvy",
        "title": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "level": "National",
        "category": "Organic Farming",
        "benefit": "Financial support for organic farming clusters",
        "eligibility": "Groups of farmers adopting organic farming",
        "officialLink": "https://pgsindia-ncof.gov.in"
    },
    {
        "id": "national_horticulture_mission",
        "title": "Mission for Integrated Development of Horticulture (MIDH)",
        "level": "National",
        "category": "Horticulture",
        "benefit": "Subsidy for plantation, greenhouse, storage, nursery",
        "eligibility": "Horticulture farmers",
        "officialLink": "https://midh.gov.in"
    },
    {
        "id": "agri_infra_fund",
        "title": "Agriculture Infrastructure Fund (AIF)",
        "level": "National",
        "category": "Infrastructure",
        "benefit": "Interest subvention for agri infrastructure projects",
        "eligibility": "Farmers, FPOs, agri entrepreneurs",
        "officialLink": "https://agriinfra.dac.gov.in"
    },
    {
        "id": "fpo_scheme",
        "title": "Formation & Promotion of Farmer Producer Organizations (FPO)",
        "level": "National",
        "category": "Collective Farming",
        "benefit": "Financial & technical support for FPO formation",
        "eligibility": "Groups of farmers",
        "officialLink": "https://sfacindia.com"
    },
    {
        "id": "livestock_mission",
        "title": "National Livestock Mission (NLM)",
        "level": "National",
        "category": "Livestock",
        "benefit": "Subsidy for poultry, sheep, goat, fodder development",
        "eligibility": "Livestock farmers & entrepreneurs",
        "officialLink": "https://nlm.udyamimitra.in"
    },
    {
        "id": "dairy_entrepreneurship",
        "title": "Dairy Entrepreneurship Development Scheme",
        "level": "National",
        "category": "Dairy",
        "benefit": "Subsidy for setting up dairy units",
        "eligibility": "Dairy farmers & self-help groups",
        "officialLink": "https://nabard.org"
    },
    {
        "id": "blue_revolution",
        "title": "Pradhan Mantri Matsya Sampada Yojana (PMMSY)",
        "level": "National",
        "category": "Fisheries",
        "benefit": "Financial support for fisheries development",
        "eligibility": "Fish farmers & entrepreneurs",
        "officialLink": "https://pmmsy.dof.gov.in"
    }
];

const Schemes = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [searchTerm, setSearchTerm] = useState('');
    const [tab, setTab] = useState('schemes');
    const [loans, setLoans] = useState([]);
    const [applyItem, setApplyItem] = useState(null);

    useEffect(() => {
        API.get('/loans').then(r => setLoans(r.data.loans)).catch(() => { });
    }, []);

    const filteredLoans = loans.filter(l => (l.title + l.benefit).toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredSchemes = SCHEMES_DATA.filter(scheme =>
        scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Also match what is actually on screen, so typing in the selected
        // language finds the scheme instead of returning nothing.
        tTitle(scheme, lang).includes(searchTerm) ||
        tCategory(scheme.category, lang).includes(searchTerm)
    );

    return (
        <div className="flex flex-col min-h-full pb-20"> {/* pb-20 for bottom nav clearance */}
            <div className="p-4 md:p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                        {t('schemes_title')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('schemes_desc')}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('schemes_search')}
                        className="pl-10 bg-white/50 backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button onClick={() => setTab('schemes')} className={`px-4 py-2 rounded-full text-sm font-medium ${tab === 'schemes' ? 'bg-primary text-white' : 'bg-white border border-gray-300'}`}>{t('schemes_tab')}</button>
                    <button onClick={() => setTab('loans')} className={`px-4 py-2 rounded-full text-sm font-medium ${tab === 'loans' ? 'bg-primary text-white' : 'bg-white border border-gray-300'}`}>{t('loans_tab')}</button>
                </div>

                {tab === 'loans' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLoans.map(l => (
                            <div key={l.id} className="glass-card rounded-xl p-5 border border-green-50/50 group hover:shadow-glow-green transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">💰 {t('loans_tab')}</span>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded"><TText text={l.provider} /></span>
                                </div>
                                <h3 className="text-lg font-semibold mb-3 leading-tight group-hover:text-primary"><TText text={l.title} /></h3>
                                <div className="space-y-2 mb-4 text-sm">
                                    <p><b>{t('interest_label')}:</b> <TText text={l.interest} /></p>
                                    <p><b>{t('amount_label')}:</b> <TText text={l.amount} /></p>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mt-2">{t('benefit_label')}</p>
                                    <p><TText text={l.benefit} /></p>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mt-2">{t('eligibility_label')}</p>
                                    <p className="text-foreground/80"><TText text={l.eligibility} /></p>
                                </div>
                                <div className="space-y-2">
                                    <Button className="w-full gap-2" onClick={() => setApplyItem(l)}>
                                        📄 {t('gen_doc')}
                                    </Button>
                                    <Button className="w-full gap-2" variant="outline" onClick={() => window.open(l.link, '_blank')}>
                                        {t('visit_site')} <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Schemes Grid */}
                {tab === 'schemes' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchemes.map((scheme) => (
                        <div key={scheme.id} className="glass-card rounded-xl p-5 hover:shadow-glow-green transition-all duration-300 border border-green-50/50 group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    {tCategory(scheme.category, lang)}
                                </span>
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                    {tLevel(scheme.level, lang)}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                                {tTitle(scheme, lang)}
                            </h3>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('benefit_label')}</p>
                                    <p className="text-sm font-medium text-foreground/90">{tScheme(scheme, 'benefit', lang)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('eligibility_label')}</p>
                                    <p className="text-sm text-foreground/80">{tScheme(scheme, 'eligibility', lang)}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Button className="w-full gap-2" onClick={() => setApplyItem({ ...scheme, title: tTitle(scheme, lang), benefit: tScheme(scheme, 'benefit', lang) })}>
                                    📄 {t('gen_doc')}
                                </Button>
                                <Button
                                    className="w-full gap-2"
                                    variant="outline"
                                    onClick={() => window.open(scheme.officialLink, '_blank')}
                                >
                                    {t('visit_site')}
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filteredSchemes.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            {t('no_schemes')} "{searchTerm}"
                        </div>
                    )}
                </div>}
            </div>
            {applyItem && <ApplyModal item={applyItem} onClose={() => setApplyItem(null)} />}
        </div>
    );
};

export default Schemes;
