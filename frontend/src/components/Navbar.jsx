import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="glass-panel" style={{
            margin: '20px',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '20px',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex'
                }}>
                    <Sprout color="white" size={24} />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Agri<span style={{ color: '#10b981' }}>core</span></span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/" className={isActive('/')}>{t('nav_home')}</Link>
                <Link to="/disease" className={isActive('/disease')}>{t('nav_disease')}</Link>
                <Link to="/crop" className={isActive('/crop')}>{t('nav_crop')}</Link>
                <Link to="/fertilizer" className={isActive('/fertilizer')}>{t('nav_fertilizer')}</Link>
            </div>
        </nav>
    );
};

export default Navbar;
