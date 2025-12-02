"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { Bar, Line } from "react-chartjs-2";
import { FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const associationsData = {
  labels: ["2021", "2022", "2023", "2024", "2025"],
  datasets: [
    { label: "Asociații", data: [7, 8, 9, 10, 12], backgroundColor: "#2563eb" },
    { label: "Studenți înscriși", data: [1200, 1400, 1600, 1750, 1900], backgroundColor: "#0ea5e9" },
    { label: "Studenți dornici", data: [800, 1000, 1200, 1350, 1500], backgroundColor: "#fcaf45" },
  ],
};

const opportunitiesEvolution = {
  labels: ["2021", "2022", "2023", "2024", "2025"],
  datasets: [{ label: "Oportunități/an", data: [80, 120, 170, 230, 310], backgroundColor: "#2563eb", borderColor: "#2563eb", tension: 0.4, fill: false }],
};

export default function StudiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header with Diagonal Line */}
      <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 pt-32 pb-48 text-center text-white overflow-hidden">
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg mb-6">
            Studii & Statistici 📊
          </h1>
          <p className="text-xl text-blue-100 font-medium max-w-3xl mx-auto">
            Date reale despre oportunitățile studențești din Iași și România.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white transform -skew-y-3 origin-bottom-right translate-y-10 z-20 border-t-4 border-secondary"></div>
      </div>

      <main className="flex-1 w-full">
        <div className="container mx-auto px-6 py-16 space-y-20">

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Chart 1 */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-orange-100 rounded-2xl text-orange-500"><FiBarChart2 className="text-3xl" /></div>
                <h2 className="text-2xl font-bold text-gray-800">Oportunități pe asociații</h2>
              </div>
              <div className="h-80 w-full mb-4"><Bar data={associationsData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
              <div className="mt-auto p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-center text-primary font-bold text-lg">
                  Concluzie: Interesul studenților a crescut constant în ultimii 5 ani, depășind capacitatea actuală a asociațiilor!
                </p>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-pink-100 rounded-2xl text-pink-500"><FiTrendingUp className="text-3xl" /></div>
                <h2 className="text-2xl font-bold text-gray-800">Evoluția oportunităților</h2>
              </div>
              <div className="h-80 w-full mb-4"><Line data={opportunitiesEvolution} options={{ responsive: true, maintainAspectRatio: false }} /></div>
              <p className="text-center mt-auto text-primary font-bold text-lg">Creștere masivă până în 2025! 🚀</p>
            </div>
          </div>
        </div>

        {/* Full Width Info Section */}
        <section className="w-full py-32 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white mt-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-[100px] opacity-10"></div>
          <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <Image src="/students-europe.jpg" alt="Europe" width={600} height={400} className="rounded-3xl shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Studenție în Europa</h2>
              <p className="text-blue-100 text-xl leading-relaxed">
                Marile centre universitare (Berlin, Paris, Londra) oferă peste <b>5.000</b> de evenimente anual. România se aliniază rapid acestui trend, cu o creștere estimată de <b>60%</b> până în 2030.
              </p>
              <ul className="space-y-4 text-blue-50 text-lg">
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-secondary rounded-full"></span> 10.000+ oportunități în marile orașe</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-secondary rounded-full"></span> Evenimente hybrid și internaționale</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-secondary rounded-full"></span> Comunități globale conectate</li>
              </ul>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}