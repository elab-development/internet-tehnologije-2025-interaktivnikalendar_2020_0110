import { useParams, Link } from "react-router-dom";

export default function KalendarDetalji() {
  const { id } = useParams();

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card" style={{ maxWidth: 700 }}>
          <h2 className="auth-title">Kalendar #{id}</h2>
          <p className="auth-subtitle">
            Ovde će ići prikaz događaja / meseca / nedelje…
          </p>

          <Link className="btn-outline btn-link" to="/kalendari">
            Nazad na moje kalendare
          </Link>
        </div>
      </div>
    </div>
  );
}
