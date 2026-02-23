import { useEffect, useState } from "react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toLocalInputValue(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function AssignEventModal({ open, onClose, user, onSubmit }) {
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");
  const [lokacija, setLokacija] = useState("");
  const [pocetak, setPocetak] = useState(() => toLocalInputValue(new Date()));
  const [kraj, setKraj] = useState(() => toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [ceoDan, setCeoDan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    setNaziv("");
    setOpis("");
    setLokacija("");
    setCeoDan(false);
    setPocetak(toLocalInputValue(new Date()));
    setKraj(toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      const payload = {
        naziv,
        opis: opis || null,
        lokacija: lokacija || null,
        pocetak: new Date(pocetak).toISOString(),
        kraj: new Date(kraj).toISOString(),
        ceo_dan: ceoDan,
        status: "planirano",
        ponavljajuci: false,
        period_ponavljanja: null,
        ponavlja_se_do: null,
      };

      const ok = await onSubmit(payload);
      if (ok) onClose();
      else setErr("Neuspešno dodeljivanje događaja.");
    } catch {
      setErr("Neuspešno dodeljivanje događaja.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="auth-title" style={{ margin: 0, fontSize: 20 }}>
            Dodeli događaj korisniku
          </h3>
          <p className="auth-subtitle" style={{ margin: 0 }}>
            {user?.name} ({user?.email})
          </p>
        </div>

        {err && <div className="alert alert-error">{err}</div>}

        <form onSubmit={submit} className="modal-body" style={{ display: "grid", gap: 12 }}>
          <div className="form-field">
            <label className="form-label">Naziv</label>
            <input className="input" value={naziv} onChange={(e) => setNaziv(e.target.value)} required maxLength={255} />
          </div>

          <div className="form-field">
            <label className="form-label">Opis</label>
            <textarea className="input" value={opis} onChange={(e) => setOpis(e.target.value)} rows={3} />
          </div>

          <div className="form-field">
            <label className="form-label">Lokacija</label>
            <input className="input" value={lokacija} onChange={(e) => setLokacija(e.target.value)} maxLength={255} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="form-field">
              <label className="form-label">Početak</label>
              <input className="input" type="datetime-local" value={pocetak} onChange={(e) => setPocetak(e.target.value)} required />
            </div>

            <div className="form-field">
              <label className="form-label">Kraj</label>
              <input className="input" type="datetime-local" value={kraj} onChange={(e) => setKraj(e.target.value)} required />
            </div>
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={ceoDan} onChange={(e) => setCeoDan(e.target.checked)} />
            Ceo dan
          </label>

          <div className="modal-actions" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
              Otkaži
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Dodeljujem..." : "Dodeli"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}