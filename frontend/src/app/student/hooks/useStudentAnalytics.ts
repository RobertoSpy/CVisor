"use client";
import { useEffect, useState } from "react";

type OrgBar = { label: string; value: number };

export default function useStudentAnalytics(apiBase = "http://localhost:5000") {
  const STUDENT_ANALYTICS = `${apiBase}/api/analytics/student`;
  const ORG_ANALYTICS = `${apiBase}/api/analytics/orgs`;

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [orgBars, setOrgBars] = useState<OrgBar[]>([]);

  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token") || "";
    const auth = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        const pres = await fetch(`${STUDENT_ANALYTICS}/presence?days=35`, { credentials: "include", headers: auth });
        if (pres.ok) {
          const payload = await pres.json();
          if (!ignore) setHeatmapData(payload || {});
        }
        const org = await fetch(`${ORG_ANALYTICS}/posts?weeks=8`, { credentials: "include", headers: auth });
        if (org.ok) {
          const payload: OrgBar[] = await org.json();
          if (!ignore) setOrgBars(payload || []);
        }
      } catch {
        // fallback mic
        if (ignore) return;
        setHeatmapData({});
        setOrgBars([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [STUDENT_ANALYTICS, ORG_ANALYTICS]);

  return { heatmapData, orgBars, setHeatmapData, setOrgBars };
}
