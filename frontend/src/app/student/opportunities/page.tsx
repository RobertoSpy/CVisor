"use client";
import { useEffect, useState } from "react";
import type { Opportunity } from "../../organization/opportunities/types";
import StudentOpportunityGrid from "./StudentOpportunityGrid";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"party" | "self-development" | null>(null);

  useEffect(() => {
    fetch("/api/opportunities", {
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
      {/* Carduri de alegere tip, centrate perfect */}
      {!selectedType && (
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex flex-col md:flex-row gap-8">
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
        </div>
      )}

      {/* Titlul, mereu vizibil, sub carduri */}
      <h1 className="text-2xl font-bold text-primary text-left mb-6">
        Oportunități active
      </h1>

      {/* Buton pentru revenire la alegere tip */}
{selectedType && (
  <div className="flex justify-center mb-6">
    <button
      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 transition"
      onClick={() => setSelectedType(null)}
    >
      ← Alege alt tip de oportunitate
    </button>
  </div>
)}

      {/* Grid-ul de oportunități */}
      {selectedType && (
        <StudentOpportunityGrid
          opportunities={opportunities.filter(opp => opp.type === selectedType)}
          loading={loading}
        />
      )}
    </div>
  );
}