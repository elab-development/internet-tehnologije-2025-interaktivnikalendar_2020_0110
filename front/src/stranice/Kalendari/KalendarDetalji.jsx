import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import EventModal from "../../komponente/Dogadjaj/EventModal";

const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYMD(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// backend može slati "2026-02-10 14:00:00" ili "2026-02-10T14:00:00Z"
function parseBackendDate(s) {
  if (!s) return null;
  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthLabel(year, monthIndex) {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString("sr-RS", { month: "long", year: "numeric" });
}

export default function KalendarDetalji() {
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // JS Date

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
  }, [id]);

  // grupiši događaje po danu koristeći POCETAK
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const d = parseBackendDate(ev.pocetak);
      if (!d) continue;
      const key = toYMD(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  // 6x7 grid
  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const jsDay = firstOfMonth.getDay(); // 0..6 (ned..sub)
    const startOffset = (jsDay + 6) % 7; // pon=0 ... ned=6

    const startDate = new Date(year, month, 1 - startOffset);

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const inMonth = d.getMonth() === month;
      const key = toYMD(d);
      const dayEvents = (eventsByDay.get(key) || []).slice();

      dayEvents.sort((a, b) => {
        const da = parseBackendDate(a.pocetak)?.getTime() ?? 0;
        const db = parseBackendDate(b.pocetak)?.getTime() ?? 0;
        return da - db;
      });

      cells.push({ date: d, inMonth, key, dayEvents });
    }

    return { year, month, cells };
  }, [viewDate, eventsByDay]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const todayKey = toYMD(new Date());

  const openDayModal = (dateObj) => {
    setSelectedDate(dateObj);
    setModalOpen(true);
  };

  const closeDayModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  const createEvent = async (payload) => {
    try {
      await api.post("/dogadjaji", payload);
      await load();
      return true;
    } catch (err) {
      // ovde samo javljamo false (modal ima svoj fallback message)
      console.error(err);
      return false;
    }
  };

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card" style={{ maxWidth: 900 }}>
          <div className="cal-header">
            <div>
              <h2 className="auth-title" style={{ marginBottom: 4 }}>
                Kalendar #{id}
              </h2>
              <p className="auth-subtitle" style={{ margin: 0 }}>
                {monthLabel(calendarCells.year, calendarCells.month)}
              </p>
            </div>

            <div className="cal-actions">
              <button className="btn-outline" type="button" onClick={prevMonth}>
                ← Prethodni
              </button>
              <button className="btn-outline" type="button" onClick={nextMonth}>
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
            <div className="cal-grid">
              {DAYS.map((d) => (
                <div key={d} className="cal-dow">
                  {d}
                </div>
              ))}

              {calendarCells.cells.map((c) => (
                <div
                  key={c.key}
                  onClick={() => openDayModal(c.date)}
                  className={[
                    "cal-cell",
                    c.inMonth ? "in-month" : "out-month",
                    c.key === todayKey ? "is-today" : "",
                  ].join(" ")}
                >
                  <div className="cal-cell-top">
                    <span className="cal-daynum">{c.date.getDate()}</span>
                    {c.dayEvents.length > 0 && (
                      <span className="cal-badge">{c.dayEvents.length}</span>
                    )}
                  </div>

                  <div className="cal-events">
                    {c.dayEvents.slice(0, 3).map((ev) => {
                      const d = parseBackendDate(ev.pocetak);
                      const time = d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}` : "";
                      const title = ev.naziv || "Događaj";

                      return (
                        <div key={ev.id ?? `${c.key}-${title}`} className="cal-event">
                          <span className="cal-event-time">{time}</span>
                          <span className="cal-event-title">{title}</span>
                        </div>
                      );
                    })}

                    {c.dayEvents.length > 3 && (
                      <div className="cal-more">+{c.dayEvents.length - 3} još</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <EventModal
            open={modalOpen}
            onClose={closeDayModal}
            kalendarId={id}
            selectedDate={selectedDate}
            onSubmit={createEvent}
          />
        </div>
      </div>
    </div>
  );
}
