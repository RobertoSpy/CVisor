"use client";
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="flex flex-col items-center justify-center min-h-[75vh] py-16"
    >
      <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow">
        Descopera oportunitatile intr-un singur loc!
      </h1>
      <div className="text-center text-base text-white mb-6">
    Prima platformă din România pentru studenți de acest gen, <span className="text-blue-600 font-extrabold">TOTUL GRATUIT 👀👇</span>
  </div>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mb-8 flex justify-center items-center p-4">
        <video
          src="/hero-video.mp4"
          controls
          className="rounded-lg w-full"
          style={{ minHeight: "400px" }}
        />
      </div>
    </section>
  );
}