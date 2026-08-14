import React from 'react';
import i18n from '../i18n';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                    {/* Class component, so it reads i18next directly instead of the hook. */}
                    <h1 className="text-2xl font-bold text-foreground mb-4">{i18n.t('err_title')}</h1>
                    <p className="text-muted-foreground mb-6">
                        {i18n.t('err_body')}
                    </p>
                    <Button onClick={this.handleReload} variant="default">
                        {i18n.t('err_reload')}
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
