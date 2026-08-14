import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, MessagesSquare, Store, UserCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
    const { t } = useTranslation();
    const navItems = [
        { path: '/', icon: Sprout, label: t('your_crops') },
        { path: '/community', icon: MessagesSquare, label: t('community') },
        { path: '/market', icon: Store, label: t('market_tab') },
        { path: '/you', icon: UserCircle2, label: t('you_tab') },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-gray-50 pb-[env(safe-area-inset-bottom)] box-content">
            {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-foreground'}`}
                >
                    {({ isActive }) => (
                        <>
                            <span className={`px-5 py-1 rounded-full ${isActive ? 'bg-indigo-200/70' : ''}`}>
                                <Icon className="h-6 w-6" strokeWidth={1.7} />
                            </span>
                            <span className="text-xs">{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
