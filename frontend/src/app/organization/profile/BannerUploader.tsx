import React from "react";
import ApiClient from "../../../lib/api/client";

export default function BannerUploader({ value, onChange }: { value?: string; onChange: (dataUrl?: string) => void }) {
  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await ApiClient.post<{ url?: string }>("/api/upload", formData);
      if (data.url) onChange(data.url);
    } catch (e) { console.error(e); }
  }

  return (
    <div className="group w-full relative">
      <div className="relative w-full h-48 md:h-60 rounded-[2rem] overflow-hidden bg-gray-100 shadow-inner border border-gray-200 group-hover:shadow-md transition-all">
        {value ? (
          <>
            <img src={value} alt="banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-bold border-2 border-white px-4 py-2 rounded-full">Schimbă Bannerul</span>
            </div>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-50/50">
            <span className="text-4xl opacity-50">🖼️</span>
            <span className="font-medium text-sm">Adaugă un Banner de Copertă</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onChange(""); }}
          className="absolute top-4 right-4 z-30 bg-white/40 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md shadow-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Șterge Banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}