"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-sm pb-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-2 pt-10 space-y-16">
        {/* Titlu & Slogan */}
        <section className="text-center pb-8">
          <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow">Fii specialist! 🏆</h1>
          <p className="text-2xl font-medium drop-shadow mb-4 text-white">
            <span className="bg-clip-text text-white font-bold">
              Cine suntem noi?
            </span>
          </p>
        </section>

        {/* Povestea Noastră */}
        <section className="w-full bg-gradient-to-r from-blue-500 via-primary to-pink-400 py-10 px-4 rounded-3xl hover:scale-105 transition cursor-pointer border-b-4 border-primary/30 shadow-lg text-white">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Povestea noastră</h2>
              <p className="text-lg mb-4">
                Totul a început cu dorința de a crea o punte reală între studenți și asociații. Ne-am înscris la Innovation Labs Hackathon, unde am lucrat împreună la CVISOR și am trăit o experiență fantastică!
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>
                  Am vorbit cu peste 15+ mentori din companii de succes (Endava, Amazon, Orange, etc.)
                </li>
                <li>
                  Ne-am calificat până în semifinala hackathonului cu prezentarea ideii noastre
                </li>
                <li>
                  Am primit feedback real de la studenți, profesori și antreprenori — toate pentru a crea CVISOR exact cum își dorește comunitatea!
                </li>
              </ul>
              <p>
                Echipa:
                 Racovita Cristina, Blaj Deea, Ungureanu Rares & Spiridon Roberto — studenți la Facultatea de Informatică Iași, pasionați de tehnologie și comunitate.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                src="/us.jpg"
                alt="Echipa la Innovation Labs"
                width={340}
                height={230}
                className="rounded-2xl shadow-xl border-4 border-white object-cover"
              />
              <div className="text-center mt-2 font-semibold text-white/90 text-md">
                Prezentare la Innovation Labs Hackathon
              </div>
            </div>
          </div>
        </section>

        {/* Misiune și ce oferim */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Card echipa */}
          <div className="flex flex-col items-center bg-white/90 rounded-2xl shadow-lg p-8 hover:scale-105 transition cursor-pointer border-b-4 border-primary/30 ">
            <Image
              src="/us2.jpg"
              alt="Echipa CVISOR"
              width={400}
              height={250}
              className="rounded-2xl shadow-md object-cover border-2 border-primary"
            />
            <div className="mt-4 text-lg font-semibold text-center">
              <span className=" text-blue-600 bg-clip-text  font-bold">
                Este prima platformă din România care oferă acest lucru pentru studenți
              </span>
            </div>
            <div className="mt-1 text-grey-600 text-center max-w-lg">
              Am vorbit cu mulți profesori, studenți și asociații și ne-au dat verdictul. Începem în Iași și continuăm în cele mai mari orașe din România.
            </div>
          </div>

          {/* Card misiune */}
          <div className="bg-white/90 rounded-2xl px-8 py-10 text-center shadow  flex flex-col justify-center hover:scale-105 transition cursor-pointer border-b-4 border-primary/30 ">
            <h2 className="text-2xl font-bold mb-3">
              <span className=" text-blue-600 bg-clip-text font-bold">
                De ce CVISOR?
              </span>
            </h2>
            <p className="text-gray-800 text-lg mb-3">
              Am observat că studenții caută mereu oportunități — fie pentru dezvoltare personală, fie pentru distracție. CVISOR aduce totul împreună:
            </p>
            <ul className="list-disc mt-2 ml-8 text-left text-md text-primary">
              <li>
                <span className=" text-blue-600 bg-clip-text font-bold">
                  Oportunități de tip self-development
                </span> (workshopuri, traininguri, activități, stagii, etc)
              </li>
              <li>
                <span className=" text-blue-600 bg-clip-text font-bold">
                  Toate petrecerile
                </span> de la diverse facultăți și asociații, într-un singur loc
              </li>
              <li>
                <span className=" text-blue-600  bg-clip-text font-bold">
                  Profil student personalizat & CV digital
                </span>
              </li>
            </ul>
            <p className="mt-4 text-gray-700 text-md">
              Fiecare asociație studențească poate posta evenimente, iar tu poți vedea ce, unde și când se întâmplă.  
              Ești mereu conectat la ce contează pentru tine!
            </p>
          </div>
        </section>
{/* Secțiune finală: fundal identic cu pagina, text mare alb, imagine centrată */}
<section className="w-full flex flex-col items-center justify-center py-12 mb-24 m-0 p-0">
  <h2 className="text-3xl md:text-5xl font-extrabold text-white text-center mb-2">
    Ce mai aștepți?
  </h2>
  <p className="text-base md:text-lg text-white text-center mb-6">
    Începe să îți faci momente frumoase cu noi!
  </p>
  <Image
    src="/Opportunities.png"
    alt="Studenți Iași"
    width={1200}      // Poți mări și width dacă vrei
    height={500}      // Mai mare înălțime
    className="object-cover w-full max-w-4xl"
    priority
  />
</section>

      </div>
      <section>...</section>
    <div className="mb-24" />
    <Footer />
      
    </div>
  );
}