import { Opportunity } from "../types";
import toast from "react-hot-toast";

// Toate funcțiile de handler pentru OpportunitiesPage
export function useOpportunityHandlers({
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
  form,
  bannerFile,
  promoFile,
  galleryFiles,
  editForm,
  editId,
}: {
  setForm: any,
  setBannerFile: any,
  setPromoFile: any,
  setGalleryFiles: any,
  setShowForm: any,
  setOpportunities: any,
  setEditForm: any,
  setEditId: any,
  setEditBannerFile: any,
  setEditPromoFile: any,
  setEditGalleryFiles: any,
  form: any,
  bannerFile: any,
  promoFile: any,
  galleryFiles: any,
  editForm: any,
  editId: any,
}) {


  // Pentru banner - adăugare
  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setForm((f: any) => ({ ...f, banner_image: data.url }));
      });
  }

  // Pentru video promo - adăugare
  function handlePromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setForm((f: any) => ({ ...f, promo_video: data.url }));
      });
  }

  // Pentru galerie (multiple files) - adăugare
  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    Promise.all(
      files.map((file) => {
        const data = new FormData();
        data.append("file", file);
        return fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: data,
        })
          .then((res) => res.json())
          .then((data) => data.url);
      })
    ).then((urls) => {
      setForm((f: any) => ({ ...f, gallery: urls }));
    });
  }

  // Adăugare oportunitate
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...form,
      skills: form.skills
        ? form.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s)
        : [],
      tags: form.tags
        ? form.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t)
        : [],
      gallery: form.gallery
        ? Array.isArray(form.gallery)
          ? form.gallery
          : typeof form.gallery === "string"
            ? form.gallery.split(",").map((u: string) => u.trim()).filter((u: string) => u)
            : []
        : [],
      agenda: form.agenda && typeof form.agenda === "string" ? { text: form.agenda } : form.agenda || {},
      faq: form.faq && typeof form.faq === "string" ? [{ text: form.faq }] : form.faq || [],
      reviews: form.reviews && typeof form.reviews === "string" ? [{ text: form.reviews }] : form.reviews || [],
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
          gallery: "",
          tags: "",
          agenda: "",
          faq: "",
          reviews: "",
          cta_url: form.cta_url || "",
        });
        setBannerFile(null);
        setPromoFile(null);
        setGalleryFiles([]);
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
    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setEditForm((f: any) => ({ ...f, banner_image: data.url }));
      });
  }

  // Pentru promo video - editare
  function handleEditPromoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setEditForm((f: any) => ({ ...f, promo_video: data.url }));
      });
  }

  // Pentru galerie - editare
  function handleEditGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    Promise.all(
      files.map((file) => {
        const data = new FormData();
        data.append("file", file);
        return fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: data,
        })
          .then((res) => res.json())
          .then((data) => data.url);
      })
    ).then((urls) => {
      setEditForm((f: any) => ({
        ...f,
        gallery: Array.isArray(f.gallery)
          ? [...f.gallery, ...urls]
          : (typeof f.gallery === "string" && f.gallery.length > 0)
            ? [...f.gallery.split(",").map((u: string) => u.trim()), ...urls]
            : urls,
      }));
    });
  }

  // Editare oportunitate
  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;

    const payload = {
      ...editForm,
      skills: editForm.skills
        ? editForm.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s)
        : [],
      tags: editForm.tags
        ? editForm.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t)
        : [],
      gallery: Array.isArray(editForm.gallery)
        ? editForm.gallery
        : (typeof editForm.gallery === "string" && editForm.gallery.length > 0)
          ? editForm.gallery.split(",").map((u: string) => u.trim()).filter((u: string) => u)
          : [],
      agenda: editForm.agenda && typeof editForm.agenda === "string"
        ? { text: editForm.agenda }
        : editForm.agenda || {},
      faq: editForm.faq && typeof editForm.faq === "string"
        ? editForm.faq.split("\n").map((text: string) => ({ text }))
        : editForm.faq || [],
      reviews: editForm.reviews && typeof editForm.reviews === "string"
        ? editForm.reviews.split("\n").map((text: string) => ({ text }))
        : editForm.reviews || [],
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
          gallery: "",
          tags: "",
          agenda: "",
          faq: "",
          reviews: "",
          cta_url: form.cta_url || "",
        });
        setEditBannerFile(null);
        setEditPromoFile(null);
        setEditGalleryFiles([]);

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
      faq: Array.isArray(opp.faq)
        ? opp.faq.map((f: any) => f.text).join("\n")
        : (opp.faq || ""),
      reviews: Array.isArray(opp.reviews)
        ? opp.reviews.map((r: any) => r.text).join("\n")
        : (opp.reviews || ""),
    });
    setEditBannerFile(null);
    setEditPromoFile(null);
    setEditGalleryFiles([]);
  }

  return {
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
  };
}