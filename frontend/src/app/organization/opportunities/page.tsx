"use client";
import { useEffect, useState } from "react";
import OpportunityGrid from "./OpportunityGrid";
import { Opportunity } from "./types";
import { useOpportunityHandlers } from "./hooks/useOpportunityHandlers";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"party" | "self-development" | null>(null);


  // Modal adaugare
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    deadline: "",
    type: "",
    skills: "",
    available_spots: "",
    price: "",
    location: "",
    description: "",
    banner_image: "",
    promo_video: "",
    gallery: "",
    tags: "",
    agenda: "",
    faq: "",
    reviews: "",
    cta_url: "",
  });

  // Modal editare
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    deadline: "",
    type: "",
    skills: "",
    available_spots: "",
    price: "",
    location: "",
    description: "",
    banner_image: "",
    promo_video: "",
    gallery: "",
    tags: "",
    agenda: "",
    faq: "",

    cta_url: "",
  });

  // Fișiere
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editPromoFile, setEditPromoFile] = useState<File | null>(null);

  // Custom hook pentru funcții
  const {
    handleBannerChange,
    handlePromoChange,
    handleSubmit,
    handleEditBannerChange,
    handleEditPromoChange,
    handleEditSubmit,
    handleDelete,
    openEditModal,
  } = useOpportunityHandlers({
    setForm,
    setBannerFile,
    setPromoFile,
    setShowForm,
    setOpportunities,
    setEditForm,
    setEditId,
    setEditBannerFile,
    setEditPromoFile,
    form,
    bannerFile,
    promoFile,
    editForm,
    editId,
  });



  useEffect(() => {
    fetch("/api/organizations/opportunities", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtrare după tip
  const filteredOpps = selectedType
    ? opportunities.filter(opp => opp.type === selectedType)
    : opportunities;

  return (
    <div className="space-y-8 mt-10">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Oportunitățile Tale
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!selectedType ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              Toate
            </button>
            <button
              onClick={() => setSelectedType("party")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === "party" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              🎉 Party
            </button>
            <button
              onClick={() => setSelectedType("self-development")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === "self-development" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              🧠 Self-dev
            </button>
          </div>

          <button
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition shadow-lg font-semibold flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap"
            onClick={() => setShowForm(true)}
          >
            <span className="text-xl">+</span> Postează
          </button>
        </div>
      </div>



      {/* MODAL ADAUGARE */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => {
            // Închide modalul dacă se dă click pe overlay, nu pe formular
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col gap-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/60 scrollbar-track-gray-100 animate-in fade-in zoom-in duration-200"
          >
            {/* Top: Titlu, Locuri, Deadline */}
            <div className="flex flex-col gap-4 border-b pb-6">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-3xl text-gray-800">Adaugă oportunitate nouă</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Titlu Oportunitate"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="border border-gray-200 p-4 rounded-xl col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white text-lg font-medium"
                  required
                />
                <input
                  type="number"
                  placeholder="Număr locuri disponibile"
                  value={form.available_spots}
                  onChange={e => setForm(f => ({ ...f, available_spots: e.target.value }))}
                  className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white"
                  required min="1"
                />
                <input
                  type="date"
                  placeholder="Deadline"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Banner + Video + Galerie */}
            <div className="flex flex-col gap-4 bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Media & Vizual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Banner (Imagine)</label>
                  <input type="file" accept="image/*" onChange={handleBannerChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Video Promo</label>
                  <input type="file" accept="video/*" onChange={handlePromoChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                  />
                </div>
              </div>
            </div>

            {/* Detalii generale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white"
                required
              >
                <option value="">Alege tipul oportunității</option>
                <option value="party">🎉 Party</option>
                <option value="self-development">🧠 Self-development</option>
              </select>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Preț"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="border border-gray-200 p-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white pl-16"
                  required min="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded text-sm">RON</span>
              </div>
              <input
                type="text"
                placeholder="Locație (ex: București, Online)"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white"
                required
              />
              <input
                type="text"
                placeholder="Tag-uri (separate prin virgulă)"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Descriere, skilluri, agenda, FAQ, reviews */}
            <div className="flex flex-col gap-4">
              <textarea
                placeholder="Descriere detaliată a oportunității..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white min-h-[120px]"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Skilluri dobândite (virgulă)"
                  value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white"
                />
                <textarea
                  placeholder="Agenda evenimentului"
                  value={form.agenda}
                  onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                  className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white min-h-[100px]"
                />
              </div>

              <textarea
                placeholder="FAQ (Întrebări frecvente)"
                value={form.faq}
                onChange={e => setForm(f => ({ ...f, faq: e.target.value }))}
                className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white min-h-[100px]"
              />


              <input
                type="url"
                placeholder="Link extern de înscriere (opțional)"
                value={form.cta_url || ""}
                onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))}
                className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-gray-50 focus:bg-white"
                autoComplete="off"
              />

            </div>

            {/* Butoane */}
            <div className="flex gap-4 justify-end pt-4 border-t mt-2">
              <button type="button" className="text-gray-500 hover:text-gray-800 px-6 py-3 rounded-xl transition font-medium" onClick={() => setShowForm(false)}>
                Anulează
              </button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition font-bold transform hover:-translate-y-0.5">
                Postează Oportunitatea
              </button>
            </div>
          </form>
        </div >
      )
      }


      {/* MODAL EDITARE */}
      {
        editId && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => {
              if (e.target === e.currentTarget) setEditId(null);
            }}
          >
            <form
              onSubmit={handleEditSubmit}
              className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col gap-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/60 scrollbar-track-gray-100"
            >
              {/* Top: Titlu, Locuri, Deadline */}
              <div className="flex flex-col gap-4 border-b pb-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-2xl text-gray-800">Editează oportunitatea</h2>
                  <button type="button" onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Titlu"
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="border border-gray-200 p-3 rounded-xl col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Număr locuri"
                    value={editForm.available_spots}
                    onChange={e => setEditForm(f => ({ ...f, available_spots: e.target.value }))}
                    className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required min="1"
                  />
                  <input
                    type="date"
                    placeholder="Deadline"
                    value={editForm.deadline}
                    onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
                    className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
              </div>

              {/* Banner + Video + Galerie */}
              <div className="flex flex-col gap-3 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <label className="font-semibold text-blue-900 text-sm">Banner imagine</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditBannerFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                />
                <label className="font-semibold text-blue-900 text-sm mt-2">Video promo</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => setEditPromoFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                />
              </div>

              {/* Detalii generale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={editForm.type}
                  onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                >
                  <option value="">Alege tipul oportunității</option>
                  <option value="party">🎉 Party</option>
                  <option value="self-development">🧠 Self-development</option>
                </select>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Preț"
                    value={editForm.price}
                    onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    className="border border-gray-200 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 pl-16"
                    required min="0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded text-xs">RON</span>
                </div>
                <input
                  type="text"
                  placeholder="Locație"
                  value={editForm.location}
                  onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Tag-uri (virgulă)"
                  value={editForm.tags}
                  onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />

                <input
                  type="url"
                  placeholder="Link extern de înscriere (opțional)"
                  value={editForm.cta_url || ""}
                  onChange={e => setEditForm(f => ({ ...f, cta_url: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  autoComplete="off"
                />
              </div>

              {/* Descriere, skilluri, agenda, FAQ, reviews */}
              <div className="flex flex-col gap-3">
                <textarea
                  placeholder="Descriere"
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                  required
                />
                <input
                  type="text"
                  placeholder="Skilluri (virgulă)"
                  value={editForm.skills}
                  onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <textarea
                  placeholder="Agenda"
                  value={editForm.agenda}
                  onChange={e => setEditForm(f => ({ ...f, agenda: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                />
                <textarea
                  placeholder="FAQ"
                  value={editForm.faq}
                  onChange={e => setEditForm(f => ({ ...f, faq: e.target.value }))}
                  className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                />
              </div>

              {/* Butoane */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button type="button" className="text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg transition" onClick={() => setEditId(null)}>
                  Anulează
                </button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow">
                  Salvează Modificările
                </button>
              </div>
            </form>
          </div>
        )
      }

      <OpportunityGrid
        opportunities={filteredOpps}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />
    </div >
  );
}
