"use client";
import React, { useEffect, useState } from "react";
import StudentProfilePreview from "../StudentProfilePreview";
import ApiClient from "../../../../lib/api/client";

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Profile
        const dataProfile = await ApiClient.get("/api/users/me");
        setProfile(dataProfile as unknown as null);

        // 2. Points
        const dataPoints = await ApiClient.get<{ points?: number }>("/api/students/points");
        setPoints(dataPoints.points || 0);

        // 3. Badges
        const dataBadges = await ApiClient.get<string[] | unknown>("/api/students/badges");
        setBadges(Array.isArray(dataBadges) ? dataBadges : []);

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