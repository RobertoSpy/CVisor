"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
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
      // Exemplu de request (schimbă endpointul după backendul tău)
     const res = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, role }),
  credentials: "include", // dacă folosești cookie/sesiuni
});
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        // Redirect în funcție de rol
        if (role === "admin") router.push("/admin");
        else if (role === "student") router.push("/student");
        else router.push("/asociatie");
      }
    } catch (err: any) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-lg flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Autentificare</h1>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
        <label className="font-semibold">Rol:</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="border p-2 rounded w-full">
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
          className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Se autentifică..." : "Autentificare"}
        </button>
      </form>
    </main>
  );
}