"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-primary text-white px-8 py-4 shadow-md flex flex-col items-center">
      {/* Titlu centrat sus */}
      <div className="text-2xl font-bold mb-2">CVISOR</div>
      {/* Navigație centrată și spațiată */}
      <div className="flex items-center justify-center w-full gap-8">
        <ul className="flex gap-6">
          <li><Link href="/about">Despre</Link></li>
          <li><Link href="/studies">Studii</Link></li>
          <li><Link href="/testimonials">Testimoniale</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        {/* Butoane Login/Register separate cu gap mare */}
        <div className="flex gap-4 ml-8">
          <Link href="/login" className="bg-secondary px-4 py-2 rounded hover:bg-accent transition">Login</Link>
          <Link href="/register" className="bg-white text-primary px-4 py-2 rounded hover:bg-accent transition border border-primary">Înregistrare</Link>
        </div>
      </div>
    </nav>
  );
}