import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link className="nav-link" to="/">Inicio</Link>
      <Link className="nav-link" to="/stats">Estadisticas</Link>
      <Link className="nav-link" to="/champions">Campeones</Link>
      <Link className="nav-link" to="/login">Login</Link>
      <Link className="nav-link" to="/register">Register</Link>
      
    </nav>
  );
}