import React, { useState, useEffect } from 'react';
import { FileText, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../api';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { TText } from '../utils/translateText';
import { docLabel, docText } from '../utils/docI18n';

// Auto-generates a filled application document for a scheme/loan, ready to print
const DocGen = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [loans, setLoans] = useState([]);
    const [target, setTarget] = useState('');
    const [form, setForm] = useState({ name: '', father: '', village: '', district: '', state: '', phone: '', aadhaar: '', land: '', bank: '', account: '', ifsc: '' });

    const SCHEMES = ['PM-KISAN', 'PMFBY Crop Insurance', 'Kisan Credit Card (KCC)', 'PM-KUSUM Solar', 'Soil Health Card', 'PMKSY Irrigation Subsidy'];

    useEffect(() => { API.get('/loans').then(r => setLoans(r.data.loans)).catch(() => { }); }, []);

    const options = [...SCHEMES, ...loans.map(l => l.title)].filter((v, i, a) => a.indexOf(v) === i);
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    // L = bilingual table label, P = single-language prose.
    const L = (key) => docLabel(key, lang);
    const P = (key) => docText(key, lang);

    const print = () => {
        const blank = '____________';
        const w = window.open('', '_blank');
        w.document.write(`<html><head><meta charset="utf-8"/><title>${P('application_form')} - ${target}</title>
        <style>body{font-family:Georgia,'Nirmala UI','Noto Sans',serif;max-width:700px;margin:40px auto;line-height:1.8}h1{text-align:center;font-size:20px;border-bottom:2px solid #000;padding-bottom:8px}h2{font-size:16px}td{padding:6px 10px;border:1px solid #444}table{border-collapse:collapse;width:100%}.sig{margin-top:60px;display:flex;justify-content:space-between}</style></head><body>
        <h1>${P('application_form')}<br/>${target}</h1>
        <p>${P('to_label')}<br/>${P('branch_manager')}<br/>____________________________</p>
        <p><b>${P('subject')}</b> ${P('subject_line')} ${target}</p>
        <p>${P('respected')}<br/>${P('body_i_am')} <b>${form.name || blank}</b>, ${P('body_sodo')} <b>${form.father || blank}</b>, ${P('body_resident')} <b>${form.village || blank}</b>, ${P('body_district')} <b>${form.district || blank}</b>, ${P('body_state')} <b>${form.state || blank}</b>, ${P('body_apply')}</p>
        <table>
        <tr><td><b>${L('applicant_name')}</b></td><td>${form.name}</td></tr>
        <tr><td><b>${L('father_name')}</b></td><td>${form.father}</td></tr>
        <tr><td><b>${L('vill_dist_state')}</b></td><td>${form.village}, ${form.district}, ${form.state}</td></tr>
        <tr><td><b>${L('mobile_no')}</b></td><td>${form.phone}</td></tr>
        <tr><td><b>${L('aadhaar_no')}</b></td><td>${form.aadhaar}</td></tr>
        <tr><td><b>${L('land_holding')}</b></td><td>${form.land}</td></tr>
        <tr><td><b>${L('bank_branch')}</b></td><td>${form.bank}</td></tr>
        <tr><td><b>${L('account_no')}</b></td><td>${form.account}</td></tr>
        <tr><td><b>${L('ifsc_code')}</b></td><td>${form.ifsc}</td></tr>
        </table>
        <p><b>${P('docs_attached')}</b> ☐ ${P('doc_aadhaar')} &nbsp; ☐ ${P('doc_land')} &nbsp; ☐ ${P('doc_passbook')} &nbsp; ☐ ${P('doc_photo')} &nbsp; ☐ ${P('doc_caste')}</p>
        <p>${P('declare_short')}</p>
        <div class="sig"><span>${P('date_label')}: ____________<br/>${P('place_label')}: ____________</span><span>${P('signature')}<br/><br/>____________</span></div>
        </body></html>`);
        w.document.close();
        w.print();
    };

    return (
        <div className="space-y-5 pb-24">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8 text-primary" /> {t('docgen_title')}</h1>
                <p className="text-muted-foreground mt-1">{t('docgen_desc')}</p>
            </div>

            <div className="space-y-2">
                <Label>{t('select_scheme')}</Label>
                <select value={target} onChange={e => setTarget(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm">
                    <option value="">--</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>

            {target && (
                <div className="bg-white rounded-2xl border p-5 space-y-3">
                    {[['name', t('f_name')], ['father', t('f_father')], ['village', t('f_village')], ['district', t('f_district')], ['state', t('f_state')], ['phone', t('f_phone')], ['aadhaar', t('f_aadhaar')], ['land', t('f_land')], ['bank', t('f_bank')], ['account', t('f_account')], ['ifsc', 'IFSC']].map(([k, label]) => (
                        <div key={k} className="space-y-1">
                            <Label className="text-xs">{label}</Label>
                            <Input value={form[k]} onChange={set(k)} />
                        </div>
                    ))}
                    <Button className="w-full h-12 gap-2" onClick={print} disabled={!form.name}>
                        <Printer className="h-5 w-5" /> {t('generate_print')}
                    </Button>
                    <p className="text-xs text-muted-foreground">{t('docgen_note')}</p>
                </div>
            )}
        </div>
    );
};

export default DocGen;
