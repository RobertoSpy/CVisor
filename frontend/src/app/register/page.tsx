"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { auth } from "@/lib/api/auth";
import { FiUser, FiMail, FiLock, FiShield, FiArrowRight } from "react-icons/fi";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwd);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError("Te rugăm să completezi numele complet!");
      return;
    }
    if (!validatePassword(password)) {
      setError("Parola trebuie să aibă minim 8 caractere, o literă, o cifră și un simbol!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Parolele nu coincid!");
      return;
    }

    setLoading(true);
    try {
      await auth.register({ fullName, email, password, role });
      setSuccess("Înregistrare reușită! Verifică emailul pentru codul de validare.");
      setShowCodeInput(true);
    } catch (err: any) {
      setError(err.message || "Eroare la înregistrare");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.verifyEmail({ email, code });
      setSuccess("Email validat cu succes! Vei fi redirecționat...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Cod incorect sau expirat!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #1e40af 60%, #3b82f6 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">CVISOR</h2>
          </Link>
          <p className="text-blue-200/70 mt-2 text-sm">Creează-ți contul gratuit</p>
        </div>

        {!showCodeInput ? (
          /* Registration form */
          <form
            onSubmit={handleRegister}
            className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-black/20"
          >
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Înregistrare</h1>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-2xl text-sm mb-4 backdrop-blur">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-4 py-3 rounded-2xl text-sm mb-4 backdrop-blur">
                {success}
              </div>
            )}

            {/* Full Name */}
            <div className="relative mb-3">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60 text-lg" />
              <input
                type="text"
                placeholder="Nume complet"
                className="w-full bg-white/[0.07] border border-white/[0.1] text-white placeholder-blue-200/40 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="relative mb-3">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60 text-lg" />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-white/[0.07] border border-white/[0.1] text-white placeholder-blue-200/40 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative mb-3">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60 text-lg" />
              <input
                type="password"
                placeholder="Parolă"
                className="w-full bg-white/[0.07] border border-white/[0.1] text-white placeholder-blue-200/40 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative mb-4">
              <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60 text-lg" />
              <input
                type="password"
                placeholder="Confirmă parola"
                className="w-full bg-white/[0.07] border border-white/[0.1] text-white placeholder-blue-200/40 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Password hint */}
            <p className="text-xs text-blue-200/40 mb-5 px-1">
              Min. 8 caractere, o literă, o cifră și un simbol (!@#$%^&*)
            </p>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Înregistrare
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Login link */}
            <p className="text-center text-blue-200/60 text-sm mt-6">
              Ai deja un cont?{" "}
              <Link href="/login" className="text-blue-300 font-semibold hover:text-white transition">
                Autentifică-te
              </Link>
            </p>
          </form>
        ) : (
          /* Email verification form */
          <form
            onSubmit={handleCodeSubmit}
            className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-black/20"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📧</div>
              <h2 className="text-2xl font-bold text-white">Confirmă emailul</h2>
              <p className="text-blue-200/60 text-sm mt-2">Am trimis un cod de verificare la <span className="text-blue-300 font-medium">{email}</span></p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-2xl text-sm mb-4 backdrop-blur">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-4 py-3 rounded-2xl text-sm mb-4 backdrop-blur">
                {success}
              </div>
            )}

            <div className="relative mb-5">
              <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60 text-lg" />
              <input
                type="text"
                placeholder="Cod de verificare"
                className="w-full bg-white/[0.07] border border-white/[0.1] text-white placeholder-blue-200/40 rounded-2xl pl-12 pr-4 py-3.5 text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Confirmă emailul
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}