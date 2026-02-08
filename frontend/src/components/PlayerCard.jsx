import { Link } from "react-router-dom";

export default function PlayerCard({ player }) {
  return (
    <Link to={`/players/${player.id}`}>
      <div className="player-card">
        <h3>{player.nickname}</h3>

        <p>
          {player.game} — {player.role}
        </p>

        <p>Rango: {player.rango || "-"}</p>

        <p>
          Matches: {player.matches_played}<br />
          Wins: {player.wins}<br />
          KDA: {player.kda}<br />
          Winrate: {player.winrate}%
        </p>
      </div>
    </Link>
  );
}