import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios"; 
import EventInfoModal from "../../komponente/Dogadjaj/EventInfoModal";
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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Visina eventa u mesečnom gridu (nije pravi "time grid", ali izgleda kao trajanje).
 * - ceo_dan: visina ~ 64
 * - inače: 15min = 8px, min 26, max 72
 */
function getEventHeightPx(ev) {
  if (ev?.ceo_dan) return 64;

  const s = parseBackendDate(ev?.pocetak);
  const e = parseBackendDate(ev?.kraj);
  if (!s || !e) return 28;

  const minutes = Math.max(0, (e.getTime() - s.getTime()) / 60000);
  const px = Math.round((minutes / 15) * 8); // 15min -> 8px
  return clamp(px, 26, 72);
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
  }, [id]);

  // grupiši događaje po danu (po POCETAK)
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

      // sort: ceo_dan prvo, pa po pocetku
      dayEvents.sort((a, b) => {
        const ac = a.ceo_dan ? 1 : 0;
        const bc = b.ceo_dan ? 1 : 0;
        if (ac !== bc) return bc - ac;

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

  // open create modal (day click)
  const openDayModal = (dateObj) => {
    setSelectedDate(dateObj);
    setCreateOpen(true);
  };
  const closeDayModal = () => {
    setCreateOpen(false);
    setSelectedDate(null);
  };

  // open info modal (event click)
  const openEventInfo = (ev) => {
    setSelectedEvent(ev);
    setInfoOpen(true);
  };
  const closeEventInfo = () => {
    setInfoOpen(false);
    setSelectedEvent(null);
  };

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
                    {c.dayEvents.slice(0, 4).map((ev) => {
                      const start = parseBackendDate(ev.pocetak);
                      const time =
                        ev.ceo_dan
                          ? "Ceo dan"
                          : start
                          ? `${pad2(start.getHours())}:${pad2(start.getMinutes())}`
                          : "";

                      const title = ev.naziv || "Događaj";
                      const h = getEventHeightPx(ev);

                      return (
                        <button
                          key={ev.id ?? `${c.key}-${title}`}
                          type="button"
                          className={["cal-event", ev.ceo_dan ? "is-allday" : ""].join(" ")}
                          style={{ ["--evh"]: `${h}px` }}
                          onClick={(e) => {
                            e.stopPropagation(); // da ne otvori create modal
                            openEventInfo(ev);
                          }}
                          title={title}
                        >
                          <span className="cal-event-time">{time}</span>
                          <span className="cal-event-title">{title}</span>
                        </button>
                      );
                    })}

                    {c.dayEvents.length > 4 && (
                      <div className="cal-more">+{c.dayEvents.length - 4} još</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CREATE modal */}
          <EventModal
            open={createOpen}
            onClose={closeDayModal}
            kalendarId={id}
            selectedDate={selectedDate}
            onSubmit={createEvent}
          />

          {/* INFO modal */}
          <EventInfoModal
            open={infoOpen}
            onClose={closeEventInfo}
            event={selectedEvent}
            onDelete={deleteEvent}
          />
        </div>
      </div>
    </div>
  );
}
