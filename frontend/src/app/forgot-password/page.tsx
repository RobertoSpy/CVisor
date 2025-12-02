"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code + New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("Codul a fost trimis! Verifică emailul.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Eroare la trimiterea codului");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("Parola a fost resetată cu succes! Te redirecționăm...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Eroare la resetarea parolei");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-sm p-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-extrabold text-center text-primary mb-6 drop-shadow-sm">
          {step === 1 ? "Resetare Parolă" : "Confirmare"}
        </h1>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center font-medium">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center font-medium">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="exemplu@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? "Se trimite..." : "Trimite Codul"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Cod de verificare</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Noua Parolă</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-orange-600 transition-all transform hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? "Se procesează..." : "Schimbă Parola"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-primary font-bold hover:underline">
            Înapoi la Login
          </Link>
        </div>
      </div>
    </div>
  );
}
