import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./Admin.css";
import AssignEventModal from "../../komponente/Admin/AssignEventModal";

const ROLE_OPTIONS = [
  { value: "admin", label: "admin" },
  { value: "tim_lider", label: "tim_lider" },
  { value: "zaposleni", label: "zaposleni" },
];

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async (page = 1, query = q) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.get(`/admin/users?q=${encodeURIComponent(query)}&per_page=${meta.per_page}&page=${page}`);
      setData(res.data?.data || []);
      setMeta(res.data?.meta || meta);
    } catch (err) {
      const firstError =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors)?.[0]?.[0]
          : null;

      setMessage(firstError || err.response?.data?.message || "Greška pri učitavanju korisnika.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    await load(1, q);
  };

  const updateRole = async (userId, newRole) => {
    setSavingId(userId);
    setMessage("");

    try {
      await api.put(`/admin/users/${userId}`, { uloga: newRole });
      await load(meta.current_page, q);
    } catch (err) {
      const firstError =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors)?.[0]?.[0]
          : null;

      setMessage(firstError || err.response?.data?.message || "Greška pri izmeni uloge.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (userId) => {
    const ok = window.confirm("Da li ste sigurni da želite da obrišete korisnika?");
    if (!ok) return;

    setDeletingId(userId);
    setMessage("");

    try {
      await api.delete(`/admin/users/${userId}`);
      const nextPage = data.length === 1 && meta.current_page > 1 ? meta.current_page - 1 : meta.current_page;
      await load(nextPage, q);
    } catch (err) {
      const firstError =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors)?.[0]?.[0]
          : null;

      setMessage(firstError || err.response?.data?.message || "Greška pri brisanju korisnika.");
    } finally {
      setDeletingId(null);
    }
  };

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;

  const [assignOpen, setAssignOpen] = useState(false);
const [assignUser, setAssignUser] = useState(null);
const assignEvent = async (eventPayload) => {
  if (!assignUser) return false;

  setMessage("");
  try {
    await api.post("/admin/dogadjaji/assign", {
      user_id: assignUser.id,
      event: eventPayload,
    });
    setMessage(`Događaj je dodeljen korisniku ${assignUser.email}.`);
    return true;
  } catch (err) {
    const firstError =
      err.response?.data?.errors
        ? Object.values(err.response.data.errors)?.[0]?.[0]
        : null;

    setMessage(firstError || err.response?.data?.message || "Greška pri dodeli događaja.");
    return false;
  }
};
 
  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card admin-card-wide">
          <div className="admin-head">
            <div>
              <h2 className="auth-title" style={{ marginBottom: 4 }}>
                Korisnici
              </h2>
              <p className="auth-subtitle" style={{ margin: 0 }}>
                Pretraga, izmena uloge i brisanje
              </p>
            </div>

            <div className="admin-head-actions">
              <Link className="btn-outline btn-link" to="/admin">
                Dashboard
              </Link>
              <Link className="btn-outline btn-link" to="/kalendari">
                Kalendari
              </Link>
            </div>
          </div>

          <form className="admin-search" onSubmit={onSearch}>
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">Pretraga</label>
              <input
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ime ili email"
              />
            </div>

            <button className="btn-primary" type="submit" style={{ height: 44, alignSelf: "end" }}>
              Traži
            </button>

            <button
              className="btn-outline"
              type="button"
              style={{ height: 44, alignSelf: "end" }}
              onClick={() => {
                setQ("");
                load(1, "");
              }}
            >
              Reset
            </button>
          </form>

          {loading && <p className="auth-subtitle calendar-loading">Učitavanje...</p>}
          {!loading && message && <div className="alert alert-error">{message}</div>}

          {!loading && (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>ID</th>
                      <th>Ime</th>
                      <th>Email</th>
                      <th style={{ width: 170 }}>Uloga</th>
                      <th style={{ width: 150 }}>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-muted" style={{ padding: 14 }}>
                          Nema rezultata.
                        </td>
                      </tr>
                    ) : (
                      data.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td className="admin-ellipsis">{u.name}</td>
                          <td className="admin-ellipsis">{u.email}</td>
                          <td>
                            <select
                              className="input admin-select"
                              value={u.uloga || "zaposleni"}
                              onChange={(e) => updateRole(u.id, e.target.value)}
                              disabled={savingId === u.id || deletingId === u.id}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="calendar-delete"
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingId === u.id || savingId === u.id}
                            >
                              {deletingId === u.id ? "Brisanje..." : "Obriši"}
                            </button>
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => {
                                  setAssignUser(u);
                                  setAssignOpen(true);
                                }}
                                disabled={deletingId === u.id || savingId === u.id}
                              >
                                Dodeli događaj
                              </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-pager">
                <div className="admin-muted">
                  Ukupno: <b>{meta.total}</b>
                </div>

                <div className="admin-pager-actions">
                  <button className="btn-outline" type="button" disabled={!canPrev} onClick={() => load(meta.current_page - 1, q)}>
                    ← Prethodna
                  </button>

                  <div className="admin-page-pill">
                    Strana {meta.current_page} / {meta.last_page}
                  </div>

                  <button className="btn-outline" type="button" disabled={!canNext} onClick={() => load(meta.current_page + 1, q)}>
                    Sledeća →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <AssignEventModal
        open={assignOpen}
        user={assignUser}
        onClose={() => {
          setAssignOpen(false);
          setAssignUser(null);
        }}
        onSubmit={assignEvent}
      />
         </div>
  );
}