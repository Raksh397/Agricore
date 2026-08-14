import React, { useState } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { docLabel, docText } from '../utils/docI18n';

// Auto-generates a filled application document for a scheme/loan and prints it.
const ApplyModal = ({ item, onClose }) => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [f, setF] = useState({ name: '', father: '', aadhaar: '', mobile: '', village: '', district: '', state: '', land: '', bank: '', account: '', ifsc: '' });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

    // L = bilingual table label, P = single-language prose.
    const L = (key) => docLabel(key, lang);
    const P = (key) => docText(key, lang);

    const print = () => {
        const w = window.open('', '_blank');
        w.document.write(`<html><head><meta charset="utf-8"/><title>${item.title} - ${P('application_form')}</title>
<style>body{font-family:Georgia,'Nirmala UI','Noto Sans',serif;max-width:700px;margin:40px auto;line-height:1.7}h1{text-align:center;font-size:20px}h2{font-size:15px;border-bottom:1px solid #999;padding-bottom:4px}td{padding:6px 10px;border:1px solid #999}table{border-collapse:collapse;width:100%}.sig{margin-top:60px;display:flex;justify-content:space-between}</style></head><body>
<h1>${P('application_form')}<br/>${item.title}</h1>
<p style="text-align:center">${item.provider || item.level || ''}</p>
<h2>1. ${L('applicant_details')}</h2>
<table>
<tr><td>${L('full_name')}</td><td>${f.name}</td></tr>
<tr><td>${L('father_name')}</td><td>${f.father}</td></tr>
<tr><td>${L('aadhaar_no')}</td><td>${f.aadhaar}</td></tr>
<tr><td>${L('mobile_no')}</td><td>${f.mobile}</td></tr>
<tr><td>${L('village')}</td><td>${f.village}</td></tr>
<tr><td>${L('district')}</td><td>${f.district}</td></tr>
<tr><td>${L('state')}</td><td>${f.state}</td></tr>
<tr><td>${L('land_holding')}</td><td>${f.land}</td></tr>
</table>
<h2>2. ${L('bank_details')}</h2>
<table>
<tr><td>${L('bank_branch')}</td><td>${f.bank}</td></tr>
<tr><td>${L('account_no')}</td><td>${f.account}</td></tr>
<tr><td>${L('ifsc_code')}</td><td>${f.ifsc}</td></tr>
</table>
<h2>3. ${L('applied_for')}</h2>
<table>
<tr><td>${L('name_label')}</td><td>${item.title}</td></tr>
<tr><td>${L('benefit_label')}</td><td>${item.benefit || ''}</td></tr>
${item.interest ? `<tr><td>${L('interest_label')}</td><td>${item.interest}</td></tr>` : ''}
${item.amount ? `<tr><td>${L('amount_label')}</td><td>${item.amount}</td></tr>` : ''}
</table>
<h2>4. ${L('declaration')}</h2>
<p>${P('declare_text')} <b>${item.title}</b>.</p>
<p><b>${P('attach_docs')}</b> ${P('docs_list')}${item.interest ? ', ' + P('income_cert') : ''}.</p>
<div class="sig"><span>${P('date_label')}: ____________</span><span>${P('signature')}</span></div>
<script>window.print()</script></body></html>`);
        w.document.close();
    };

    const fields = [
        ['name', t('f_name')], ['father', t('f_father')], ['aadhaar', t('f_aadhaar')], ['mobile', t('f_mobile')],
        ['village', t('f_village')], ['district', t('f_district')], ['state', t('f_state')], ['land', t('f_land')],
        ['bank', t('f_bank')], ['account', t('f_account')], ['ifsc', 'IFSC'],
    ];

    return (
        <div className="fixed inset-0 z-[90] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> {t('gen_doc')}</h2>
                    <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{item.title}</p>
                <div className="grid grid-cols-2 gap-3">
                    {fields.map(([k, label]) => (
                        <div key={k} className="space-y-1">
                            <Label className="text-xs">{label}</Label>
                            <Input value={f[k]} onChange={set(k)} className="h-9" />
                        </div>
                    ))}
                </div>
                <Button className="w-full mt-5 gap-2" onClick={print} disabled={!f.name}>
                    <Printer className="h-4 w-4" /> {t('print_doc')}
                </Button>
            </div>
        </div>
    );
};

export default ApplyModal;
