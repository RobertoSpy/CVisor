"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import ApiClient from "../../lib/api/client";

function UnsubscribeContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMsg("Link invalid.");
      return;
    }

    // Auto-execute unsubscribe
    ApiClient.post<{ ok?: boolean; error?: string }>("/api/newsletter/unsubscribe", { email, token })
      .then((data) => {
        if (data.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMsg(data.error || "A apărut o eroare.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMsg("Eroare de conexiune.");
      });
  }, [email, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-blue-200 rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-700">Se procesează dezabonarea...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="animate-fade-in">
            <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Dezabonare reușită</h2>
            <p className="text-gray-600 mb-6">
              Adresa <strong>{email}</strong> a fost ștearsă din lista de newsletter. Nu vei mai primi emailuri periodice de la noi.
            </p>
            <Link
              href="/"
              className="inline-block bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Înapoi la CVISOR
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="animate-fade-in">
            <FaExclamationCircle className="text-5xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Eroare</h2>
            <p className="text-gray-600 mb-6">{msg}</p>
            <Link
              href="/"
              className="text-primary hover:underline"
            >
              Mergi la pagina principală
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Se încarcă...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
