import { Link, NavLink, useNavigate } from "react-router-dom";

const TOKEN_KEY = "token"; // ISTO kao u Login-u

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem(TOKEN_KEY);
  const isLoggedIn = Boolean(token);

  // BITNO: ako nije ulogovan -> ne renderuj navbar uopšte
  if (!isLoggedIn) return null;

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/kalendari" className="nav-brand">
          KalendarApp
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/kalendari"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Moji kalendari
          </NavLink>
        </nav>

        <div className="nav-actions">
          <button type="button" className="btn-outline nav-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
