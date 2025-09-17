import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gradient-sm pb-0 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-2 pt-10 pb-8 space-y-12">
        <div className="bg-white/90 rounded-2xl shadow-lg p-8 border-b-4 border-primary/30 max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6 text-primary drop-shadow text-center">
            Politica de Confidențialitate și Protecția Datelor (GDPR)
          </h1>
          <section className="space-y-6 text-gray-800 text-lg">
            <p>
              Platforma <b>CVISOR</b> respectă prevederile Regulamentului (UE) 2016/679 privind protecția datelor cu caracter personal ("GDPR").
            </p>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">1. Ce date colectăm?</h2>
              <ul className="list-disc ml-6">
                <li>Nume, prenume</li>
                <li>Adresa de e-mail</li>
                <li>Număr de telefon (dacă este cazul)</li>
                <li>Universitatea, facultatea, anul de studiu</li>
                <li>Date de navigare și utilizare platformă (cookies, IP, device)</li>
                <li>Opțional: fotografie de profil, CV digital, preferințe/opțiuni</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">2. Scopul colectării datelor</h2>
              <ul className="list-disc ml-6">
                <li>Crearea și administrarea contului tău</li>
                <li>Personalizarea profilului și recomandărilor</li>
                <li>Transmiterea de notificări despre evenimente și oportunități relevante</li>
                <li>Îmbunătățirea serviciilor CVISOR</li>
                <li>Respectarea obligațiilor legale</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">3. Cum stocăm și protejăm datele?</h2>
              <ul className="list-disc ml-6">
                <li>Datele tale sunt stocate securizat pe servere din UE</li>
                <li>Accesul este restricționat doar persoanelor autorizate</li>
                <li>Implementăm măsuri tehnice și organizatorice pentru a preveni pierderea, accesul neautorizat sau divulgarea datelor</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">4. Cât timp păstrăm datele?</h2>
              <p>
                Datele tale sunt păstrate pe durata existenței contului sau până când soliciți ștergerea lor. Unele date pot fi păstrate conform obligațiilor legale.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">5. Drepturile tale</h2>
              <ul className="list-disc ml-6">
                <li><b>Dreptul la informare</b> — să știi ce date sunt colectate</li>
                <li><b>Dreptul la acces</b> — să soliciți o copie a datelor tale</li>
                <li><b>Dreptul la rectificare</b> — să corectezi datele inexacte</li>
                <li><b>Dreptul la ștergere</b> ("dreptul de a fi uitat")</li>
                <li><b>Dreptul la restricționare</b> — să limitezi prelucrarea</li>
                <li><b>Dreptul la portabilitate</b> — să primești datele într-un format transferabil</li>
                <li><b>Dreptul la opoziție</b> — să te opui anumitor tipuri de prelucrare</li>
              </ul>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">6. Cookie-uri și tehnologii similare</h2>
              <p>
                Folosim cookie-uri pentru a îmbunătăți experiența ta. Poți gestiona preferințele din browser.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 mb-2 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">7. Dezvăluirea datelor către terți</h2>
              <p>
                Nu vindem și nu transferăm datele tale către terți fără consimțământul tău, cu excepția cazurilor impuse de lege sau pentru furnizorii de servicii strict necesari platformei.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 via-primary/5 to-pink-50/50 p-5 border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-2">8. Contact</h2>
              <p>
                Pentru orice întrebări sau solicitări privind datele personale, ne poți contacta la <b>contact@cvisor.ro</b>.
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