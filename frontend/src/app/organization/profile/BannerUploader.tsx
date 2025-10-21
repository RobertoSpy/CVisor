import React from "react";

export default function BannerUploader({ value, onChange }: { value?: string; onChange: (dataUrl?: string) => void }) {
  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await resp.json();
    onChange(data.url);
  }
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full h-32 md:h-44 rounded-2xl overflow-hidden bg-black/10 ring-2 ring-primary/30 shadow mb-2 flex items-center justify-center">
        {value ? (
          <img src={value} alt="banner" className="w-full h-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-xs text-gray-500">Banner</div>
        )}
      </div>
      <div className="flex gap-2">
        <label className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-xl hover:bg-accent transition cursor-pointer shadow">
          Încarcă banner
          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm underline underline-offset-4 decoration-primary hover:text-primary"
          >
            Elimină
          </button>
        )}
      </div>
    </div>
  );
}