import { Link, NavLink, useNavigate } from "react-router-dom";

const TOKEN_KEY = "token";

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem(TOKEN_KEY);
  const isLoggedIn = Boolean(token);

  if (!isLoggedIn) return null;

  const user = getUserFromStorage();
  const role = user?.uloga || user?.role || null; // za svaki slucaj

  const isAdmin = role === "admin";

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to={isAdmin ? "/admin" : "/kalendari"} className="nav-brand">
          KalendarApp
        </Link>

        <nav className="nav-links">
          {!isAdmin && (
            <NavLink
              to="/kalendari"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Moji kalendari
            </NavLink>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                end
              >
                Admin
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                Korisnici
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          <span className="nav-role" style={{ marginRight: 10, opacity: 0.8 }}>
            {user?.email} ({role || "unknown"})
          </span>

          <button type="button" className="btn-outline nav-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}