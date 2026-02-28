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
    tags: "",
    agenda: "",
    faq: "",
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



  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/organizations/opportunities?status=${statusFilter}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  // Filtrare după tip
  const filteredOpps = selectedType
    ? opportunities.filter(opp => opp.type === selectedType)
    : opportunities;

  return (
    <div className="space-y-8 mt-10">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Oportunități
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Gestionează și promovează oportunitățile tale.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          {/* Status Toggles - Modern Tabs */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("active")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${statusFilter === "active" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("archived")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${statusFilter === "archived" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              Arhivă
            </button>
          </div>

          {/* Category Filter - Modern Pills */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedType(null)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${!selectedType ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              Toate
            </button>
            <button
              onClick={() => setSelectedType("party")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedType === "party" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              🎉 Party
            </button>
            <button
              onClick={() => setSelectedType("self-development")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedType === "self-development" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              🧠 Self-dev
            </button>
          </div>

          <button
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 font-bold flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            onClick={() => setShowForm(true)}
          >
            <span className="text-xl leading-none">+</span> Postează
          </button>
        </div>
      </div>



      {/* MODAL ADAUGARE - PREMIUM DESIGN */}
      {showForm && (
        <div
          className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="font-extrabold text-3xl text-gray-900 tracking-tight">Postează Oportunitate</h2>
                <p className="text-gray-500 font-medium mt-1">Completează detaliile pentru a atrage cei mai buni studenți.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

              {/* 1. Basic Info */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center text-sm">01</span>
                  Detalii Principale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Titlu Oportunitate</label>
                    <input
                      type="text"
                      placeholder="ex: Internship Front-End Development"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-5 text-lg font-semibold focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 hover:bg-gray-100/80"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Locuri Disponibile</label>
                    <input
                      type="number"
                      placeholder="ex: 5"
                      value={form.available_spots}
                      onChange={e => setForm(f => ({ ...f, available_spots: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-blue-500 transition-all hover:bg-gray-100/80"
                      required min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Deadline Aplicare</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-blue-500 transition-all hover:bg-gray-100/80"
                      required
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 2. Media */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-100/50 text-purple-600 flex items-center justify-center text-sm">02</span>
                  Vizual & Media
                </h3>
                <div className="bg-purple-50/30 border border-purple-100 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-purple-900 mb-3">Banner Imagine</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center bg-white/50 group-hover:bg-white group-hover:border-purple-400 transition-all">
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="text-sm font-semibold text-purple-800">{bannerFile ? bannerFile.name : "Alege sau trage o imagine"}</p>
                        <p className="text-xs text-purple-400 mt-1">PNG, JPG pana la 5MB</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-purple-900 mb-3">Video Promo</label>
                    <div className="relative group">
                      <input type="file" accept="video/*" onChange={handlePromoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center bg-white/50 group-hover:bg-white group-hover:border-purple-400 transition-all">
                        <div className="text-3xl mb-2">🎥</div>
                        <p className="text-sm font-semibold text-purple-800">{promoFile ? promoFile.name : "Alege sau trage un video"}</p>
                        <p className="text-xs text-purple-400 mt-1">MP4, WebM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 3. Specifics */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-100/50 text-green-600 flex items-center justify-center text-sm">03</span>
                  Detalii Specifice
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80"
                    required
                  >
                    <option value="">Tip Oportunitate</option>
                    <option value="party">🎉 Party / Event</option>
                    <option value="self-development">🧠 Self-Development / Workshop</option>
                  </select>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Preț"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80 pl-16 text-lg"
                      required min="0"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold bg-white px-2 py-1 rounded text-xs shadow-sm">RON</span>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <input
                      type="text"
                      placeholder="Locație (ex: București, Online)"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80"
                      required
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <input
                      type="text"
                      placeholder="Tag-uri (separate prin virgulă)"
                      value={form.tags}
                      onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 4. Content */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100/50 text-orange-600 flex items-center justify-center text-sm">04</span>
                  Conținut & Info
                </h3>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descriere Detaliată</label>
                  <textarea
                    placeholder="Descrie oportunitatea în detaliu..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-5 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80 min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <textarea
                    placeholder="Agenda (Markdown supportat)"
                    value={form.agenda}
                    onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80 min-h-[100px]"
                  />
                  <textarea
                    placeholder="FAQ - Întrebări Frecvente"
                    value={form.faq}
                    onChange={e => setForm(f => ({ ...f, faq: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Link Extern (Opțional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.cta_url || ""}
                    onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80"
                    autoComplete="off"
                  />
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 rounded-b-[2.5rem]">
              <button type="button" className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-2xl transition font-bold" onClick={() => setShowForm(false)}>
                Anulează
              </button>
              <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:bg-blue-700 transition-all font-bold transform hover:-translate-y-1">
                Postează Oportunitatea
              </button>
            </div>
          </form>
        </div >
      )
      }


      {/* MODAL EDITARE */}
      {editId && (
        <div
          className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setEditId(null);
          }}
        >
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="font-extrabold text-3xl text-gray-900 tracking-tight">Editează Oportunitatea</h2>
                <p className="text-gray-500 font-medium mt-1">Modifică detaliile pentru a menține informațiile actualizate.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

              {/* 1. Basic Info */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center text-sm">01</span>
                  Detalii Principale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Titlu Oportunitate</label>
                    <input
                      type="text"
                      placeholder="ex: Internship Front-End Development"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-5 text-lg font-semibold focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 hover:bg-gray-100/80"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Locuri Disponibile</label>
                    <input
                      type="number"
                      placeholder="ex: 5"
                      value={editForm.available_spots}
                      onChange={e => setEditForm(f => ({ ...f, available_spots: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-blue-500 transition-all hover:bg-gray-100/80"
                      required min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Deadline Aplicare</label>
                    <input
                      type="date"
                      value={editForm.deadline}
                      onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-blue-500 transition-all hover:bg-gray-100/80"
                      required
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 2. Media */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-100/50 text-purple-600 flex items-center justify-center text-sm">02</span>
                  Vizual & Media
                </h3>
                <div className="bg-purple-50/30 border border-purple-100 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-purple-900 mb-3">Banner Imagine</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={handleEditBannerChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center bg-white/50 group-hover:bg-white group-hover:border-purple-400 transition-all">
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="text-sm font-semibold text-purple-800">
                          {editBannerFile
                            ? editBannerFile.name
                            : (editForm.banner_image ? "Imagine existentă (Schimbă)" : "Alege sau trage o imagine")
                          }
                        </p>
                        <p className="text-xs text-purple-400 mt-1">PNG, JPG pana la 5MB</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-purple-900 mb-3">Video Promo</label>
                    <div className="relative group">
                      <input type="file" accept="video/*" onChange={handleEditPromoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center bg-white/50 group-hover:bg-white group-hover:border-purple-400 transition-all">
                        <div className="text-3xl mb-2">🎥</div>
                        <p className="text-sm font-semibold text-purple-800">
                          {editPromoFile
                            ? editPromoFile.name
                            : (editForm.promo_video ? "Video existent (Schimbă)" : "Alege sau trage un video")
                          }
                        </p>
                        <p className="text-xs text-purple-400 mt-1">MP4, WebM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 3. Specifics */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-100/50 text-green-600 flex items-center justify-center text-sm">03</span>
                  Detalii Specifice
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select
                    value={editForm.type}
                    onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80"
                    required
                  >
                    <option value="">Tip Oportunitate</option>
                    <option value="party">🎉 Party / Event</option>
                    <option value="self-development">🧠 Self-Development / Workshop</option>
                  </select>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Preț"
                      value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80 pl-16 text-lg"
                      required min="0"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold bg-white px-2 py-1 rounded text-xs shadow-sm">RON</span>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <input
                      type="text"
                      placeholder="Locație (ex: București, Online)"
                      value={editForm.location}
                      onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80"
                      required
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <input
                      type="text"
                      placeholder="Tag-uri (separate prin virgulă)"
                      value={editForm.tags}
                      onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                      className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-green-500 transition-all hover:bg-gray-100/80"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 4. Content */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100/50 text-orange-600 flex items-center justify-center text-sm">04</span>
                  Conținut & Info
                </h3>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descriere Detaliată</label>
                  <textarea
                    placeholder="Descrie oportunitatea în detaliu..."
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-5 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80 min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <textarea
                    placeholder="Agenda (Markdown supportat)"
                    value={editForm.agenda}
                    onChange={e => setEditForm(f => ({ ...f, agenda: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80 min-h-[100px]"
                  />
                  <textarea
                    placeholder="FAQ - Întrebări Frecvente"
                    value={editForm.faq}
                    onChange={e => setEditForm(f => ({ ...f, faq: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Link Extern (Opțional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.cta_url || ""}
                    onChange={e => setEditForm(f => ({ ...f, cta_url: e.target.value }))}
                    className="w-full border-0 bg-gray-50 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-orange-500 transition-all hover:bg-gray-100/80"
                    autoComplete="off"
                  />
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 rounded-b-[2.5rem]">
              <button type="button" className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-2xl transition font-bold" onClick={() => setEditId(null)}>
                Anulează
              </button>
              <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:bg-blue-700 transition-all font-bold transform hover:-translate-y-1">
                Salvează Modificările
              </button>
            </div>
          </form>
        </div>
      )}

      <OpportunityGrid
        opportunities={filteredOpps}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />
    </div >
  );
}
