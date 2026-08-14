import React, { useState } from 'react';
import { Sprout, Bell, Globe, Menu, X, Home, ScanLine, Droplets, Map, FileText, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserButton, SignedIn } from "@clerk/clerk-react";
import { Button } from './ui/button';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navItems = [
        { path: '/', label: t('nav_home'), icon: Home },
        { path: '/map', label: t('nav_map'), icon: Map },
        { path: '/market', label: t('nav_market'), icon: TrendingUp },
        { path: '/disease', label: t('nav_disease'), icon: ScanLine },
        { path: '/crop', label: t('nav_crop'), icon: Sprout },
        { path: '/fertilizer', label: t('nav_fertilizer'), icon: Droplets },
        { path: '/schemes', label: t('nav_schemes'), icon: FileText },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b glass pt-[env(safe-area-inset-top)]">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
                            <Menu className="h-6 w-6" />
                        </Button>

                        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-xl">
                            <img src="/logo.svg" alt="Agricore Logo" className="h-8 w-8 rounded-lg" />
                            <span className="text-foreground">Agri<span className="text-primary">core</span></span>
                        </Link>
                    </div>

                    {/* Desktop Navigation (Optional, if we want links visible on large screens too, but keeping sidebar focus for now) */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Language Selector */}
                        <div className="relative flex items-center bg-secondary/50 rounded-full px-3 py-1.5 border border-border/50 hidden sm:flex">
                            <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                            <select
                                onChange={changeLanguage}
                                value={i18n.language}
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-foreground appearance-none pr-4 outline-none"
                                style={{ backgroundImage: 'none' }}
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="kn">ಕನ್ನಡ</option>
                                <option value="ta">தமிழ்</option>
                                <option value="te">తెలుగు</option>
                                <option value="ml">മലയാളം</option>
                            </select>
                        </div>

                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors">
                            <Bell className="h-5 w-5" />
                        </Button>

                        <SignedIn>
                            <UserButton afterSignOutUrl="/sign-in" appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                                }
                            }} />
                        </SignedIn>
                    </div>
                </div>
            </header>

            {/* Sidebar / Navigation Drawer */}
            {/* Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
                    onClick={closeMenu}
                />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 left-0 z-[70] w-3/4 max-w-xs bg-background border-r shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <span className="font-bold text-lg flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Sprout className="h-4 w-4" />
                            </div>
                            {t('menu')}
                        </span>
                        <Button variant="ghost" size="icon" onClick={closeMenu}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="flex flex-col px-2 gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={closeMenu}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t bg-secondary/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <select
                                onChange={changeLanguage}
                                value={i18n.language}
                                className="bg-transparent border-none text-sm font-medium w-full outline-none"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="kn">ಕನ್ನಡ</option>
                                <option value="ta">தமிழ்</option>
                                <option value="te">తెలుగు</option>
                                <option value="ml">മലയാളം</option>
                            </select>
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                            Version 1.0.0
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
