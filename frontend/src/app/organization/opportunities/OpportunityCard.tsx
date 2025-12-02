import Link from "next/link";
import { Opportunity } from "./types";

type Props = {
  opportunity: Opportunity;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
};

export default function OpportunityCard({ opportunity: opp, onEdit, onDelete, readOnly }: Props) {
  // Gradient și mesaje pentru fallback
  const fallbackBanner = () => {
    if (opp.type === "party") {
      return (
        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-[400px] h-40 rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-400 flex flex-col items-center justify-center">
            <span className="text-5xl mb-2 animate-bounce">🎉</span>
            <span className="text-xl font-bold text-white drop-shadow">Party Time!</span>
            <span className="text-xs font-semibold text-white/80 mt-1">Let’s celebrate together!</span>
          </div>
        </div>
      );
    }
    if (opp.type === "self-development") {
      return (
        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-[400px] h-40 rounded-xl bg-gradient-to-r from-blue-500 via-green-400 to-purple-400 flex flex-col items-center justify-center">
            <span className="text-5xl mb-2 animate-pulse">🧠</span>
            <span className="text-xl font-bold text-white drop-shadow">Level Up!</span>
            <span className="text-xs font-semibold text-white/80 mt-1">Self-growth in progress…</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <li className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow flex flex-col justify-between relative overflow-visible">
      {/* Banner sau fallback */}
      {opp.banner_image ? (
        <div className="w-full flex justify-center mb-4">
          <img
            src={opp.banner_image}
            alt={opp.title}
            className="object-cover rounded-xl max-h-48 w-full"
            style={{ maxWidth: "400px" }}
          />
        </div>
      ) : (
        fallbackBanner()
      )}

      {/* Titlu & descriere */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          <Link href={readOnly ? `/organization/explore/${opp.id}` : `/organization/opportunities/${opp.id}`}>
            {opp.title}
          </Link>
        </h3>
        {opp.organization_name && (
          <div className="text-sm font-bold text-blue-600 mb-2">
            {opp.organization_name}
          </div>
        )}
        {opp.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{opp.description}</p>}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
        {Array.isArray(opp.skills) &&
          opp.skills.map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium"
            >
              {s}
            </span>
          ))}
      </div>

      {/* Acțiuni */}
      {!readOnly && (
        <div className="mt-4 flex gap-2 justify-center">
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
      )}
    </li>
  );
}