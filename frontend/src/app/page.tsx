import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <img src="/logo.png" alt="Logo" className="mb-6 w-32" />
      <h1 className="text-4xl font-bold mb-4">Bun venit la CVISOR!</h1>
      <p className="mb-8 text-lg text-gray-700 text-center max-w-xl">
        O platformă modernă pentru gestionarea CV-urilor, utilizatorilor și proiectelor. 
        Poți să-ți creezi cont, să te loghezi și să explorezi funcționalitățile avansate.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="bg-gray-300 px-6 py-2 rounded font-semibold hover:bg-gray-400 transition">
            Înregistrare
          </button>
        </Link>
      </div>
      {/* Poți adăuga poze, feature highlights etc. */}
    </main>
  );
}