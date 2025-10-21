"use client";
import React, { useEffect, useState } from "react";
import OrganizationProfilePreview from "../OrganizationProfilePreview";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const resp = await fetch("/api/organizations/users/profile", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}`
          }
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
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="py-10 text-center">Se încarcă…</div>;
  return <OrganizationProfilePreview profile={profile as OrgProfilePayload} />;
}