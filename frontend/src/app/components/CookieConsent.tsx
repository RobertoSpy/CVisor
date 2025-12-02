"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 shadow-lg z-50 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-700">
      <div className="text-sm text-gray-300 text-center md:text-left">
        <p>
          Folosim cookie-uri pentru a îmbunătăți experiența ta. Continuând navigarea, ești de acord cu utilizarea acestora.
        </p>
      </div>
      <button
        onClick={handleAccept}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors text-sm whitespace-nowrap"
      >
        Acceptă Cookie-uri
      </button>
    </div>
  );
}
