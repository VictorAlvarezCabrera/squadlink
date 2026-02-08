import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email y password son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Error haciendo login");
        return;
      }

      if (!data?.token) {
        setError("Login OK pero no llegó token");
        return;
      }

      // Guardamos token (simple por ahora)
      localStorage.setItem("token", data.token);

      // Redirige a Home (o Players)
      navigate("/");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    alert("Token borrado (logout simple).");
  }

  const token = localStorage.getItem("token");

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <p>
        ¿No tienes cuenta? <Link to="/register">Register</Link>
      </p>

      <hr />
      <p>Token guardado: {token ? "Sí ✅" : "No ❌"}</p>
      <button onClick={logout}>Logout (borrar token)</button>
    </main>
  );
}