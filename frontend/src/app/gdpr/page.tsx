"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function GDPRPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header with Diagonal Line */}
      <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 pt-32 pb-48 text-center text-white overflow-hidden">
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Politica de Confidențialitate (GDPR)
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto">
            Transparență totală privind modul în care colectăm și protejăm datele tale.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white transform -skew-y-3 origin-bottom-right translate-y-10 z-20 border-t-4 border-secondary"></div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12">
        <section className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <p>
            Platforma <b>CVISOR</b> respectă prevederile Regulamentului (UE) 2016/679 privind protecția datelor cu caracter personal ("GDPR").
          </p>

          {[
            { title: "1. Ce date colectăm?", content: "Nume, prenume, email, telefon, universitate, date de navigare." },
            { title: "2. Scopul colectării", content: "Administrare cont, personalizare, notificări, îmbunătățire servicii." },
            { title: "3. Stocare și protecție", content: "Servere securizate UE, acces restricționat, măsuri tehnice avansate." },
            { title: "4. Păstrarea datelor", content: "Pe durata existenței contului sau până la solicitarea ștergerii." },
            { title: "5. Drepturile tale", content: "Informare, acces, rectificare, ștergere, restricționare, portabilitate, opoziție." },
            { title: "6. Cookie-uri", content: "Folosim cookie-uri pentru o experiență mai bună. Le poți gestiona din browser." },
            { title: "7. Terți", content: "Nu vindem datele tale. Le transmitem doar dacă e necesar legal sau tehnic." },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-primary mb-4">{item.title}</h2>
              <p>{item.content}</p>
            </div>
          ))}

          <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">Contact DPO</h2>
            <p>
              Pentru orice întrebări, scrie-ne la <b className="text-secondary">contact@cvisor.ro</b>.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Ultima actualizare: 15 septembrie 2025
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}