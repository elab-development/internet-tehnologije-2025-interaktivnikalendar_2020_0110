import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import CalendarForm from "../../komponente/Kalendar/CalendarForm";
import CalendarCard from "../../komponente/Kalendar/CalendarCard";
 

export default function Kalendari() {
  const navigate = useNavigate();

  const [kalendari, setKalendari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [createErrors, setCreateErrors] = useState({}); // backend validation

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.get("/kalendari");
      const list = res.data.data || [];
      setKalendari(list);

      if (list.length === 0) {
        setMessage(res.data.message || "Nema kalendara.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Greška pri učitavanju kalendara.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSelect = (k) => {
    localStorage.setItem("selectedCalendarId", String(k.id));
    navigate(`/kalendari/${k.id}`);
  };

  const handleCreate = async (naziv) => {
    setCreating(true);
    setCreateErrors({});
    setMessage("");

    try {
      await api.post("/kalendari", { naziv });
      await load();
      return true;
    } catch (err) {
      if (err.response?.status === 422) {
        const errs = err.response.data.errors || {};
        setCreateErrors(errs);
        // za formu vrati false, error će prikazati input (prosledićemo ga dole)
      } else {
        setMessage(err.response?.data?.message || "Greška pri kreiranju kalendara.");
      }
      return false;
    } finally {
      setCreating(false);
    }
  };
const handleDelete = async (kalendar) => {
  const ok = window.confirm(
    `Da li sigurno želiš da obrišeš kalendar "${kalendar.naziv}"?`
  );
  if (!ok) return;

  setMessage("");
  try {
    await api.delete(`/kalendari/${kalendar.id}`);
    await load();
  } catch (err) {
    setMessage(err.response?.data?.message || "Greška pri brisanju kalendara.");
  }
};
  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card" style={{ maxWidth: 700 }}>
          <h2 className="auth-title">Moji kalendari</h2>
          <p className="auth-subtitle">Odaberi kalendar da nastaviš.</p>

          {/* Forma: Dodaj kalendar */}
          <div className="calendar-create-box">
            <CalendarForm onCreate={handleCreate} loading={creating} />
            {/* backend validaciona greska za naziv */}
            {createErrors.naziv?.[0] && (
              <p className="field-error" style={{ marginTop: 6 }}>
                {createErrors.naziv[0]}
              </p>
            )}
          </div>

          {/* Global message */}
          {!loading && message && <div className="alert alert-error">{message}</div>}
          {loading && <p className="auth-subtitle calendar-loading">Učitavanje...</p>}

          {/* Lista */}
          {!loading && kalendari.length > 0 && (
            <div className="calendar-list">
             {kalendari.map((k) => (
                <CalendarCard
                    key={k.id}
                    kalendar={k}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                />
                ))}
            </div>
          )}

          {!loading && kalendari.length === 0 && !message && (
            <div className="calendar-empty">Nema kalendara.</div>
          )}
        </div>
      </div>
    </div>
  );
}
