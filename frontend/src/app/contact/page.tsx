"use client";
import Image from "next/image";
import { FiMail, FiInstagram, FiPhone } from "react-icons/fi";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const contactData = [
  {
    icon: <FiMail className="text-3xl text-primary" />,
    title: "Email",
    value: "echipa@cvisor.ro",
    link: "mailto:echipa@cvisor.ro",
    color: "bg-white",
  },
  {
    icon: <FiInstagram className="text-3xl text-pink-600" />,
    title: "Instagram",
    value: "@cvisor",
    link: "https://instagram.com/cvisor",
    color: "bg-white",
  },
  {
    icon: <FiPhone className="text-3xl text-green-600" />,
    title: "Telefon",
    value: "+40 712 345 678",
    link: "tel:+40712345678",
    color: "bg-white",
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");

    const formData = {
      nume: e.target.nume.value,
      email: e.target.email.value,
      telefon: e.target.telefon.value,
      mesaj: e.target.mesaj.value,
    };

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.ok) {
        setSent(true);
      } else {
        setErrMsg("A apărut o eroare la trimitere. Încearcă din nou!");
      }
    } catch (error) {
      setErrMsg("A apărut o eroare la trimitere. Încearcă din nou!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-sm">
          <Navbar />
    <div className="min-h-screen bg-gradient-to-sb pt-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow">  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-primary to-pink-400 font-bold">Contactează Echipa CVISOR </span></h1>
          <p className="text-xl text-white/90 font-medium drop-shadow">
           <span className="bg-clip-text text-white font-bold">
            Suntem aici pentru orice întrebare, colaborare sau sugestie!  
            Găsești datele noastre mai jos:
            </span>
          </p>
        </div>

        {/* FLEX LAYOUT: CARDS LEFT, FORM RIGHT */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cardurile de contact */}
          <div className="flex flex-col gap-6 flex-1">
            {contactData.map((contact) => (
              <a
                key={contact.title}
                href={contact.link}
                target={contact.link.startsWith("http") ? "_blank" : undefined}
                rel={contact.link.startsWith("http") ? "noopener" : undefined}
                className={`flex items-center gap-5 p-6 rounded-2xl shadow-lg hover:scale-105 transition ${contact.color} cursor-pointer border-b-4 border-primary/30`}
              >
                <div>{contact.icon}</div>
                <div>
                  <div className="font-bold text-primary text-lg">{contact.title}</div>
                  <div className="text-gray-700 text-md">{contact.value}</div>
                </div>
              </a>
            ))}
            <div className="hidden lg:block mt-8">
              <div className="text-center text-md text-white pt-4">
                <b>Ne poți găsi și la facultate!</b>
                <br />
                Dacă vrei să ne cunoști sau să povestim direct, scrie-ne și stabilim o întâlnire.
              </div>
            </div>
          </div>

          {/* Formularul de contact */}
          <div className="bg-white/80 rounded-2xl shadow-lg p-6 border-b-4 border-primary/30 flex-1">
            <h2 className="text-xl font-bold text-primary mb-4 text-center">Trimite-ne un mesaj rapid</h2>
            {sent ? (
              <div className="text-center text-green-600 font-bold">
                Mesajul tău a fost trimis! Îți răspundem cât mai repede.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="nume"
                  required
                  placeholder="Nume complet"
                  className="w-full p-3 rounded-lg border border-primary/20 focus:outline-primary"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email"
                  className="w-full p-3 rounded-lg border border-primary/20 focus:outline-primary"
                />
                <input
                  type="tel"
                  name="telefon"
                  required
                  placeholder="Număr de telefon"
                  className="w-full p-3 rounded-lg border border-primary/20 focus:outline-primary"
                />
                <textarea
                  name="mesaj"
                  required
                  placeholder="Mesajul tău..."
                  rows={4}
                  className="w-full p-3 rounded-lg border border-primary/20 focus:outline-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-white font-bold px-8 py-3 rounded-lg shadow hover:scale-105 transition"
                  disabled={loading}
                >
                  {loading ? "Se trimite..." : "Trimite mesajul"}
                </button>
                {errMsg && <div className="text-red-600 text-center font-bold">{errMsg}</div>}
              </form>
            )}
          </div>
        </div>

        {/* Imagine și text pentru mobil */}
        <div className="lg:hidden flex flex-col items-center mt-10">
          <div className="text-center text-md text-white pt-4">
            <b><span className="text-primary">Ne poți găsi și la facultate!</span></b>
            <br />
            <span className="text-primary">Dacă vrei să ne cunoști sau să povestim direct, scrie-ne și stabilim o întâlnire.</span>
          </div>
        </div>
      </div>
      <div className="mb-24"/>
    </div>
    <Footer />
    </div>
  );
}