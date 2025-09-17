"use client";
export default function VideoGallery() {
  const videos = [
    { id: "abc123", title: "Viața studențească la CVISOR" },
    { id: "def456", title: "Parteneriate și colaborări" },
    { id: "ghi789", title: "Evenimente și oportunități" },
  ];
  return (
    <section className="py-12" id="video-gallery">
      <div className="w-full">
        {/* Card central cu gradient */}
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 via-primary to-pink-400 rounded-3xl shadow-lg p-8 hover: scale-105 transition cursor-pointer border-b-4 border-primary/30 ">
          <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">
            Am întrebat mulți studenți despre ce cred ei despre aplicație, ne-am documentat, am modificat după placerile lor, așa că nu am putut să nu punem și câteva testimoniale video cu ei
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="flex flex-col items-center bg-white bg-opacity-80 rounded-xl shadow-xl p-4">
                <iframe
                  width="100%"
                  height="216"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  className="rounded-xl shadow-xl w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="mt-4 text-center font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-primary to-pink-400">
                  {video.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}