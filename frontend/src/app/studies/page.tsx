"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { Bar, Line } from "react-chartjs-2";
import { FiBarChart2, FiTrendingUp } from "react-icons/fi";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Asociații pe an (exemplu)
const associationsData = {
  labels: ["2021", "2022", "2023", "2024", "2025"],
  datasets: [
    {
      label: "Asociații",
      data: [7, 8, 9, 10, 12],
      backgroundColor: "#2563eb",
    },
    {
      label: "Studenți înscriși",
      data: [1200, 1400, 1600, 1750, 1900],
      backgroundColor: "#0ea5e9",
    },
    {
      label: "Studenți dornici",
      data: [800, 1000, 1200, 1350, 1500],
      backgroundColor: "#fcaf45",
    },
  ],
};

const opportunitiesEvolution = {
  labels: ["2021", "2022", "2023", "2024", "2025"],
  datasets: [
    {
      label: "Oportunități/an",
      data: [80, 120, 170, 230, 310],
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
      tension: 0.4,
      fill: false,
    },
  ],
};

export default function StudiesPage() {
  return (
    <div className="min-h-screen bg-gradient-sm pb-0">
      <Navbar />
      <div className="max-w-5xl mx-auto space-y-16 px-2">

        {/* Titlu */}
        <div className="text-center mt-12">
          <h1 className="text-5xl font-extrabold text-primary mb-4 drop-shadow"> Studii & Statistici CVISOR 📊</h1>
          <p className="text-2xl text-white/90 font-medium drop-shadow max-w-3xl mx-auto">
           <span className="bg-clip-text text-white font-bold">
            Date reale și vizualizări moderne despre oportunitățile studențești și petreceri din Iași și România.
            </span>
          </p>
        </div>

          {/* Carduri pe orizontală (side-by-side) */}
        <div className="flex flex-col md:flex-row gap-12 justify-center items-stretch">
          {/* Oportunități pe asociații */}
          <div className="flex-1 flex flex-col items-center rounded-2xl shadow-lg hover:scale-105 transition bg-white cursor-pointer border-b-4 border-primary/30 px-8 py-10 max-w-md mx-auto">
            <FiBarChart2 className="text-5xl text-orange-500" />
            <h2 className="text-2xl font-extrabold text-primary mt-4 mb-2 text-center">Oportunități pe asociații și studenți (Iași)</h2>
            <p className="text-lg text-gray-700 font-medium mb-6 text-center">
              Număr de asociații, studenți înscriși și studenți dornici (ultimii 5 ani).
            </p>
            <div className="w-full flex justify-center items-center my-2" style={{ minHeight: "260px" }}>
              <div className="w-72 h-60">
                <Bar
                  data={associationsData}
                  options={{
                    plugins: { legend: { position: "bottom" } },
                    responsive: true,
                    scales: { x: { stacked: true }, y: { stacked: false } },
                  }}
                />
              </div>
            </div>
           <div className="mt-4 flex flex-wrap justify-center gap-3">
  {associationsData.labels.map((year, i) => (
    <div key={year} className="flex gap-2 items-center bg-primary/10 rounded-full px-4 py-1 shadow-sm">
      <span className="font-semibold text-primary">{year}</span>
      <span className="text-blue-600">{associationsData.datasets[0].data[i]} asoc.</span>
      <span className="text-cyan-600">{associationsData.datasets[1].data[i]} stud.</span>
      <span className="text-yellow-500">{associationsData.datasets[2].data[i]} dornici</span>
    </div>
  ))}
</div>
          </div>

          {/* Evoluția oportunităților */}
          <div className="flex-1 flex flex-col items-center rounded-2xl shadow-lg hover:scale-105 transition bg-white cursor-pointer border-b-4 border-primary/30 px-8 py-10 max-w-md mx-auto">
            <FiTrendingUp className="text-5xl text-pink-600" />
            <h2 className="text-2xl font-extrabold text-primary mt-4 mb-2 text-center">Evoluția oportunităților (România)</h2>
            <p className="text-lg text-gray-700 font-medium mb-6 text-center">
              Numărul total de oportunități studențești la nivel național (ultimii 5 ani).
            </p>
            <div className="w-full flex justify-center items-center my-2" style={{ minHeight: "260px" }}>
              <div className="w-72 h-60">
                <Line
                  data={opportunitiesEvolution}
                  options={{
                    plugins: { legend: { display: false } },
                    responsive: true,
                  }}
                />
              </div>
            </div>
            <div className="mt-4 text-lg text-pink-600 font-bold text-center">
              <span>
                Creștere de la {opportunitiesEvolution.datasets[0].data[0]} în 2021 la {opportunitiesEvolution.datasets[0].data[4]} în 2025!
              </span>
            </div>
          </div>
        </div>

        {/* Secțiune tip hackathon: Studenție & Europa */}
        <section className="w-full bg-gradient-to-r from-blue-500 via-primary to-pink-400 py-10 px-4 rounded-3xl shadow-lg text-white">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 w-full flex justify-center">
              <Image
                src="/students-europe.jpg"
                alt="Studenți Europa"
                width={340}
                height={240}
                className="rounded-2xl shadow-lg border-2 border-white object-cover"
              />
            </div>
            <div className="md:w-1/2 w-full">
              <h2 className="text-2xl font-bold mb-4">Studenție & Oportunități în Europa și Global</h2>
              <p className="text-lg mb-4">
                În afara României, cele mai mari centre universitare din Europa (Berlin, Paris, Londra, Madrid) oferă studenților acces la peste <b>5.000</b> de evenimente și oportunități de self-development anual.
                <br /><br />
                În ultimii 10 ani, trendul european arată o creștere de peste 120% la activități dedicate studenților, cu focus pe dezvoltare personală, networking și voluntariat internațional.
              </p>
              <p className="text-lg mb-4">
                <b>Previziuni pentru următorii 5-10 ani:</b>
              </p>
              <ul className="list-disc ml-6 mb-4 text-lg">
                <li>Peste <b>10.000</b> de oportunități/an în marile orașe europene</li>
                <li>Creștere accelerată a evenimentelor hybrid (online + fizic)</li>
                <li>Mai multe proiecte de mobilitate și internshipuri internaționale</li>
                <li>Comunități studențești globale conectate digital</li>
              </ul>
              <p className="text-md">
                <b>România</b> se aliniază trendului, cu o creștere estimată de <b>~60%</b> la oportunități până în 2030, mai ales în centrele universitare mari (Iași, Cluj, București, Timișoara).
              </p>
            </div>
          </div>
        </section>

      
         {/* Imagine + concluzie */}
{/* Imagine + concluzie */}
<div className="flex flex-col items-center justify-center mt-8 mb-24">
  {/* Textul deasupra cardului */}
  <div className="text-center text-lg text-primary font-semibold mb-6">
    Cu CVISOR vezi rapid toate oportunitățile și evenimentele din oraș!
  </div>
  {/* Cardul doar cu imaginea */}
  <div className="rounded-2xl shadow-lg hover:scale-105 transition bg-white cursor-pointer border-b-4 border-primary/30 p-6 max-w-xl w-full flex flex-col items-center">
    <Image
      src="/tel.jpg"
      alt="Statistici vizuale"
      width={400}
      height={260}
      className="rounded-2xl shadow-md object-cover border-2 border-white"
    />
  </div>
</div>
        
       
      </div>
        <section>...</section>
    <div className="mb-24" />
      <Footer />
    </div>
  );
}