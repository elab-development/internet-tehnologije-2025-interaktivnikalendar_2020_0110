import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Kalendari() {
  const navigate = useNavigate();

  const [kalendari, setKalendari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage("");

      try {
        const res = await api.get("/kalendari");
       
        setKalendari(res.data.data || []);
        if ((res.data.data || []).length === 0) {
          setMessage(res.data.message || "Nema kalendara.");
        }
      } catch (err) {
        setMessage(err.response?.data?.message || "Greška pri učitavanju kalendara.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSelect = (k) => {
    
    localStorage.setItem("selectedCalendarId", String(k.id));
    navigate(`/kalendari/${k.id}`);
  };

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card" style={{ maxWidth: 700 }}>
          <h2 className="auth-title">Moji kalendari</h2>
          <p className="auth-subtitle">Odaberi kalendar da nastaviš.</p>

          {loading && <p className="auth-subtitle">Učitavanje...</p>}

          {!loading && message && <div className="alert alert-error">{message}</div>}

          {!loading && kalendari.length > 0 && (
            <div className="calendar-list">
              {kalendari.map((k) => (
                <button
                  key={k.id}
                  className="calendar-item"
                  onClick={() => handleSelect(k)}
                  type="button"
                >
                  <div className="calendar-item-title">{k.naziv}</div>
                  <div className="calendar-item-sub">ID: {k.id}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
