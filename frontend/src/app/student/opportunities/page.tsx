"use client";
import { useEffect, useState } from "react";
import type { Opportunity } from "../../organization/opportunities/types";
import StudentOpportunityGrid from "./StudentOpportunityGrid";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // exact cum e la organizații: fetch direct; poți schimba cu env/route handler când vrei
    fetch("http://localhost:5000/api/opportunities", {
      credentials: "include",
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setOpportunities(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Load opportunities failed:", err);
        setOpportunities([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Oportunități active</h1>
        {/* Student nu are butonul de “Postează oportunitate nouă” */}
      </div>

      <StudentOpportunityGrid opportunities={opportunities} loading={loading} />
    </div>
  );
}
