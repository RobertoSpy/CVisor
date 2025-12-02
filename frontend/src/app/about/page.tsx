"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header with Diagonal Line */}
      <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 pt-32 pb-48 text-center text-white overflow-hidden">
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-lg mb-6">
            Fii specialist! 🏆
          </h1>
          <p className="text-2xl text-blue-100 font-medium max-w-3xl mx-auto">
            Cine suntem noi și care este misiunea noastră?
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white transform -skew-y-3 origin-bottom-right translate-y-10 z-20 border-t-4 border-secondary"></div>
      </div>

      <main className="flex-1 w-full">
        <div className="container mx-auto px-6 py-16 space-y-24">

          {/* Story Section */}
          <section className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-bold text-gray-800">Povestea noastră</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Totul a început cu dorința de a crea o punte reală între studenți și asociații. Ne-am înscris la <b>Innovation Labs Hackathon</b>, unde am lucrat împreună la CVISOR și am trăit o experiență fantastică!
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Ne-am calificat până la semifinala Innovation Labs.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Am vorbit cu mulți mentori aduși în program de la companii de top (Endava, Amazon, Orange).
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Am avut în fiecare săptămână întâlniri cu minim 3 mentori pentru a rafina ideea.
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-secondary rounded-[2rem] rotate-3 opacity-20 transform scale-105"></div>
              <Image src="/us.jpg" alt="Team" width={600} height={400} className="rounded-[2rem] shadow-2xl relative z-10 object-cover" />
            </div>
          </section>

          {/* Mission Section */}
          <section className="bg-slate-50 rounded-[3rem] p-12 md:p-20 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">De ce <span className="text-primary">CVISOR</span>?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Am observat că studenții caută mereu oportunități. CVISOR aduce totul împreună:
              <span className="text-primary font-bold"> Self-development</span>,
              <span className="text-pink-500 font-bold"> Party</span>, și
              <span className="text-secondary font-bold"> Networking</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Oportunități", desc: "Workshopuri, traininguri, stagii" },
                { title: "Distracție", desc: "Toate petrecerile într-un singur loc" },
                { title: "Centralizat", desc: "Sunt multe asociații cu multe evenimente, dar trebuie să le cauți pe fiecare. De ce să nu fie toate într-un singur loc? Simplu și eficient!" }
              ].map((card, i) => (
                <div key={i} className="group relative p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden text-left">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary group-hover:w-full group-hover:opacity-10 transition-all duration-500"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                    <p className="text-gray-500">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Full Width CTA Section */}
        <section className="w-full py-32 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white text-center mt-16">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl font-extrabold mb-6">Ce mai aștepți?</h2>
            <p className="text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">Începe să îți faci momente frumoase cu noi! Alătură-te comunității CVISOR.</p>
            <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 transform hover:scale-[1.01] transition-transform duration-500">
              <Image src="/Opportunities.png" alt="Opportunities" width={1200} height={600} className="w-full object-cover" />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}