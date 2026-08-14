import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

const SignInPage = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-300/20 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-md space-y-8 flex flex-col items-center">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-emerald-950">
                        {t('signin_title')}
                    </h1>
                    <p className="text-emerald-600/80 text-lg">
                        {t('signin_sub')}
                    </p>
                </div>

                <div className="w-full flex justify-center transform transition-all hover:scale-[1.01] duration-300">
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "shadow-2xl rounded-2xl overflow-hidden",
                                card: "shadow-none border-none",
                                headerTitle: "text-emerald-950",
                                headerSubtitle: "text-emerald-600",
                                formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white !shadow-none",
                                footerActionLink: "text-emerald-600 hover:text-emerald-700"
                            }
                        }}
                        signUpUrl="/sign-up"
                    />
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
