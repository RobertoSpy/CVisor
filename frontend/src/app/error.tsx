'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Ceva nu a mers bine!</h2>
        <p className="text-gray-600 mb-6">
          Ne pare rău, a apărut o eroare neașteptată. Te rugăm să încerci din nou.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reîncarcă Pagina
          </button>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 text-left p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
            <p className="font-bold text-red-500">{error.name}: {error.message}</p>
            {error.stack && <pre className="mt-2">{error.stack}</pre>}
          </div>
        )}
      </div>
    </div>
  );
}
