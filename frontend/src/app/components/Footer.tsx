// Server Component — no "use client" for SEO
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 px-6 w-full border-t border-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">CVISOR</h3>
          <p className="text-sm text-slate-400">
            Platforma unde oportunitățile întâlnesc studenții. Descoperă, învață și distrează-te.
          </p>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold text-white mb-4 text-lg">Legal</h4>
          <ul className="space-y-2">
            <li><Link href="/termeni" className="hover:text-secondary transition-colors">Termeni și condiții</Link></li>
            <li><Link href="/gdpr" className="hover:text-secondary transition-colors">Politica GDPR</Link></li>
            <li><Link href="/contact-legal" className="hover:text-secondary transition-colors">Contact Legal</Link></li>
          </ul>
        </div>

        {/* Informatii */}
        <div>
          <h4 className="font-bold text-white mb-4 text-lg">Informații</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-secondary transition-colors">Home</Link></li>
            <li><Link href="/#stats" className="hover:text-secondary transition-colors">Despre CVISOR</Link></li>
            <li><Link href="/#parteneri" className="hover:text-secondary transition-colors">Parteneri</Link></li>
            <li><Link href="/about" className="hover:text-secondary transition-colors">Carieră</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-white mb-4 text-lg">Contact</h4>
          <ul className="space-y-2">
            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contactează-ne</Link></li>
            <li className="text-sm text-slate-500 mt-4">Iași, România</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} CVISOR. Toate drepturile rezervate.
      </div>
    </footer>
  );
}