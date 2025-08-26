"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validatePassword(password)) {
      setError("Parola trebuie să aibă minim 8 caractere, o literă, o cifră și un simbol!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Eroare la înregistrare");
      } else {
        setSuccess("Înregistrare reușită! Acum poți să te loghezi.");
      }
    } catch (err: any) {
      setError("Eroare de rețea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-hero">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-full max-w-md backdrop-blur"
      >
        <h1 className="text-3xl font-extrabold mb-2 text-center text-primary drop-shadow">Înregistrare</h1>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
        <label className="font-semibold text-primary">Rol:</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="asociatie">Asociație</option>
        </select>
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
        <button
          type="submit"
          className="bg-primary text-white py-2 rounded font-semibold hover:bg-secondary transition"
          disabled={loading}
        >
          {loading ? "Se înregistrează..." : "Înregistrare"}
        </button>
      </form>
    </main>
  );
}