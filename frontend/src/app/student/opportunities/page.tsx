"use client";
import { useEffect, useState } from "react";
import type { Opportunity } from "../../organization/opportunities/types";
import StudentOpportunityGrid from "./StudentOpportunityGrid";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"party" | "self-development" | null>(null);

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

    // Filtrare după tip
  const filteredOpps = selectedType
    ? opportunities.filter(opp => opp.type === selectedType)
    : [];
  

  return (
    <div className="space-y-8 mt-10">
      <div className="flex items-center justify-between mb-6">
        {/* Carduri mari pentru alegere tip */}
      {!selectedType && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <button
            className="bg-primary/10 border-2 border-primary text-primary rounded-2xl px-16 py-12 text-2xl font-bold shadow hover:bg-primary/20 transition flex flex-col items-center"
            onClick={() => setSelectedType("party")}
          >
            <span className="mb-4 text-5xl">🎉</span>
            Party
          </button>
          <button
            className="bg-secondary/10 border-2 border-secondary text-secondary rounded-2xl px-16 py-12 text-2xl font-bold shadow hover:bg-secondary/20 transition flex flex-col items-center"
            onClick={() => setSelectedType("self-development")}
          >
            <span className="mb-4 text-5xl">🧠</span>
            Self-development
          </button>
        </div>
      )}
        <h1 className="text-2xl font-bold text-primary">Oportunități active</h1>
        {/* Student nu are butonul de “Postează oportunitate nouă” */}
      </div>
        { selectedType && (
      <StudentOpportunityGrid opportunities={opportunities} loading={loading} />
        )}
    </div>
  );
}
