import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import VoiceAssistant from './components/VoiceAssistant';
import Home from './pages/Home';
import Disease from './pages/Disease';
import Crop from './pages/Crop';
import Fertilizer from './pages/Fertilizer';
import KVKLocator from './pages/KVKLocator';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Schemes from './pages/Schemes';
import Market from './pages/Market';
import Community from './pages/Community';
import You from './pages/You';
import PesticideCalc from './pages/PesticideCalc';
import FarmCalc from './pages/FarmCalc';
import Library from './pages/Library';
import Data from './pages/Data';
import Weather from './pages/Weather';
import Chatbot from './pages/Chatbot';
import Reminders, { checkReminders } from './pages/Reminders';
import DocGen from './pages/DocGen';
import { Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Floating AgriBot button, visible on every page
const BotFab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/chatbot') return null;
  return (
    <button
      onClick={() => navigate('/chatbot')}
      aria-label="KisanBot - AI Farming Assistant"
      className="fixed bottom-[calc(11rem+env(safe-area-inset-bottom))] right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
    >
      <Bot className="h-7 w-7" />
      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-lime-400 border-2 border-white animate-pulse" />
    </button>
  );
};

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const rid = setInterval(() => checkReminders((localStorage.getItem('i18nextLng') || 'en').split('-')[0]), 30000);
    return () => clearInterval(rid);
  }, []);

  useEffect(() => {
    // Get user location on site load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          console.log("Location obtained:", { latitude, longitude });
          // You might want to store this in localStorage or Context for other components to use
          localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Please enable location services for accurate recommendations.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  if (!clerkPubKey) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Missing Clerk Publishable Key. Please check .env file.
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey} navigate={(to) => navigate(to)}>
      <Routes>
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        <Route
          path="*"
          element={
            <>
              <SignedIn>
                <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
                  <Header />
                  <main className="flex-1 container mx-auto px-4 py-6 pb-24">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/map" element={<KVKLocator />} />
                      <Route path="/disease" element={<Disease />} />
                      <Route path="/crop" element={<Crop />} />
                      <Route path="/fertilizer" element={<Fertilizer />} />
                      <Route path="/schemes" element={<Schemes />} />
                      <Route path="/market" element={<Market />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/you" element={<You />} />
                      <Route path="/pesticide" element={<PesticideCalc />} />
                      <Route path="/farmcalc" element={<FarmCalc />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/data" element={<Data />} />
                      <Route path="/weather" element={<Weather />} />
                      <Route path="/chatbot" element={<Chatbot />} />
                      <Route path="/reminders" element={<Reminders />} />
                      <Route path="/docgen" element={<DocGen />} />
                    </Routes>
                  </main>
                  <VoiceAssistant />
                  <BotFab />
                  <BottomNav />
                </div>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
};

export default App;
