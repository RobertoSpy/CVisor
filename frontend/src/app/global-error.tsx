'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Eroare Critică</h2>
          <p className="text-gray-600 mb-4">Aplicația a întâmpinat o eroare irecuperabilă.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Încearcă din nou
          </button>
        </div>
      </body>
    </html>
  );
}
