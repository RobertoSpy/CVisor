"use client";
import React, { useEffect, useState } from "react";
import StudentProfilePreview from "../StudentProfilePreview";

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Profile
        const respProfile = await fetch("/api/users/me", { credentials: "include" });
        if (!respProfile.ok) throw new Error("Nu s-a găsit profilul");
        const dataProfile = await respProfile.json();
        setProfile(dataProfile);

        // 2. Points
        const respPoints = await fetch("/api/students/points", { credentials: "include" });
        if (respPoints.ok) {
          const dataPoints = await respPoints.json();
          setPoints(dataPoints.points || 0);
        }

        // 3. Badges
        const respBadges = await fetch("/api/students/badges", { credentials: "include" });
        if (respBadges.ok) {
          const dataBadges = await respBadges.json();
          setBadges(Array.isArray(dataBadges) ? dataBadges : []);
        }

      } catch (e) {
        console.error(e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="py-10 text-center">Se încarcă…</div>;
  return <StudentProfilePreview profile={profile} points={points} badges={badges} />;
}