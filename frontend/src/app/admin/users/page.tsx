"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ApiClient from "../../../lib/api/client";
import StudentProfilePreview from "../../student/profile/StudentProfilePreview";
import OrganizationProfilePreview from "../../organization/profile/OrganizationProfilePreview";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Warning Modal State
  const [warningUser, setWarningUser] = useState<{ id: number, name: string } | null>(null);
  const [profileUser, setProfileUser] = useState<{ id: number, name: string, role: string } | null>(null);

  useEffect(() => {
    fetchUsers(filter);
  }, [filter]);

  async function fetchUsers(roleFilter: string) {
    setLoading(true);
    try {
      const qs = roleFilter ? `?role=${roleFilter}` : "";
      const res = await ApiClient.get<User[]>(`/api/admin/users${qs}`);
      setUsers(res);
    } catch (err: any) {
      toast.error(err.message || "Eroare la preluarea utilizatorilor");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Sigur dorești să ștergi contul ${name}? ACEASTĂ ACȚIUNE ESTE IREVOCABILĂ!`)) {
      return;
    }
    const t = toast.loading("Se șterge...");
    try {
      await ApiClient.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Utilizator șters cu succes!", { id: t });
    } catch (err: any) {
      toast.error(err.message || "Eroare la ștergere", { id: t });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gestionare Utilizatori</h1>
          <p className="text-sm text-gray-500">Vizualizează, filtrează și șterge conturi CVISOR.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="w-full md:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Toate Rolurile</option>
            <option value="student">Student</option>
            <option value="organization">Organizație</option>
            <option value="admin">Administrator</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
          >
            + Creare Organizație
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Se încarcă lista de utilizatori...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Niciun utilizator găsit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Nume</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Creat la</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{u.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 bg-opacity-10 rounded-full text-xs font-bold uppercase tracking-wide
                        ${u.role === "student" ? "bg-blue-500 text-blue-700"
                          : u.role === "organization" ? "bg-green-500 text-green-700"
                            : "bg-red-500 text-red-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString("ro-RO", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      {/* View Profile Button based on role */}
                      {u.role !== 'admin' && (
                        <button onClick={() => setProfileUser({ id: u.id, name: u.full_name, role: u.role })} className="text-blue-500 hover:bg-blue-50 px-3 py-1 rounded transition text-xs font-semibold">
                          Profil
                        </button>
                      )}

                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => setWarningUser({ id: u.id, name: u.full_name })}
                            className="text-orange-500 hover:bg-orange-50 px-3 py-1 rounded transition text-xs font-semibold"
                          >
                            Avertisment
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.full_name)}
                            className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition text-xs font-semibold"
                          >
                            Șterge
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateOrgModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchUsers(filter); // Re-fetch
          }}
        />
      )}

      {warningUser && (
        <WarningModal
          user={warningUser}
          onClose={() => setWarningUser(null)}
        />
      )}

      {profileUser && (
        <FullProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
        />
      )}
    </div>
  );
}

function CreateOrgModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const t = toast.loading("Se creează contul...");
    try {
      await ApiClient.post("/api/admin/users/organization", formData);
      toast.success("Organizație creată!", { id: t });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Eroare la creare", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Creare Organizație</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nume Organizație</label>
            <input
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Autentificare</label>
            <input
              required
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parolă</label>
            <input
              required
              type="password"
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Anulare</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50">
              Creare Cont
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WarningModal({ user, onClose }: { user: { id: number, name: string }, onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 5) {
      toast.error("Motivul trebuie să fie mai lung de 5 caractere.");
      return;
    }

    setIsSubmitting(true);
    const t = toast.loading("Se trimite avertismentul...");
    try {
      await ApiClient.post(`/api/admin/users/${user.id}/warn`, { reason });
      toast.success("Email-ul a fost trimis cu succes!", { id: t });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Eroare la trimiterea avertismentului", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50">
          <h2 className="text-xl font-bold text-orange-800">Avertisment Oficial</h2>
          <button onClick={onClose} className="text-orange-400 hover:text-orange-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-sm text-gray-600 mb-2">
            Vei trimite un email oficial către <strong>{user.name}</strong>. Acest email îl informează despre încălcarea termenilor sau regulamentului CVISOR.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivul Avertizării</label>
            <textarea
              required
              rows={4}
              placeholder="Descrie în detaliu problema... (ex: Limbaj neadecvat, profil fals, SPAM)"
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none bg-orange-50/30"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 rounded-b-xl border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium">Anulează</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-600/30 transition-all font-bold disabled:opacity-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              Trimite Avertisment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Full Profile Modal — uses real StudentProfilePreview / OrganizationProfilePreview ─── */
function FullProfileModal({ user, onClose }: { user: { id: number, name: string, role: string }, onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.get<any>(`/api/admin/users/${user.id}/profile`)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user.id]);

  // Transform org data for OrganizationProfilePreview
  function buildOrgProfile(pd: any) {
    return {
      name: pd.name ?? "",
      headline: pd.headline ?? "",
      bio: pd.bio ?? "",
      avatarUrl: pd.avatar_url ?? pd.avatarUrl ?? "",
      bannerUrl: pd.banner_url ?? pd.bannerUrl ?? "",
      history: pd.history ?? "",
      videoUrl: pd.video_url ?? pd.videoUrl ?? "",
      location: pd.location ?? "",
      volunteers: pd.volunteers ?? 0,
      social: pd.social ?? [],
      events: pd.events ?? [],
      keyPeople: pd.key_people ?? pd.keyPeople ?? [],
      contactPersons: pd.contact_persons ?? pd.contactPersons ?? [],
      media: pd.media ?? [],
    };
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl my-6 mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-red-600 text-xl transition-all"
        >
          ✕
        </button>

        {/* Admin info bar */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 flex items-center gap-3">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
            Admin View
          </span>
          <span className="text-white/80 text-sm">
            {user.name} • {user.role === 'student' ? 'Student' : 'Organizație'}
          </span>
        </div>

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : !data?.profileData ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium">Profilul nu a fost completat încă.</p>
              <p className="text-sm mt-1">Utilizatorul nu și-a configurat profilul.</p>
            </div>
          ) : data.role === 'student' ? (
            <StudentProfilePreview
              profile={data.profileData}
              points={data.profileData.points || 0}
              badges={data.profileData.badges || []}
            />
          ) : data.role === 'organization' ? (
            <OrganizationProfilePreview
              profile={buildOrgProfile(data.profileData)}
              opportunities={data.profileData.opportunities || []}
              isOwner={false}
              points={data.profileData.points || 0}
              badges={data.profileData.badges || []}
            />
          ) : (
            <div className="text-center py-20 text-gray-500">Rol necunoscut.</div>
          )}
        </div>
      </div>
    </div>
  );
}
