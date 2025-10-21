"use client";
import React, { useEffect, useState } from "react";
import StudentProfilePreview from "../StudentProfilePreview";

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const resp = await fetch("/api/users/me", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}`
          }
        });
        if (!resp.ok) throw new Error("Nu s-a găsit profilul");
        const data = await resp.json();
        setProfile(data);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="py-10 text-center">Se încarcă…</div>;
  return <StudentProfilePreview profile={profile} />;
}