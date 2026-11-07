'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, Wifi, X, Share, PlusSquare, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaManager: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker only in production (avoids caching Next.js dev bundles)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('Service Worker registration warning:', err));
    } else if ('serviceWorker' in navigator) {
      // In dev mode, unregister any existing service worker that might have cached old chunks
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
    }

    // 2. Detect standalone mode & iOS
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(iosDevice);

    const dismissed = localStorage.getItem('syndic_pwa_banner_dismissed') === '1';
    setBannerDismissed(dismissed);

    // 3. Capture install prompt (Chrome / Edge / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    // Offline / Online listeners
    setIsOffline(!navigator.onLine);
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
    };

    // Custom event so Navbar button can also trigger install!
    const handleCustomTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else if (iosDevice && !standalone) {
        setShowIosGuide(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('syndic-trigger-pwa-install', handleCustomTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('syndic-trigger-pwa-install', handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('syndic_pwa_banner_dismissed', '1');
  };

  const canInstall = !isStandalone && (Boolean(deferredPrompt) || isIos);

  return (
    <>
      {/* Offline / Reconnected Network Indicator */}
      {isOffline && (
        <div className="no-print bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 z-50">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Mode Hors-Ligne actif — Consultation et stockage local opérationnels</span>
        </div>
      )}

      {justReconnected && !isOffline && (
        <div className="no-print bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 z-50 animate-in fade-in">
          <Wifi className="w-3.5 h-3.5 shrink-0" />
          <span>Connexion internet rétablie</span>
        </div>
      )}

      {/* Install PWA Smart Banner (Mobile & Desktop if not dismissed) */}
      {canInstall && !bannerDismissed && (
        <div className="no-print fixed bottom-20 md:bottom-5 left-3 right-3 md:left-auto md:right-24 md:max-w-sm z-40 bg-[#0d2b1a] text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                Installer <span className="text-orange-400">SYNCOCI</span>{' '}
                <span className="text-emerald-400">2</span> (PWA)
              </div>
              <div className="text-[11px] text-emerald-200/80 line-clamp-1">
                Gestion des Copropriétaires de la Cité Ivoire 2
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 text-xs font-bold shadow-sm flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Instructions Modal */}
      {showIosGuide && (
        <div className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Installer sur iPhone / iPad
              </h3>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pour installer <strong className="text-orange-500">SYNCOCI 2</strong> comme une
              application native sur votre écran d’accueil :
            </p>
            <ol className="space-y-3 text-xs text-gray-800">
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <Share className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  1. Appuyez sur le bouton <strong>Partager</strong> dans la barre de Safari.
                </span>
              </li>
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <PlusSquare className="w-5 h-5 text-forest-700 shrink-0" />
                <span>
                  2. Choisissez <strong>« Sur l’écran d’accueil »</strong> puis validez.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};

