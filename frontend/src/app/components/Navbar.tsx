"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="text-white px-4 py-4 shadow-lg flex flex-col items-center md:flex-row md:justify-between bg-primary">
      {/* Logo + Hamburger */}
      <div className="flex items-center w-full md:w-auto justify-between">
        <div className="text-2xl font-bold drop-shadow-lg">CVISOR</div>
        {/* Hamburger button (visible only on mobile) */}
        <button
          className="md:hidden text-3xl"
          aria-label="Deschide meniul"
          onClick={() => setOpen(o => !o)}
        >
          {/* Hamburger icon */}
          <span>≡</span>
        </button>
      </div>

      {/* Navigation links */}
      <div className={`w-full md:w-auto ${open ? "block" : "hidden"} md:flex items-center justify-center md:gap-8 mt-2 md:mt-0`}>
        <ul className="flex flex-col md:flex-row gap-4 md:gap-6 text-lg font-semibold items-center">
          <li><Link href="/about" onClick={() => setOpen(false)}>Despre</Link></li>
          <li><Link href="/studies" onClick={() => setOpen(false)}>Studii</Link></li>
          <li><Link href="/testimonials" onClick={() => setOpen(false)}>Testimoniale</Link></li>
          <li><Link href="/contact" onClick={() => setOpen(false)}>Contact</Link></li>
        </ul>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4 md:mt-0 items-center">
          <Link href="/login" className="bg-secondary px-4 py-2 rounded hover:bg-accent transition font-bold w-full md:w-auto text-center" onClick={() => setOpen(false)}>Login</Link>
          <Link href="/register" className="bg-white text-primary px-4 py-2 rounded hover:bg-accent transition border border-primary font-bold w-full md:w-auto text-center" onClick={() => setOpen(false)}>Înregistrare</Link>
        </div>
      </div>
    </nav>
  );
}