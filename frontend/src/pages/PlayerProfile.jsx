import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setPlayer(null);

    fetch(`/api/players/${id}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error || "Error cargando player");
        return data;
      })
      .then(setPlayer)
      .catch((e) => setError(String(e.message || e)));
  }, [id]);

  return (
    <main>
      <p>
        <Link to="/">← Volver a Home</Link>
      </p>

      <h1>Perfil del jugador</h1>

      {error && <p>{error}</p>}
      {!error && !player && <p>Cargando...</p>}

      {player && (
        <>
          <h2>{player.nickname}</h2>
          <p>
            Juego: {player.game} <br />
            Rol: {player.role} <br />
            Rango: {player.rango || "-"}
          </p>

          <h3>Estadísticas</h3>
          <ul>
            <li>Partidas: {player.matches_played}</li>
            <li>Victorias: {player.wins}</li>
            <li>KDA: {player.kda}</li>
            <li>Winrate: {player.winrate}%</li>
          </ul>
        </>
      )}
    </main>
  );
}