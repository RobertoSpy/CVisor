"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Role state removed
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    // minim 8 caractere, litere, cifre, simboluri
    return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError("Parola trebuie să aibă minim 8 caractere, o literă, o cifră și un simbol!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        // Salvează rolul (token-ul e în cookie)
        if (data.user?.role) localStorage.setItem("role", data.user.role);
        if (data.user?.full_name) localStorage.setItem("full_name", data.user.full_name);

        // Redirect în funcție de rol
        if (data.user.role === "admin") router.push("/admin");
        else if (data.user.role === "student") router.push("/student");
        else router.push("/organization");
      }
    } catch (err: any) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-full max-w-md backdrop-blur"
      >
        <h1 className="text-3xl font-extrabold mb-2 text-center text-primary drop-shadow">Autentificare</h1>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}

        {/* Role selection removed */}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Parola"
          className="border p-2 rounded w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-primary font-bold hover:underline">
            Ai uitat parola?
          </Link>
        </div>
        <button
          type="submit"
          className="bg-primary text-white py-2 rounded font-semibold hover:bg-secondary transition"
          disabled={loading}
        >
          {loading ? "Se autentifică..." : "Autentificare"}
        </button>
      </form>
    </main>
  );
}