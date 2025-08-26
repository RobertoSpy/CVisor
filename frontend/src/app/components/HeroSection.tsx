export default function HeroSection() {
  return (
    <section className="bg-gradient-hero flex flex-col items-center justify-center min-h-[75vh] py-16">
      <h1 className="text-5xl font-extrabold text-white text-center mb-6 drop-shadow-lg">
        CVISOR - Ajutăm generații să învețe!
      </h1>
      <video
        src="/hero-video.mp4"
        controls
        className="rounded-xl shadow-xl w-full max-w-3xl mb-8"
        style={{ minHeight: "400px" }}
      />
    </section>
  );
}