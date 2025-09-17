"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="text-white px-8 py-4 shadow-lg flex flex-col items-center">
      <div className="text-2xl font-bold mb-2 drop-shadow-lg">CVISOR</div>
      <div className="flex items-center justify-center w-full gap-8">
        <ul className="flex gap-6 text-lg font-semibold">
          <li><Link href="/about">Despre</Link></li>
          <li><Link href="/studies">Studii</Link></li>
          <li><Link href="/testimonials">Testimoniale</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <div className="flex gap-4 ml-8">
          <Link href="/login" className="bg-secondary px-4 py-2 rounded hover:bg-accent transition font-bold">Login</Link>
          <Link href="/register" className="bg-white text-primary px-4 py-2 rounded hover:bg-accent transition border border-primary font-bold">Înregistrare</Link>
        </div>
      </div>
    </nav>
  );
}