"use client";
import { useEffect, useState } from "react";

type Opportunity = {
  id: number;
  title: string;
  deadline: string;
  type: string;
  skills: string[];
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
    skills: ""
  });

  // Pentru modal editare
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    deadline: "",
    type: "",
    skills: ""
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
        skills: form.skills.split(",").map(s => s.trim())
      }),
    })
      .then(res => res.json())
      .then(data => {
        setOpportunities(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
        setShowForm(false);
        setForm({ title: "", deadline: "", type: "", skills: "" });
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
      skills: Array.isArray(opp.skills) ? opp.skills.join(", ") : ""
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Oportunități active</h1>
        <button
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition shadow"
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
            <h2 className="font-bold text-lg">Adaugă oportunitate</h2>
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
            <h2 className="font-bold text-lg">Editează oportunitate</h2>
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

      {loading ? (
        <div className="text-gray-500 py-4">Se încarcă...</div>
      ) : (
        <ul className="space-y-2">
          {Array.isArray(opportunities) && opportunities.length > 0 ? (
            opportunities.map((opp) => (
              <li
                key={opp.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <div className="font-bold">{opp.title}</div>
                  <div className="text-xs text-gray-500">
                    Deadline: {opp.deadline}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tip: {opp.type}
                  </div>
                  <div className="text-xs text-gray-500">
                    Skilluri: {Array.isArray(opp.skills) ? opp.skills.join(", ") : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-sm underline text-accent"
                    onClick={() => openEditModal(opp)}
                  >
                    Editează
                  </button>
                  <button
                    className="text-sm underline text-red-600"
                    onClick={() => handleDelete(opp.id)}
                  >
                    Șterge
                  </button>
                </div>
              </li>
            ))
          ) : (
            <div className="text-gray-500 py-4">
              Nicio oportunitate activă sau nu ai acces.
            </div>
          )}
        </ul>
      )}
    </div>
  );
}