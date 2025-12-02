"use client";
import React, { useEffect, useState } from "react";
import OrganizationProfilePreview, { Opportunity } from "../OrganizationProfilePreview";
import toast from "react-hot-toast";

// Tipurile extinse
type KeyPerson = { id?: string; name: string; role: string; responsibilities?: string };
type EventItem = { id?: string; year: string; title: string };
type ContactPerson = { id?: string; name: string; email: string; phone: string };
type SocialPlatform = { id?: string; name: string; url: string };
type Media = { id?: string; kind: "image" | "video"; url: string; caption?: string };

type OrgProfilePayload = {
  name: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  history?: string;
  videoUrl?: string;
  location?: string;
  volunteers?: number;
  social: SocialPlatform[] | Record<string, string>;
  events: EventItem[];
  keyPeople: KeyPerson[];
  contactPersons: ContactPerson[];
  media: Media[];
};

export default function Page() {
  const [profile, setProfile] = useState<OrgProfilePayload | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const resp = await fetch("/api/organizations/users/profile", {
        credentials: "include"
      });
      if (!resp.ok) throw new Error("Nu s-a găsit profilul");
      const data = await resp.json();

      setProfile({
        name: data.name ?? "",
        headline: data.headline ?? "",
        bio: data.bio ?? "",
        avatarUrl: data.avatar_url ?? data.avatarUrl ?? "",
        bannerUrl: data.banner_url ?? data.bannerUrl ?? "",
        history: data.history ?? "",
        videoUrl: data.video_url ?? data.videoUrl ?? "",
        location: data.location ?? "",
        volunteers: data.volunteers ?? 0,
        social: data.social ?? [],
        events: data.events ?? [],
        keyPeople: data.key_people ?? data.keyPeople ?? [],
        contactPersons: data.contact_persons ?? data.contactPersons ?? [],
        media: data.media ?? [],
      });
    } catch (e) {
      setProfile(null);
    }
  };

  const fetchOpportunities = async () => {
    try {
      // Fetch my opportunities (as org owner)
      const resp = await fetch("/api/organizations/opportunities", { credentials: "include" });
      if (resp.ok) {
        const data = await resp.json();
        // Sort: Pinned first
        const sorted = Array.isArray(data) ? data.sort((a: any, b: any) => {
          if (a.is_pinned_on_profile === b.is_pinned_on_profile) return 0;
          return a.is_pinned_on_profile ? -1 : 1;
        }) : [];
        setOpportunities(sorted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGamification = async () => {
    try {
      const [resPoints, resBadges] = await Promise.all([
        fetch("/api/organizations/points", { credentials: "include" }),
        fetch("/api/organizations/badges", { credentials: "include" })
      ]);

      if (resPoints.ok) {
        const d = await resPoints.json();
        setPoints(d.points || 0);
      }
      if (resBadges.ok) {
        const d = await resBadges.json();
        setBadges(d.badges || []);
      }
    } catch (e) {
      console.error("Gamification fetch error", e);
    }
  };

  useEffect(() => {
    Promise.all([fetchProfile(), fetchOpportunities(), fetchGamification()]).finally(() => setLoading(false));
  }, []);

  const handleTogglePin = async (oppId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const res = await fetch(`/api/organizations/opportunities/${oppId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_pinned: newStatus })
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Eroare la fixare");
        return;
      }

      toast.success(newStatus ? "Oportunitate fixată!" : "Oportunitate scoasă de la profil");
      fetchOpportunities(); // Refresh list
    } catch (e) {
      toast.error("A apărut o eroare");
    }
  };

  if (loading) return <div className="py-10 text-center">Se încarcă…</div>;

  return (
    <OrganizationProfilePreview
      profile={profile as OrgProfilePayload}
      opportunities={opportunities}
      isOwner={true}
      onTogglePin={handleTogglePin}
      points={points}
      badges={badges}
    />
  );
}