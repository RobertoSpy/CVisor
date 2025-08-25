type Application = {
  id: string;
  opportunityTitle: string;
  orgName: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

async function getApps(): Promise<Application[]> {
  // TODO: leagă la backend: /api/applications?me=1
  return [
    {
      id: "a1",
      opportunityTitle: "Voluntariat Tech Event",
      orgName: "DevClub",
      status: "pending",
      created_at: new Date().toISOString(),
    },
    {
      id: "a2",
      opportunityTitle: "Workshop React",
      orgName: "CVisor Org",
      status: "accepted",
      created_at: new Date().toISOString(),
    },
  ];
}

function StatusBadge({ status }: { status: Application["status"] }) {
  const colors: Record<Application["status"], string> = {
    pending: "bg-warning/20 text-warning",
    accepted: "bg-success/20 text-success",
    rejected: "bg-accent/20 text-accent",
  };

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium ${colors[status]}`}
    >
      {status}
    </span>
  );
}

export default async function ApplicationsPage() {
  const apps = await getApps();

  return (
    <div className="space-y-8 mt-10">
      <h2 className="text-xl font-semibold tracking-tight">Aplicațiile mele</h2>

      <div className="bg-card rounded-2xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/5 text-gray-700">
            <tr className="text-left">
              <th className="p-3 font-medium">Oportunitate</th>
              <th className="p-3 font-medium">Organizație</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr
                key={a.id}
                className="border-t border-black/10 hover:bg-black/5 transition"
              >
                <td className="p-3">{a.opportunityTitle}</td>
                <td className="p-3">{a.orgName}</td>
                <td className="p-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="p-3">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {apps.length === 0 && (
        <div className="bg-card rounded-2xl p-8 text-center ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
          <h3 className="text-lg font-semibold">Nicio aplicație trimisă</h3>
          <p className="text-sm text-gray-600 mt-1">
            Vei vedea aici toate oportunitățile la care ai aplicat.
          </p>
        </div>
      )}
    </div>
  );
}
