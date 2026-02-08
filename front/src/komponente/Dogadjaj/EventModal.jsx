import { useEffect, useState } from "react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYMD(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// koristi lokalno vreme za datetime-local input (bez Z)
function toLocalDateTimeInputValue(date) {
  return `${toYMD(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export default function EventModal({
  open,
  onClose,
  kalendarId,
  selectedDate, // JS Date
  onSubmit, // async(payload) => true/false
}) {
  const [form, setForm] = useState({
    naziv: "",
    opis: "",
    lokacija: "",
    ceo_dan: false,
    pocetak: "",
    kraj: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // inicijalizuj formu svaki put kad se otvori modal
  useEffect(() => {
    if (!open || !selectedDate) return;

    const base = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      9,
      0,
      0
    );
    const end = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      10,
      0,
      0
    );

    setForm({
      naziv: "",
      opis: "",
      lokacija: "",
      ceo_dan: false,
      pocetak: toLocalDateTimeInputValue(base),
      kraj: toLocalDateTimeInputValue(end),
    });

    setErrors({});
    setMessage("");
    setSaving(false);
  }, [open, selectedDate]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setSaving(true);

    try {
      // Laravel Validator traži 'date' – šaljemo ISO
      const payload = {
        kalendar_id: Number(kalendarId),
        naziv: form.naziv,
        opis: form.opis || null,
        lokacija: form.lokacija || null,
        ceo_dan: form.ceo_dan,
        status: "planirano",
        pocetak: new Date(form.pocetak).toISOString(),
        kraj: new Date(form.kraj).toISOString(),
      };

      const ok = await onSubmit(payload);

      if (!ok) {
        // roditelj može proslediti greške, ali ovde držimo fallback poruku
        setMessage("Validacija neuspešna.");
        setSaving(false);
        return;
      }

      onClose();
    } catch {
      setMessage("Greška pri čuvanju.");
      setSaving(false);
    }
  };

  const ymd = selectedDate ? toYMD(selectedDate) : "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Dodaj događaj</h3>
            <p className="modal-subtitle">Datum: {ymd}</p>
          </div>

          <button className="modal-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        {message && <div className="alert alert-error">{message}</div>}

        <form className="modal-form" onSubmit={submit}>
          <div className="modal-grid">
            <div className="form-field">
              <label className="form-label">Naziv</label>
              <input
                className="input"
                name="naziv"
                value={form.naziv}
                onChange={handleChange}
                placeholder="npr. Sastanak"
              />
              {errors.naziv?.[0] && <p className="field-error">{errors.naziv[0]}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">Lokacija (opciono)</label>
              <input
                className="input"
                name="lokacija"
                value={form.lokacija}
                onChange={handleChange}
                placeholder="npr. Kancelarija / Online"
              />
              {errors.lokacija?.[0] && <p className="field-error">{errors.lokacija[0]}</p>}
            </div>

            <div className="form-field modal-span-2">
              <label className="form-label">Opis (opciono)</label>
              <textarea
                className="input"
                name="opis"
                value={form.opis}
                onChange={handleChange}
                placeholder="Kratak opis..."
                rows={3}
                style={{ resize: "vertical" }}
              />
              {errors.opis?.[0] && <p className="field-error">{errors.opis[0]}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">Početak</label>
              <input
                className="input"
                type="datetime-local"
                name="pocetak"
                value={form.pocetak}
                onChange={handleChange}
              />
              {errors.pocetak?.[0] && <p className="field-error">{errors.pocetak[0]}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">Kraj</label>
              <input
                className="input"
                type="datetime-local"
                name="kraj"
                value={form.kraj}
                onChange={handleChange}
              />
              {errors.kraj?.[0] && <p className="field-error">{errors.kraj[0]}</p>}
            </div>

            <div
              className="form-field modal-span-2"
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <input
                type="checkbox"
                name="ceo_dan"
                checked={form.ceo_dan}
                onChange={handleChange}
                id="ceo_dan"
              />
              <label htmlFor="ceo_dan" className="form-label" style={{ margin: 0 }}>
                Ceo dan
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-outline" type="button" onClick={onClose}>
              Otkaži
            </button>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Čuvam..." : "Sačuvaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
