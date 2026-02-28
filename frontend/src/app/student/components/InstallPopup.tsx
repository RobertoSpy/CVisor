import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Using direct SVGs to ensure no dependency issues if heroicons isn't installed
const ShareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500">
    <path d="M12 3V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7L12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 13V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusSquareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface InstallPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallPopup({ isOpen, onClose }: InstallPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-open if appropriate? No, wait for user action.
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    } else {
      // No prompt available (iOS or Desktop without support), show instructions
      setShowInstructions(true);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 transform transition-transform duration-300 ease-out pointer-events-auto mb-0 sm:mb-8 mx-4 overflow-hidden border border-gray-100">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
        >
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* App Icon */}
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner mb-2">
            <img src="/albastru.svg" alt="CVisor" className="w-10 h-10 object-contain" />
          </div>

          <h3 className="text-xl font-bold text-gray-900">Instalează CVisor</h3>

          {!showInstructions && deferredPrompt && (
            <div className="w-full">
              <p className="text-sm text-gray-500 mb-4">
                Instalează aplicația pentru o experiență mai bună, notificări și acces rapid.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                📲 Instalează Acum
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className="mt-3 text-xs text-gray-400 font-medium hover:text-blue-500 underline"
              >
                Nu merge butonul? Arată instrucțiuni manuale
              </button>
            </div>
          )}

          {/* Fallback Instructions (iOS/Desktop Manual) */}
          {(showInstructions || !deferredPrompt) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
              <p className="text-sm text-gray-500 mb-4 px-2">
                Nu putem instala automat. Te rugăm să urmezi pașii de mai jos:
              </p>

              <div className="w-full h-px bg-gray-100 my-2" />

              <div className="flex items-center gap-4 w-full text-left p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                  <ShareIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">1. Apasă butonul "Share" / "Menu"</p>
                  <p className="text-xs text-gray-500">De obicei în bara de jos sau sus-dreapta</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full text-left p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700">
                  <PlusSquareIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">2. Alege "Add to Home Screen"</p>
                  <p className="text-xs text-gray-500">"Adaugă la Ecranul Principal"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
