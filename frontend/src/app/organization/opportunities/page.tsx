"use client";
import { useEffect, useState } from "react";
import OpportunityGrid from "./OpportunityGrid";
import { Opportunity } from "./types";
import { useOpportunityHandlers } from "./hooks/useOpportunityHandlers";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    reviews: "",
  });

  // Fișiere
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editPromoFile, setEditPromoFile] = useState<File | null>(null);
  const [editGalleryFiles, setEditGalleryFiles] = useState<File[]>([]);

  // Custom hook pentru funcții
  const {
    handleBannerChange,
    handlePromoChange,
    handleGalleryChange,
    handleSubmit,
    handleEditBannerChange,
    handleEditPromoChange,
    handleEditGalleryChange,
    handleEditSubmit,
    handleDelete,
    openEditModal,
  } = useOpportunityHandlers({
    setForm,
    setBannerFile,
    setPromoFile,
    setGalleryFiles,
    setShowForm,
    setOpportunities,
    setEditForm,
    setEditId,
    setEditBannerFile,
    setEditPromoFile,
    setEditGalleryFiles,
    API_URL,
    form,
    bannerFile,
    promoFile,
    galleryFiles,
    editForm,
    editId,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/organizations/opportunities", {
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  
  return (
    <div className="space-y-8 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Oportunități active</h1>
        <button
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-accent transition shadow"
          onClick={() => setShowForm(true)}
        >
          Postează oportunitate nouă
        </button>
      </div>

      {/* MODAL ADAUGARE */}
     {showForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-8 shadow-2xl flex flex-col gap-7 min-w-[350px] w-full max-w-xl"
    >
      {/* Top: Titlu, Locuri, Deadline */}
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl text-primary mb-1">Adaugă oportunitate nouă</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Titlu"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="border p-2 rounded col-span-2"
            required
          />
          <input
            type="number"
            placeholder="Număr locuri"
            value={form.available_spots}
            onChange={e => setForm(f => ({ ...f, available_spots: e.target.value }))}
            className="border p-2 rounded"
            required min="1"
          />
          <input
            type="date"
            placeholder="Deadline"
            value={form.deadline}
            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            className="border p-2 rounded"
            required
          />
        </div>
      </div>

      {/* Banner + Video + Galerie */}
      <div className="flex flex-col gap-3 bg-gray-50 rounded-lg p-4">
        <label className="font-semibold text-primary">Banner imagine</label>
        <input type="file" accept="image/*" onChange={handleBannerChange} 
          className="border p-2 rounded bg-white"
        />
        <label className="font-semibold text-primary mt-2">Video promo</label>
        <input type="file" accept="video/*" onChange={handlePromoChange} 
          className="border p-2 rounded bg-white"
        />
        <label className="font-semibold text-primary mt-2">Galerie imagini</label>
       <input type="file" accept="image/*" onChange={handleGalleryChange} 
          className="border p-2 rounded bg-white"
        />
      </div>

      {/* Detalii generale */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Tip oportunitate"
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Preț (RON)"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          className="border p-2 rounded"
          required min="0"
        />
        <input
          type="text"
          placeholder="Locație"
          value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Tag-uri (virgulă)"
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          className="border p-2 rounded"
        />
      </div>
      
      {/* Descriere, skilluri, agenda, FAQ, reviews */}
      <div className="flex flex-col gap-2">
        <textarea
          placeholder="Descriere"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Skilluri (virgulă)"
          value={form.skills}
          onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Agenda"
          value={form.agenda}
          onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="FAQ"
          value={form.faq}
          onChange={e => setForm(f => ({ ...f, faq: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Reviews"
          value={form.reviews}
          onChange={e => setForm(f => ({ ...f, reviews: e.target.value }))}
          className="border p-2 rounded"
        />
      </div>

      {/* Butoane */}
      <div className="flex gap-2 justify-end pt-4">
        <button type="button" className="text-gray-500" onClick={() => setShowForm(false)}>
          Anulează
        </button>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">
          Postează
        </button>
      </div>
    </form>
  </div>
)}


      {/* MODAL EDITARE */}
   {editId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <form
      onSubmit={handleEditSubmit}
      className="bg-white rounded-xl p-8 shadow-2xl flex flex-col gap-7 min-w-[350px] w-full max-w-xl"
    >
      {/* Top: Titlu, Locuri, Deadline */}
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl text-primary mb-1">Editează oportunitatea</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Titlu"
            value={editForm.title}
            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            className="border p-2 rounded col-span-2"
            required
          />
          <input
            type="number"
            placeholder="Număr locuri"
            value={editForm.available_spots}
            onChange={e => setEditForm(f => ({ ...f, available_spots: e.target.value }))}
            className="border p-2 rounded"
            required min="1"
          />
          <input
            type="date"
            placeholder="Deadline"
            value={editForm.deadline}
            onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
            className="border p-2 rounded"
            required
          />
        </div>
      </div>

      {/* Banner + Video + Galerie */}
      <div className="flex flex-col gap-3 bg-gray-50 rounded-lg p-4">
        <label className="font-semibold text-primary">Banner imagine</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setEditBannerFile(e.target.files?.[0] || null)}
          className="border p-2 rounded bg-white"
        />
        <label className="font-semibold text-primary mt-2">Video promo</label>
        <input
          type="file"
          accept="video/*"
          onChange={e => setEditPromoFile(e.target.files?.[0] || null)}
          className="border p-2 rounded bg-white"
        />
        <label className="font-semibold text-primary mt-2">Galerie imagini</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setEditGalleryFiles([...e.target.files])}
          className="border p-2 rounded bg-white"
        />
      </div>

      {/* Detalii generale */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Tip oportunitate"
          value={editForm.type}
          onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Preț (RON)"
          value={editForm.price}
          onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
          className="border p-2 rounded"
          required min="0"
        />
        <input
          type="text"
          placeholder="Locație"
          value={editForm.location}
          onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Tag-uri (virgulă)"
          value={editForm.tags}
          onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
          className="border p-2 rounded"
        />
      </div>
      
      {/* Descriere, skilluri, agenda, FAQ, reviews */}
      <div className="flex flex-col gap-2">
        <textarea
          placeholder="Descriere"
          value={editForm.description}
          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Skilluri (virgulă)"
          value={editForm.skills}
          onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Agenda"
          value={editForm.agenda}
          onChange={e => setEditForm(f => ({ ...f, agenda: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="FAQ"
          value={editForm.faq}
          onChange={e => setEditForm(f => ({ ...f, faq: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Reviews"
          value={editForm.reviews}
          onChange={e => setEditForm(f => ({ ...f, reviews: e.target.value }))}
          className="border p-2 rounded"
        />
      </div>

      {/* Butoane */}
      <div className="flex gap-2 justify-end pt-4">
        <button type="button" className="text-gray-500" onClick={() => setEditId(null)}>
          Anulează
        </button>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">
          Salvează
        </button>
      </div>
    </form>
  </div>
)}

    <OpportunityGrid
        opportunities={opportunities}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />
      </div>
  );
}
