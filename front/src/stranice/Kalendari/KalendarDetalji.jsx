import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import CalendarView from "../../komponente/Kalendar/CalendarView";
import EventModal from "../../komponente/Dogadjaj/EventModal";
import EventInfoModal from "../../komponente/Dogadjaj/EventInfoModal";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYMD(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseBackendDate(s) {
  if (!s) return null;
  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthLabel(date) {
  return date.toLocaleDateString("sr-RS", { month: "long", year: "numeric" });
}

function weekLabel(date) {
  // label tipa: 08.02.2026. — 14.02.2026.
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const fmt = (d) => `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}.`;
  return `${fmt(start)} — ${fmt(end)}`;
}

function startOfWeek(date) {
  // ponedeljak kao start
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const jsDay = d.getDay(); // 0..6 (ned..sub)
  const offset = (jsDay + 6) % 7; // pon=0
  d.setDate(d.getDate() - offset);
  return d;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Visina eventa (mesečni grid): sugeriše trajanje.
 * - ceo_dan: 60px
 * - inače: 15min = 8px, min 28, max 90
 */
function getEventHeightPx(ev) {
  if (ev?.ceo_dan) return 60;

  const s = parseBackendDate(ev?.pocetak);
  const e = parseBackendDate(ev?.kraj);
  if (!s || !e) return 32;

  const minutes = Math.max(0, (e.getTime() - s.getTime()) / 60000);
  const px = Math.round((minutes / 15) * 8);
  return clamp(px, 28, 90);
}

export default function KalendarDetalji() {
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // layout: "month" | "week"
  const [layout, setLayout] = useState("month");

  // "anchor" datum za prikaz (za mesec: prvi u mesecu, za nedelju: bilo koji u toj nedelji)
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // CREATE modal
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // INFO modal
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.get(`/kalendari/${id}/dogadjaji`);
      const list = res.data.data || [];
      setEvents(list);
      if (list.length === 0) setMessage(res.data.message || "");
    } catch (err) {
      setMessage(err.response?.data?.message || "Greška pri učitavanju događaja.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const createEvent = async (payload) => {
    try {
      await api.post("/dogadjaji", payload);
      await load();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/dogadjaji/${eventId}`);
      await load();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Klik na dan -> otvori CREATE modal
  const onDayClick = (dateObj) => {
    setSelectedDate(dateObj);
    setCreateOpen(true);
  };

  // Klik na event -> otvori INFO modal (bez edit)
  const onEventClick = (ev) => {
    setSelectedEvent(ev);
    setInfoOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setSelectedDate(null);
  };

  const closeInfo = () => {
    setInfoOpen(false);
    setSelectedEvent(null);
  };

  const prev = () => {
    setViewDate((d) => {
      if (layout === "week") {
        const nd = new Date(d);
        nd.setDate(nd.getDate() - 7);
        return nd;
      }
      return new Date(d.getFullYear(), d.getMonth() - 1, 1);
    });
  };

  const next = () => {
    setViewDate((d) => {
      if (layout === "week") {
        const nd = new Date(d);
        nd.setDate(nd.getDate() + 7);
        return nd;
      }
      return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    });
  };

  const headerLabel = layout === "week" ? weekLabel(viewDate) : monthLabel(viewDate);

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card" style={{ maxWidth: 980 }}>
          <div className="cal-header">
            <div>
              <h2 className="auth-title" style={{ marginBottom: 4 }}>
                Kalendar #{id}
              </h2>
              <p className="auth-subtitle" style={{ margin: 0 }}>
                {headerLabel}
              </p>
            </div>

            <div className="cal-actions">
              {/* layout switch */}
              <div className="cal-switch">
                <button
                  type="button"
                  className={`cal-switch-btn ${layout === "month" ? "active" : ""}`}
                  onClick={() => {
                    setLayout("month");
                    // za mesec je lepše da je viewDate na 1. u mesecu
                    setViewDate((d) => new Date(d.getFullYear(), d.getMonth(), 1));
                  }}
                >
                  Mesec
                </button>
                <button
                type="button"
                className={`cal-switch-btn ${layout === "week" ? "active" : ""}`}
                onClick={() => {
                    setLayout("week");
                    // kada pređeš na nedelju, idi na današnji dan (tj. današnju nedelju)
                    setViewDate(new Date());
                }}
                >
                Nedelja
                </button>
              </div>

              <button className="btn-outline" type="button" onClick={prev}>
                ← Prethodni
              </button>
              <button className="btn-outline" type="button" onClick={next}>
                Sledeći →
              </button>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <Link className="btn-outline btn-link" to="/kalendari">
              Nazad na moje kalendare
            </Link>
          </div>

          {loading && <p className="auth-subtitle calendar-loading">Učitavanje...</p>}
          {!loading && message && <div className="alert alert-error">{message}</div>}

          {!loading && (
            <CalendarView
              layout={layout}
              viewDate={viewDate}
              events={events}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
              parseBackendDate={parseBackendDate}
              toYMD={toYMD}
              getEventHeightPx={getEventHeightPx}
            />
          )}

          {/* CREATE modal */}
          <EventModal
            open={createOpen}
            onClose={closeCreate}
            kalendarId={id}
            selectedDate={selectedDate}
            onSubmit={createEvent}
          />

          {/* INFO modal */}
          <EventInfoModal
            open={infoOpen}
            onClose={closeInfo}
            event={selectedEvent}
            onDelete={deleteEvent}
          />
        </div>
      </div>
    </div>
  );
}
