export default function Footer() {
  return (
    <footer className="bg-dark text-neutral py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold mb-2">Legal</h4>
          <ul className="space-y-1">
            <li>Termeni și condiții</li>
            <li>Politica GDPR</li>
            <li>Contact Legal</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">Informații</h4>
          <ul className="space-y-1">
            <li>Despre CVISOR</li>
            <li>Parteneri</li>
            <li>Carieră</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">Contact</h4>
          <ul className="space-y-1">
            <li>Email: office@cvisor.ro</li>
            <li>Telefon: 0123456789</li>
            <li>Adresă: Str. Exemplu, nr. 1, București</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-neutral/70">
        &copy; 2025 CVISOR. Toate drepturile rezervate.
      </div>
    </footer>
  );
}