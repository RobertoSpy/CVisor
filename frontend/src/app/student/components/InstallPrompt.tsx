"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import InstallPopup from "./InstallPopup";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (Standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Capture the event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("Captured beforeinstallprompt");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  // Determine status message/action
  const handleClick = async () => {
    if (isStandalone) {
      toast.success("Aplicația este deja instalată! ✅", {
        icon: '📱',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    if (deferredPrompt) {
      // Android / Desktop with support
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast.success("Se instalează...", { icon: '🚀' });
      }
      return;
    }

    if (isIOS) {
      // Show elegant iOS popup
      setShowIOSPrompt(true);
      return;
    }

    // Fallback for desktop/others without prompt (e.g. Firefox)
    toast("Pentru a instala, folosește meniul browserului (⋮) -> 'Install App' sau 'Add to Home Screen'.", {
      icon: 'ℹ️',
      duration: 5000
    });
  };

  // Always render FAB
  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-[9999] bg-white p-3 rounded-full shadow-2xl border-2 border-blue-500 hover:scale-110 transition-transform active:scale-95 animate-bounce"
        title={isStandalone ? "Aplicație Instalată" : "Instalează Aplicația"}
        style={{ animationDuration: '2s' }} // Slower bounce
      >
        <img
          src="/albastru.svg"
          alt="App Icon"
          className={`w-10 h-10 md:w-12 md:h-12 object-contain ${isStandalone ? 'opacity-50 grayscale' : ''}`}
        />
        {isStandalone && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        )}
      </button>
      <InstallPopup isOpen={showIOSPrompt} onClose={() => setShowIOSPrompt(false)} />
    </>
  );
}
