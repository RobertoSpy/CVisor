"use client";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 pt-20 pb-32">

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

        {/* Left Column: Text */}
        <div className="text-center lg:text-left text-white space-y-6 order-2 lg:order-1">
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
            Descopera <br />
            <span className="text-secondary">Oportunitatile</span>
          </h1>
          <p className="text-lg lg:text-xl text-blue-100 font-light max-w-md mx-auto lg:mx-0">
            Prima platformă din România pentru studenți de acest gen.
            <span className="block mt-2 font-bold text-white">TOTUL GRATUIT 👀👇</span>
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button className="bg-secondary hover:bg-white hover:text-primary text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1">
              Începe Acum
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-full font-bold transition-all">
              Află Mai Multe
            </button>
          </div>
        </div>

        {/* Center Column: The Bulb - GIGANTIC SIZE */}
        <div className="relative flex justify-center items-center order-1 lg:order-2">
          <div className="relative w-[500px] h-[500px] lg:w-[800px] lg:h-[800px] animate-float">
            {/* Glow effect behind bulb */}
            <div className="absolute inset-0 bg-blue-400 rounded-full filter blur-[120px] opacity-30"></div>
            <Image
              src="/albastru.svg"
              alt="Lightbulb"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Right Column: Video */}
        <div className="flex justify-center lg:justify-end order-3">
          <div className="relative group w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white p-2 rounded-2xl shadow-2xl transform transition-transform hover:scale-[1.02]">
              <video
                src="/hero-video.mp4"
                controls
                className="rounded-xl w-full h-auto object-cover"
                style={{ maxHeight: "300px" }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Diagonal Line at Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-white transform -skew-y-3 origin-bottom-right translate-y-10 z-20 border-t-4 border-secondary"></div>
    </section>
  );
}