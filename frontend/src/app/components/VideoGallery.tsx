// Server Component — no "use client" for SEO
export default function VideoGallery() {
  const videos = [
    { id: "abc123", title: "Viața studențească la CVISOR" },
    { id: "def456", title: "Parteneriate și colaborări" },
    { id: "ghi789", title: "Evenimente și oportunități" },
  ];
  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white" id="video-gallery">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16 drop-shadow-md max-w-4xl mx-auto leading-tight">
          Aplicația s-a dezvoltat pe baza feedback-ului studenților. <br />
          <span className="text-secondary">Descoperă și testimoniale video cu ei!</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {videos.map((video) => (
            <div key={video.id} className="group flex flex-col bg-white/10 backdrop-blur-md rounded-3xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:-translate-y-2 shadow-xl">
              <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-6 text-center font-bold text-xl text-white group-hover:text-secondary transition-colors">
                {video.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}