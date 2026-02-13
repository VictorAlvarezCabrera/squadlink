import { useEffect, useState } from "react";
import "../index.css";
import "./Home.css";


export default function Home() {
  const [status, setStatus] = useState("Comprobando API...");

  useEffect(() => {
    // API health
    fetch("/api/health")
        .then((r) => r.json())
        .then((data) => setStatus(data?.ok ? "API conectada ✅" : "API respondió raro ⚠️"))
        .catch(() => setStatus("No se pudo conectar con la API ❌"));
    }, []);

  const apiStatus = console.log(status);

  return (
    <main>
        <section className="home-section">
            <div className="home-header">
                <h1>SquadLink</h1>
                <p>Encuentra jugadores, crea equipos y organiza partidas.</p>
            </div>

            <form className="search-player">
                <input type="search" name="search-player" placeholder="Riot ID, ej. player#NA1" required/>
                <button type="submit">Buscar</button>
            </form>
        </section>
    </main>
  );
}