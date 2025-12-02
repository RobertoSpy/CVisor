"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Eroare la înregistrare");
      } else {
        setSuccess("Înregistrare reușită! Verifică emailul pentru codul de validare.");
        setShowCodeInput(true);
      }
    } catch (err: any) {
      setError("Eroare de rețea");
    } finally {
      setLoading(false);
    }
  };

  // Verifică codul primit pe email
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Cod incorect sau expirat!");
      } else {
        setSuccess("Email validat cu succes! Vei fi redirecționat...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setError("Eroare de rețea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-sm">
      {!showCodeInput ? (
        <form
          onSubmit={handleRegister}
          className="bg-white bg-opacity-80 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-full max-w-md backdrop-blur"
        >
          <h1 className="text-3xl font-extrabold mb-2 text-center text-primary drop-shadow">Înregistrare</h1>
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
          <input
            type="text"
            placeholder="Nume complet"
            className="border p-2 rounded w-full"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
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
            placeholder="Parolă"
            className="border p-2 rounded w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmă parola"
            className="border p-2 rounded w-full"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {/* Role selection removed - defaulting to student */}

          <button
            type="submit"
            className="bg-primary text-white py-2 rounded font-semibold hover:bg-secondary transition"
            disabled={loading}
          >
            {loading ? "Se înregistrează..." : "Înregistrare"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleCodeSubmit}
          className="bg-white bg-opacity-80 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-full max-w-md backdrop-blur"
        >
          <h2 className="text-2xl font-bold mb-2 text-center text-primary drop-shadow">
            Confirmă emailul
          </h2>
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
          <input
            type="text"
            placeholder="Cod primit pe email"
            className="border p-2 rounded w-full"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-primary text-white py-2 rounded font-semibold hover:bg-secondary transition"
            disabled={loading}
          >
            {loading ? "Se confirmă..." : "Confirmă emailul"}
          </button>
        </form>
      )}
    </main>
  );
}