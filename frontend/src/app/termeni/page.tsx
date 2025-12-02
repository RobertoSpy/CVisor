"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermeniPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header with Diagonal Line */}
      <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 pt-32 pb-48 text-center text-white overflow-hidden">
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Termeni și Condiții
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto">
            Regulile de utilizare a platformei CVISOR.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white transform -skew-y-3 origin-bottom-right translate-y-10 z-20 border-t-4 border-secondary"></div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12">
        <section className="space-y-8 text-gray-700 leading-relaxed text-lg">
          {[
            { title: "1. Acceptarea termenilor", content: "Prin utilizarea platformei, accepți acești termeni." },
            { title: "2. Serviciul", content: "Acces la oportunități, evenimente și networking pentru studenți." },
            { title: "3. Contul tău", content: "Date reale, un singur cont per utilizator." },
            { title: "4. Reguli de utilizare", content: "Fără conținut ilegal, spam sau încălcarea drepturilor de autor." },
            { title: "5. Securitate", content: "Protejăm datele tale conform GDPR." },
            { title: "6. Suspendare", content: "Ne rezervăm dreptul de a suspenda conturile care încalcă regulile." },
            { title: "7. Răspundere", content: "Suntem intermediari; nu răspundem pentru evenimentele terților." },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-primary mb-4">{item.title}</h2>
              <p>{item.content}</p>
            </div>
          ))}

          <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">Întrebări?</h2>
            <p>
              Scrie-ne la <b className="text-secondary">contact@cvisor.ro</b>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}