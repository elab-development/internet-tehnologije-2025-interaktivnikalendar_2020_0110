import { useEffect, useMemo, useState } from "react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseBackendDate(s) {
  if (!s) return null;
  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d) {
  if (!d) return "—";
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}.`;
}

function formatTime(d) {
  if (!d) return "—";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatDateTime(d) {
  if (!d) return "—";
  return `${formatDate(d)} ${formatTime(d)}`;
}

function durationText(start, end) {
  if (!start || !end) return "—";
  const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default function EventInfoModal({ open, onClose, event, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const start = useMemo(() => parseBackendDate(event?.pocetak), [event?.pocetak]);
  const end = useMemo(() => parseBackendDate(event?.kraj), [event?.kraj]);

  // ✅ reset stanja svaki put kad:
  // - otvoriš modal
  // - promeniš event
  useEffect(() => {
    if (!open) return;
    setDeleting(false);
    setMessage("");
  }, [open, event?.id]);

  if (!open || !event) return null;

  const title = event.naziv || "Događaj";

  const handleDelete = async () => {
    if (!event?.id) return;

    const ok = window.confirm("Da li si sigurna da želiš da obrišeš ovaj događaj?");
    if (!ok) return;

    setDeleting(true);
    setMessage("");

    try {
      const success = await onDelete(event.id);

      if (success) {
        onClose();
        return;
      }

      setMessage("Greška pri brisanju događaja.");
      setDeleting(false);
    } catch {
      setMessage("Greška pri brisanju događaja.");
      setDeleting(false);
    }
  };

  const isAllDay = !!event.ceo_dan;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            <p className="modal-subtitle">
              {isAllDay ? "Ceo dan" : `${formatDateTime(start)} — ${formatDateTime(end)}`}
            </p>
          </div>

          <button className="modal-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        {message && <div className="alert alert-error">{message}</div>}

        <div className="modal-inner">
          <div className="info-grid">
            {/* Datum */}
            <div className="info-row">
              <div className="info-label">Datum</div>
              <div className="info-value">{formatDate(start) !== "—" ? formatDate(start) : "—"}</div>
            </div>

            {/* Trajanje */}
            <div className="info-row">
              <div className="info-label">Trajanje</div>
              <div className="info-value">
                {isAllDay ? "Ceo dan" : durationText(start, end)}
              </div>
            </div>

            {/* Vreme početka */}
            <div className="info-row">
              <div className="info-label">Početak</div>
              <div className="info-value">{isAllDay ? "—" : formatTime(start)}</div>
            </div>

            {/* Vreme završetka */}
            <div className="info-row">
              <div className="info-label">Kraj</div>
              <div className="info-value">{isAllDay ? "—" : formatTime(end)}</div>
            </div>

            {/* Lokacija */}
            <div className="info-row">
              <div className="info-label">Lokacija</div>
              <div className="info-value">{event.lokacija || "—"}</div>
            </div>

            {/* Status */}
            <div className="info-row">
              <div className="info-label">Status</div>
              <div className="info-value">{event.status || "planirano"}</div>
            </div>

            {/* Opis */}
            <div className="info-row info-span-2">
              <div className="info-label">Opis</div>
              <div className="info-value info-desc">{event.opis || "—"}</div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-outline" type="button" onClick={onClose}>
              Zatvori
            </button>

            <button
              className="btn-danger"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Brisanje..." : "Obriši"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
