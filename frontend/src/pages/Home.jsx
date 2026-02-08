import { useEffect, useState } from "react";
import PlayerCard from "../components/PlayerCard.jsx";

export default function Home() {
  const [status, setStatus] = useState("Comprobando API...");
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // API health
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setStatus(data?.ok ? "API conectada ✅" : "API respondió raro ⚠️"))
      .catch(() => setStatus("No se pudo conectar con la API ❌"));
  }, []);

  useEffect(() => {
    setError("");
    fetch("/api/players/random?limit=6")
      .then((r) => r.json())
      .then((data) => setPlayers(Array.isArray(data) ? data : []))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main>
      <h1>SquadLink</h1>
      <p>Encuentra jugadores, crea equipos y organiza partidas.</p>

      <h2>Estado</h2>
      <p>{status}</p>

      <h2>Players aleatorios</h2>

      {error && <p>{error}</p>}

      {players.length === 0 ? (
        <p>No hay players todavía.</p>
      ) : (
        <div className="players-grid">
            {players.map((p) => (
                <PlayerCard key={p.id} player={p} />
            ))}
        </div>
      )}
    </main>
  );
}