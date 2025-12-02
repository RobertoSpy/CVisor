import OpportunityCard from "./OpportunityCard";
import { Opportunity } from "./types";

type Props = {
  opportunities: Opportunity[];
  loading: boolean;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
};

export default function OpportunityGrid({ opportunities, loading, onEdit, onDelete, readOnly }: Props) {
  if (loading) {
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <li
            key={i}
            className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] animate-pulse"
          >
            <div className="h-3 w-24 bg-black/10 rounded mb-2" />
            <div className="h-5 w-3/4 bg-black/10 rounded mb-3" />
            <div className="h-3 w-20 bg-black/10 rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-black/10 rounded" />
              <div className="h-6 w-20 bg-black/10 rounded" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!opportunities.length) {
    return (
      <div className="bg-card rounded-2xl p-8 text-center ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h3 className="text-lg font-semibold tracking-tight">Nicio oportunitate activă sau nu ai acces.</h3>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((opp, idx) => (
        <OpportunityCard
          key={opp.id ?? `opp-${idx}`}
          opportunity={opp}
          onEdit={onEdit}
          onDelete={onDelete}
          readOnly={readOnly}
        />
      ))}
    </ul>
  );
}