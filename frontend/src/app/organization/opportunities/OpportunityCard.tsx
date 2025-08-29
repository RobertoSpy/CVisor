import Link from "next/link";
import { Opportunity } from "./types";

type Props = {
  opportunity: Opportunity;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: number) => void;
};

export default function OpportunityCard({ opportunity: opp, onEdit, onDelete }: Props) {
  return (
    <li
      key={opp.id}
      className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex flex-col justify-between relative overflow-visible"
    >
      <h3 className="text-lg font-semibold tracking-tight mt-0.5 text-primary">
        <Link href={`/organization/opportunities/${opp.id}`}>{opp.title}</Link>
      </h3>
      <div className="text-xs mt-1">
        Tip: <span className="font-medium text-secondary">{opp.type}</span>
      </div>
      <div className="text-xs mt-1 text-gray-600">
        Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : '-'}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {Array.isArray(opp.skills) &&
          opp.skills.map((s, i) => (
            <span
              key={s + i}
              className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium"
            >
              {s}
            </span>
          ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="px-3 py-1 rounded-lg bg-accent text-white hover:bg-primary transition shadow text-sm"
          onClick={() => onEdit(opp)}
        >
          Editează
        </button>
        <button
          className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow text-sm"
          onClick={() => onDelete(opp.id)}
        >
          Șterge
        </button>
      </div>
    </li>
  );
}