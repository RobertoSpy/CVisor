import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermeniPage() {
  return (
    <div className="min-h-screen bg-gradient-sm pb-0 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-2 pt-10 pb-8 space-y-12">
        <div className="bg-white/90 rounded-2xl shadow-lg p-8 border-b-4 border-primary/30 max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6 text-primary drop-shadow text-center">
            Termeni și Condiții de Utilizare
          </h1>
          <section className="space-y-6 text-gray-800 text-lg">
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">1. Acceptarea termenilor</h2>
              <p>
                Accesând și utilizând platforma CVISOR, accepți integral termenii și condițiile prezentate aici.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">2. Descrierea serviciului</h2>
              <p>
                CVISOR oferă studenților și asociațiilor acces la oportunități educaționale, evenimente, workshopuri, petreceri și networking.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">3. Crearea contului</h2>
              <ul className="list-disc ml-6">
                <li>Este permisă o singură înregistrare pe utilizator</li>
                <li>Informațiile furnizate trebuie să fie reale și actualizate</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">4. Utilizarea platformei</h2>
              <ul className="list-disc ml-6">
                <li>Nu posta conținut ilegal, ofensator sau fals</li>
                <li>Nu folosi platforma pentru spam sau publicitate neautorizată</li>
                <li>Respectă drepturile de autor și proprietatea intelectuală</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">5. Securitatea datelor</h2>
              <p>
                CVISOR depune eforturi pentru protejarea datelor tale, conform Politicii GDPR.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">6. Suspendarea sau ștergerea contului</h2>
              <p>
                CVISOR își rezervă dreptul de a suspenda sau șterge conturile care încalcă regulile, fără notificare prealabilă.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">7. Limitarea răspunderii</h2>
              <p>
                CVISOR nu răspunde pentru acțiunile utilizatorilor sau pentru evenimentele organizate de terți. Platforma oferă doar intermediere informațională.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">8. Modificarea termenilor</h2>
              <p>
                Termenii pot fi actualizați oricând. Recomandăm să verifici periodic această pagină.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">9. Contact</h2>
              <p>
                Pentru orice întrebări sau sesizări, scrie-ne la <b>contact@cvisor.ro</b>.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ultima actualizare: 15 septembrie 2025
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}