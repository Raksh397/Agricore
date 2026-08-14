import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, FileText, Droplets, Sprout, ScanLine, Globe, ChevronRight, User, Bot, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUser, SignedIn, UserButton } from '@clerk/clerk-react';

const You = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useUser();

    const links = [
        { label: t('chatbot'), icon: Bot, path: '/chatbot' },
        { label: t('reminders'), icon: Bell, path: '/reminders' },
        { label: t('docgen_title'), icon: FileText, path: '/docgen' },
        { label: t('nav_disease'), icon: ScanLine, path: '/disease' },
        { label: t('nav_crop'), icon: Sprout, path: '/crop' },
        { label: t('nav_fertilizer'), icon: Droplets, path: '/fertilizer' },
        { label: t('nav_schemes'), icon: FileText, path: '/schemes' },
        { label: t('nav_map'), icon: MapPin, path: '/map' },
    ];

    return (
        <div className="pb-24 space-y-6">
            <div className="flex items-center gap-4 bg-white rounded-3xl border border-gray-200 p-5">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <SignedIn><UserButton appearance={{ elements: { avatarBox: 'h-16 w-16' } }} /></SignedIn>
                    {!user && <User className="h-8 w-8" />}
                </div>
                <div>
                    <h1 className="text-xl font-bold">{user?.fullName || 'Farmer'}</h1>
                    <p className="text-gray-500 text-sm">{user?.primaryEmailAddress?.emailAddress || 'India'}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 divide-y">
                {links.map(l => (
                    <button key={l.path} onClick={() => navigate(l.path)} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 first:rounded-t-3xl last:rounded-b-3xl">
                        <span className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><l.icon className="h-5 w-5" /></span>
                        <span className="flex-1 text-left font-medium">{l.label}</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-4 flex items-center gap-4">
                <span className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Globe className="h-5 w-5" /></span>
                <select
                    value={i18n.language}
                    onChange={e => i18n.changeLanguage(e.target.value)}
                    className="flex-1 bg-transparent font-medium outline-none"
                >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="kn">ಕನ್ನಡ</option>
                    <option value="ta">தமிழ்</option>
                    <option value="te">తెలుగు</option>
                    <option value="ml">മലയാളം</option>
                </select>
            </div>
        </div>
    );
};

export default You;
