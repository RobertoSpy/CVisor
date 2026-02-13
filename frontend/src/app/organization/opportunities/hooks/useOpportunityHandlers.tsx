import { Opportunity } from "../types";
import toast from "react-hot-toast";

// Toate funcțiile de handler pentru OpportunitiesPage
export function useOpportunityHandlers({
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
}: {
  setForm: any,
  setBannerFile: any,
  setPromoFile: any,
  setShowForm: any,
  setOpportunities: any,
  setEditForm: any,
  setEditId: any,
  setEditBannerFile: any,
  setEditPromoFile: any,
  form: any,
  bannerFile: any,
  promoFile: any,
  editForm: any,
  editId: any,
}) {

  // Pentru banner - adăugare
  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDARE IMAGINE
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format nedorit! Te rugăm să încarci o imagine (JPG, PNG, WEBP).");
      // Reset input value if needed, but since we rely on file obj, just return
      e.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then((data) => {
        setForm((f: any) => ({ ...f, banner_image: data.url }));
        toast.success("Banner încărcat!");
      })
      .catch(() => {
        toast.error("Eroare la încărcare banner");
      });
  }

  // Pentru video promo - adăugare
  function handlePromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDARE VIDEO
    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format nedorit! Te rugăm să încarci un video (MP4, WEBM).");
      e.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then((data) => {
        setForm((f: any) => ({ ...f, promo_video: data.url }));
        toast.success("Video încărcat!");
      })
      .catch(() => {
        toast.error("Eroare la încărcare video");
      });
  }



  // Adăugare oportunitate
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // VALIDARE: Deadline nu poate fi în trecut
    const deadlineDate = new Date(form.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      toast.error("Deadline-ul nu poate fi în trecut! Te rugăm să alegi o dată din viitor.");
      return;
    }

    const payload = {
      ...form,
      skills: form.skills
        ? form.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s)
        : [],
      tags: form.tags
        ? form.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t)
        : [],
      agenda: form.agenda && typeof form.agenda === "string" ? { text: form.agenda } : form.agenda || {},
      faq: form.faq && typeof form.faq === "string" ? [{ text: form.faq }] : form.faq || [],
      participants: [],
    };

    fetch("/api/organizations/opportunities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare la creare");
        return res.json();
      })
      .then((data) => {
        if (data.pointsAdded) {
          toast.success(`Felicitări! Ai primit ${data.pointsAdded} puncte pentru crearea oportunității! 🌟`, {
            duration: 5000,
            icon: '🚀',
          });
        } else {
          toast.success("Oportunitate creată cu succes!");
        }

        // RESET
        setForm({
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
          cta_url: form.cta_url || "",
        });
        setBannerFile(null);
        setPromoFile(null);
        setShowForm(false);
        // Refresh list
        setOpportunities((prev: any) => [...prev, data.opportunity || data]);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Eroare la creare oportunitate");
      });
  }

  // Pentru banner - editare
  function handleEditBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDARE IMAGINE
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format nedorit! Te rugăm să încarci o imagine validă.");
      e.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then((data) => {
        setEditForm((f: any) => ({ ...f, banner_image: data.url }));
        toast.success("Banner actualizat!");
      })
      .catch(() => toast.error("Eroare upload banner"));
  }

  // Pentru promo video - editare
  function handleEditPromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDARE VIDEO
    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format nedorit! Te rugăm să încarci un video valid.");
      e.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then((data) => {
        setEditForm((f: any) => ({ ...f, promo_video: data.url }));
        toast.success("Video actualizat!");
      })
      .catch(() => toast.error("Eroare upload video"));
  }

  // Editare oportunitate
  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;

    // VALIDARE: Deadline nu poate fi în trecut
    const deadlineDate = new Date(editForm.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      toast.error("Deadline-ul nu poate fi în trecut! Te rugăm să alegi o dată din viitor.");
      return;
    }

    const payload = {
      ...editForm,
      skills: editForm.skills
        ? editForm.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s)
        : [],
      tags: editForm.tags
        ? editForm.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t)
        : [],
      agenda: editForm.agenda && typeof editForm.agenda === "string"
        ? { text: editForm.agenda }
        : editForm.agenda || {},
      faq: editForm.faq && typeof editForm.faq === "string"
        ? editForm.faq.split("\n").map((text: string) => ({ text }))
        : editForm.faq || [],
      mentors: editForm.mentors && typeof editForm.mentors === "string"
        ? JSON.parse(editForm.mentors)
        : editForm.mentors || [],
    };

    fetch(`/api/organizations/opportunities/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare la editare");
        return res.json();
      })
      .then((data) => {
        toast.success("Oportunitate actualizată!");
        setEditId(null);
        setEditForm({
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
          cta_url: form.cta_url || "",
        });
        setEditBannerFile(null);
        setEditPromoFile(null);

        // Update list
        setOpportunities((prev: any[]) => prev.map(o => o.id === editId ? (data.opportunity || data) : o));
      })
      .catch((err) => {
        console.error(err);
        toast.error("Eroare la actualizare");
      });
  }

  // Ștergere oportunitate
  function handleDelete(id: string) {
    if (!confirm("Sigur vrei să ștergi această oportunitate?")) return;
    fetch(`/api/organizations/opportunities/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare la ștergere");
        setOpportunities((prev: any[]) => prev.filter((o) => o.id !== id));
        toast.success("Oportunitate ștearsă");
      })
      .catch(() => toast.error("Eroare la ștergere"));
  }

  // Deschide modal editare
  function openEditModal(opp: Opportunity) {
    setEditId(opp.id);
    // Convertim deadline la formatul YYYY-MM-DD
    let deadlineValue = "";
    if (opp.deadline) {
      const d = new Date(opp.deadline);
      if (!isNaN(d.getTime())) {
        deadlineValue = d.toISOString().slice(0, 10);
      } else {
        deadlineValue = opp.deadline;
      }
    }
    setEditForm({
      title: opp.title || "",
      deadline: deadlineValue,
      type: opp.type || "",
      skills: Array.isArray(opp.skills) ? opp.skills.join(", ") : (opp.skills || ""),
      available_spots: opp.available_spots?.toString() ?? "",
      price: opp.price?.toString() ?? "",
      location: opp.location ?? "",
      // [FIX] Populate missing fields
      description: opp.description || "",
      banner_image: opp.banner_image || "",
      promo_video: opp.promo_video || "",
      tags: Array.isArray(opp.tags) ? opp.tags.join(", ") : (opp.tags || ""),
      cta_url: opp.cta_url || "",

      // Complex objects
      agenda: typeof opp.agenda === 'object' ? ((opp.agenda as any)?.text || "") : (opp.agenda || ""),
      faq: Array.isArray(opp.faq)
        ? opp.faq.map((f: any) => f.text).join("\n")
        : (typeof opp.faq === 'string' ? opp.faq : ""),
    });
    setEditBannerFile(null);
    setEditPromoFile(null);
  }

  return {
    handleBannerChange,
    handlePromoChange,
    handleSubmit,
    handleEditBannerChange,
    handleEditPromoChange,
    handleEditSubmit,
    handleDelete,
    openEditModal,
  };
}