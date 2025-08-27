"use client";
import { useEffect, useState } from "react";

type ProfilePayload = {
  name: string;
  headline?: string;
  bio?: string;
  avatarDataUrl?: string;
  skills: string[];
  social: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  education: {
    id: string;
    school: string;
    degree: string;
    start: string;
    end?: string;
    details?: string;
  }[];
  experience: {
    id: string;
    role: string;
    company: string;
    start: string;
    end?: string;
    details?: string;
  }[];
};

export default function CvPreview() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        setProfile(await res.json());
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Se încarcă profilul...</div>;
  if (!profile) return <div className="p-8 text-center text-accent">Nu există date de profil!</div>;

  return (
    <div className="max-w-2xl mx-auto my-10 bg-white rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-6 mb-8">
        {profile.avatarDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarDataUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {profile.headline && <div className="text-gray-600">{profile.headline}</div>}
          {profile.bio && <div className="mt-2 text-gray-700">{profile.bio}</div>}
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Skill-uri</h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map(s => (
            <span key={s} className="bg-primary/10 text-primary px-3 py-1 rounded">{s}</span>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Linkuri</h2>
        <div className="flex flex-wrap gap-3">
          {profile.social.github && (
            <a href={profile.social.github} className="underline text-primary" target="_blank" rel="noopener noreferrer">GitHub</a>
          )}
          {profile.social.linkedin && (
            <a href={profile.social.linkedin} className="underline text-primary" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          )}
          {profile.social.website && (
            <a href={profile.social.website} className="underline text-primary" target="_blank" rel="noopener noreferrer">Website</a>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Educație</h2>
        {profile.education.length === 0 ? (
          <div className="text-gray-500">Nu ai completat educația.</div>
        ) : (
          <ul className="space-y-3">
            {profile.education.map(e => (
              <li key={e.id} className="border-b pb-2">
                <div className="font-medium">{e.school} — {e.degree}</div>
                <div className="text-xs text-gray-500">
                  {e.start} &ndash; {e.end || "prezent"}
                </div>
                {e.details && <div className="mt-1 text-gray-700">{e.details}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Experiență</h2>
        {profile.experience.length === 0 ? (
          <div className="text-gray-500">Nu ai completat experiența.</div>
        ) : (
          <ul className="space-y-3">
            {profile.experience.map(e => (
              <li key={e.id} className="border-b pb-2">
                <div className="font-medium">{e.role} — {e.company}</div>
                <div className="text-xs text-gray-500">
                  {e.start} &ndash; {e.end || "prezent"}
                </div>
                {e.details && <div className="mt-1 text-gray-700">{e.details}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}