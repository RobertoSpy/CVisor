"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark text-neutral py-10 px-6 w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Legal */}
        <div>
          <h4 className="font-bold mb-2">Legal</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/termeni" className="hover:text-primary transition-colors">
                Termeni și condiții
              </Link>
            </li>
            <li>
              <Link href="/gdpr" className="hover:text-primary transition-colors">
                Politica GDPR
              </Link>
            </li>
            <li>
              <Link href="/contact-legal" className="hover:text-primary transition-colors">
                Contact Legal
              </Link>
            </li>
          </ul>
        </div>
        {/* Informatii */}
        <div>
          <h4 className="font-bold mb-2">Informații</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/#stats" className="hover:text-primary transition-colors">
                Despre CVISOR
              </Link>
            </li>
            <li>
              <Link href="/#parteneri" className="hover:text-primary transition-colors">
                Parteneri
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">
                Carieră
              </Link>
            </li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h4 className="font-bold mb-2">Contact</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>



      <div className="mt-8 text-center text-xs text-neutral/70">
        &copy; 2025 CVISOR. Toate drepturile rezervate.
      </div>
    </footer>
  );
}