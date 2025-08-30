"use client";
import Link from "next/link";
import type { Opportunity } from "../../organization/opportunities/types";

type Props = { opportunity: Opportunity };

export default function StudentOpportunityCard({ opportunity: opp }: Props) {
  return (
    <li className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex flex-col justify-between">
      <h3 className="text-lg font-semibold tracking-tight mt-0.5 text-primary">
        <Link href={`/student/opportunities/${opp.id}`}>{opp.title}</Link>
      </h3>

      <div className="text-xs mt-1">
        Tip: <span className="font-medium text-secondary">{opp.type}</span>
      </div>
      <div className="text-xs mt-1 text-gray-600">
        Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "-"}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {Array.isArray(opp.skills) &&
          opp.skills.map((s, i) => (
            <span key={s + i} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
              {s}
            </span>
          ))}
      </div>
      {/* Fără Editează/Șterge pentru student */}
    </li>
  );
}
