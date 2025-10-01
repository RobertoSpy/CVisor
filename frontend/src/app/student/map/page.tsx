import { BADGES } from "../lib/streak";

export default function ProgressMap({ badges }: { badges: string[] }) {
  // badges: codurile (string[]) de badge-uri pe care le deține userul
  console.log("BADGES", BADGES, Array.isArray(BADGES)); // <-- AICI

  return (
    <div className="relative flex flex-col items-center w-full max-w-xs mx-auto pt-4 pb-16">
      {/* Drum vertical */}
      <div className="absolute left-1/2 -translate-x-1/2 top-12 bottom-0 w-2 bg-gradient-to-b from-emerald-300 via-amber-200 to-gray-200 rounded-full pointer-events-none z-0" />
      {BADGES.map((badge, i) => {
        const unlocked = badges.includes(badge.code);
        const next = !unlocked && (i === 0 || badges.includes(BADGES[i - 1].code));
        return (
          <div key={badge.code} className="relative z-10 flex flex-col items-center mb-10 group">
            {/* Cercul mare pentru badge */}
            <div className={`flex items-center justify-center w-24 h-24 rounded-full border-4 ${unlocked ? "bg-emerald-100 border-emerald-400 shadow-lg" : next ? "bg-yellow-50 border-amber-300" : "bg-gray-100 border-gray-300 opacity-60"} transition-all`}>
              <span className="text-4xl">{badge.emoji}</span>
            </div>
            {/* Linia pentru „drum” */}
            {i < BADGES.length - 1 && (
              <div className="w-1 h-10 bg-gradient-to-b from-amber-200 to-gray-200" />
            )}
            {/* Textul badgeului */}
            <div className="text-center mt-2">
              <div className={`text-lg font-bold ${unlocked ? "text-emerald-700" : next ? "text-amber-600" : "text-gray-400"}`}>{badge.label}</div>
              <div className="text-xs text-gray-500">
                {badge.streak}+ zile streak
              </div>
              {/* Dacă nu e deblocat, ce să faci */}
              {!unlocked && (
                <div className="mt-1 text-xs text-amber-800 italic">
                  {next
                    ? `Deblochează cu streak de ${badge.streak} zile`
                    : `Blocată`}
                </div>
              )}
              {/* Dacă e deblocat și are feature */}
              {unlocked && badge.feature && (
                <div className="mt-1 text-xs text-indigo-700 font-semibold">
                  {badge.feature}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}