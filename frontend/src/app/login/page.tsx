"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/api/auth";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data: any = await auth.login({ email, password, rememberMe });
      if (data.user?.role) localStorage.setItem("role", data.user.role);
      if (data.user?.full_name) localStorage.setItem("full_name", data.user.full_name);
      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "student") router.push("/student");
      else router.push("/organization");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #1e40af 60%, #3b82f6 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-extrabold text-white tracking-wide">CVISOR</h2>
          </Link>
          <p className="text-blue-200/70 mt-2 text-sm">Conectează-te la contul tău</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-black/20"
        >
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Autentificare</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-2xl text-sm mb-4 backdrop-blur">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="relative mb-4">
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
          <div className="relative mb-4">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60 text-lg" />
            <input
              type="password"
              placeholder="Parolă"
              className="w-full bg-white/[0.07] border border-white/[0.1] text-white placeholder-blue-200/40 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-400/50"
              />
              <span className="text-sm text-blue-200/70">Ține-mă minte</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-300 hover:text-blue-200 transition font-medium">
              Ai uitat parola?
            </Link>
          </div>

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
                Autentificare
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Register link */}
          <p className="text-center text-blue-200/60 text-sm mt-6">
            Nu ai un cont?{" "}
            <Link href="/register" className="text-blue-300 font-semibold hover:text-white transition">
              Înregistrează-te
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}