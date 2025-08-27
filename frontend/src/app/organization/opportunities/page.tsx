"use client";
import { useEffect, useState } from "react";

type Opportunity = {
  id: number;
  title: string;
  deadline: string;
  type: string;
  skills: string[];
  spots: number;
  price: number;
  location: string;
  description: string;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Pentru modal adaugare
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    deadline: "",
    type: "",
    skills: "",
    spots: "",
    price: "",
    location: "",
    description: ""
  });

  // Pentru modal editare
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    deadline: "",
    type: "",
    skills: "",
    spots: "",
    price: "",
    location: "",
    description: ""
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

  // Adăugare
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetch("http://localhost:5000/api/organizations/opportunities", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...form,
        spots: Number(form.spots),
        price: Number(form.price),
        location: form.location,
        description: form.description,
        skills: form.skills.split(",").map(s => s.trim())
      }),
    })
      .then(res => res.json())
      .then(data => {
        setOpportunities(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
        setShowForm(false);
        setForm({
          title: "",
          deadline: "",
          type: "",
          skills: "",
          spots: "",
          price: "",
          location: "",
          description: ""
        });
      });
  }

  // Editare
  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    fetch(`http://localhost:5000/api/organizations/opportunities/${editId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...editForm,
        spots: Number(editForm.spots),
        price: Number(editForm.price),
        location: editForm.location,
        description: editForm.description,
        skills: editForm.skills.split(",").map(s => s.trim())
      }),
    })
      .then(res => res.json())
      .then(data => {
        setOpportunities(prev =>
          prev.map(item => item.id === editId ? data : item)
        );
        setEditId(null);
      });
  }

  function handleDelete(id: number) {
    if (!confirm("Sigur vrei să ștergi oportunitatea?")) return;
    fetch(`http://localhost:5000/api/organizations/opportunities/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      }
    })
      .then(res => {
        if (res.ok) {
          setOpportunities(prev => prev.filter(item => item.id !== id));
        }
      });
  }

  function openEditModal(opp: Opportunity) {
    setEditId(opp.id);
    setEditForm({
      title: opp.title,
      deadline: opp.deadline,
      type: opp.type,
      skills: Array.isArray(opp.skills) ? opp.skills.join(", ") : "",
      spots: opp.spots?.toString() ?? "",
      price: opp.price?.toString() ?? "",
      location: opp.location ?? "",
      description: opp.description ?? ""
    });
  }

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
            className="bg-white rounded-xl p-8 shadow-xl flex flex-col gap-4 min-w-[300px]"
          >
            <h2 className="font-bold text-lg text-primary">Adaugă oportunitate</h2>
            <input type="text" placeholder="Titlu"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="date" placeholder="Deadline"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="text" placeholder="Tip oportunitate"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="number" placeholder="Număr locuri"
              value={form.spots}
              onChange={e => setForm(f => ({ ...f, spots: e.target.value }))}
              className="border p-2 rounded" required min="1" />
            <input type="number" placeholder="Preț (RON)"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="border p-2 rounded" required min="0" />
            <input type="text" placeholder="Locație"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="border p-2 rounded" required />
            <textarea placeholder="Descriere"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="text" placeholder="Skilluri (separate prin virgulă)"
              value={form.skills}
              onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
              className="border p-2 rounded" />
            <div className="flex gap-2 justify-end">
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
            className="bg-white rounded-xl p-8 shadow-xl flex flex-col gap-4 min-w-[300px]"
          >
            <h2 className="font-bold text-lg text-primary">Editează oportunitate</h2>
            <input type="text" placeholder="Titlu"
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="date" placeholder="Deadline"
              value={editForm.deadline}
              onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="text" placeholder="Tip oportunitate"
              value={editForm.type}
              onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="number" placeholder="Număr locuri"
              value={editForm.spots}
              onChange={e => setEditForm(f => ({ ...f, spots: e.target.value }))}
              className="border p-2 rounded" required min="1" />
            <input type="number" placeholder="Preț (RON)"
              value={editForm.price}
              onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
              className="border p-2 rounded" required min="0" />
            <input type="text" placeholder="Locație"
              value={editForm.location}
              onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
              className="border p-2 rounded" required />
            <textarea placeholder="Descriere"
              value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              className="border p-2 rounded" required />
            <input type="text" placeholder="Skilluri (separate prin virgulă)"
              value={editForm.skills}
              onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))}
              className="border p-2 rounded" />
            <div className="flex gap-2 justify-end">
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

      {/* GRID OPORTUNITĂȚI */}
      {loading ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <li
              key={i}
              className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] animate-pulse"
            >
              <div className="h-3 w-24 bg-black/10 rounded mb-2" />
              <div className="h-5 w-3/4 bg-black/10 rounded mb-3" />
              <div className="h-3 w-20 bg-black/10 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-black/10 rounded" />
                <div className="h-6 w-20 bg-black/10 rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : Array.isArray(opportunities) && opportunities.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <li
              key={opp.id}
              className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex flex-col justify-between"
            >
              <h3 className="text-lg font-semibold tracking-tight mt-0.5 text-primary">{opp.title}</h3>
              <div className="text-xs mt-1">Tip: <span className="font-medium text-secondary">{opp.type}</span></div>
              <div className="text-xs mt-1 text-gray-600">Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : '-'}</div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {Array.isArray(opp.skills) && opp.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="px-3 py-1 rounded-lg bg-accent text-white hover:bg-primary transition shadow text-sm"
                  onClick={() => openEditModal(opp)}
                >
                  Editează
                </button>
                <button
                  className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow text-sm"
                  onClick={() => handleDelete(opp.id)}
                >
                  Șterge
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-card rounded-2xl p-8 text-center ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
          <h3 className="text-lg font-semibold tracking-tight">Nicio oportunitate activă sau nu ai acces.</h3>
        </div>
      )}
    </div>
  );
}