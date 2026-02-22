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

/**  Backend format: YYYY-MM-DD HH:mm:ss */
function toBackendString(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(
    d.getMinutes()
  )}:${pad2(d.getSeconds())}`;
}

function monthLabel(date) {
  return date.toLocaleDateString("sr-RS", { month: "long", year: "numeric" });
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const jsDay = d.getDay(); // 0..6 (ned..sub)
  const offset = (jsDay + 6) % 7; // pon=0
  d.setDate(d.getDate() - offset);
  return d;
}

function weekLabel(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const fmt = (d) => `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}.`;
  return `${fmt(start)} — ${fmt(end)}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getEventHeightPx(ev) {
  if (ev?.ceo_dan) return 60;

  const s = parseBackendDate(ev?.pocetak);
  const e = parseBackendDate(ev?.kraj);
  if (!s || !e) return 32;

  const minutes = Math.max(0, (e.getTime() - s.getTime()) / 60000);
  const px = Math.round((minutes / 15) * 8);
  return clamp(px, 28, 90);
}

/** ===== ICS helpers ===== **/

function escapeICSText(value) {
  if (value == null) return "";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatICSLocal(date) {
  return (
    `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
  );
}

function formatICSUTC(date) {
  const d = new Date(date.getTime());
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  );
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function buildVEvent(ev, { calendarName = "Kalendar", calendarId = "" } = {}) {
  const title = ev?.naziv ?? ev?.title ?? "Događaj";
  const description = ev?.opis ?? ev?.description ?? "";
  const location = ev?.lokacija ?? ev?.location ?? "";

  const start = parseBackendDate(ev?.pocetak);
  const end = parseBackendDate(ev?.kraj);

  const uid = escapeICSText(`${calendarId || "cal"}-${ev?.id ?? title}-${ev?.pocetak ?? ""}@app`);
  const dtstamp = formatICSUTC(new Date());

  const isAllDay = !!ev?.ceo_dan;

  let dtstartLine = "";
  let dtendLine = "";

  if (isAllDay) {
    if (!start) return "";

    const ymd = `${start.getFullYear()}${pad2(start.getMonth() + 1)}${pad2(start.getDate())}`;
    dtstartLine = `DTSTART;VALUE=DATE:${ymd}`;

    let endDate = end ? new Date(end) : new Date(start);
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    if (!end || endDate.getTime() <= startDate.getTime()) {
      endDate = addDays(startDate, 1);
    } else {
      endDate = addDays(endDate, 1);
    }

    const endYMD = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}`;
    dtendLine = `DTEND;VALUE=DATE:${endYMD}`;
  } else {
    if (!start) return "";

    dtstartLine = `DTSTART:${formatICSLocal(start)}`;

    const endFixed =
      end && end.getTime() >= start.getTime()
        ? end
        : new Date(start.getTime() + 60 * 60 * 1000);

    dtendLine = `DTEND:${formatICSLocal(endFixed)}`;
  }

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${escapeICSText(title)}`,
    description ? `DESCRIPTION:${escapeICSText(description)}` : null,
    location ? `LOCATION:${escapeICSText(location)}` : null,
    dtstartLine,
    dtendLine,
    `CATEGORIES:${escapeICSText(calendarName)}`,
    "END:VEVENT",
  ].filter(Boolean);

  return lines.join("\r\n");
}

function buildICS(events, { calendarName = "Kalendar", calendarId = "" } = {}) {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ITEH//Kalendar Export//SR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICSText(calendarName)}`,
  ].join("\r\n");

  const body = (events || [])
    .map((ev) => buildVEvent(ev, { calendarName, calendarId }))
    .filter(Boolean)
    .join("\r\n");

  const footer = "END:VCALENDAR";
  return [header, body, footer].filter((x) => x !== "").join("\r\n") + "\r\n";
}

function downloadTextFile(filename, content, mime = "text/calendar;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Normalizacija repeat polja da Laravel validacija ne pukne */
function normalizeRepeat(ev) {
  const ponavljajuci = !!ev?.ponavljajuci;

  if (!ponavljajuci) {
    return {
      ponavljajuci: false,
      period_ponavljanja: null,
      ponavlja_se_do: null,
    };
  }

  const raw = (ev?.period_ponavljanja ?? "").toString().trim().toLowerCase();

  const map = {
    dnevno: "dnevno",
    nedeljno: "nedeljno",
    mesecno: "mesecno",
    godisnje: "godisnje",

    // često FE/DB varijante
    daily: "dnevno",
    weekly: "nedeljno",
    monthly: "mesecno",
    yearly: "godisnje",
    annual: "godisnje",
    annually: "godisnje",
  };

  const period = map[raw] ?? null;

  // ponavlja_se_do treba da bude date; ako dolazi kao string - ostavi, ako je Date - formatiraj
  let ponavljaSeDo = ev?.ponavlja_se_do ?? null;
  if (ponavljaSeDo instanceof Date) {
    ponavljaSeDo = toBackendString(ponavljaSeDo);
  } else if (typeof ponavljaSeDo === "string") {
    ponavljaSeDo = ponavljaSeDo.trim() || null;
  }

  // Ako je ponavljajući, a period nije dobar -> POŠALJI null da vidimo tačnu backend grešku u UI (ili setuj default)
  // Ja ovde stavljam default "nedeljno" da DnD ne puca.
  return {
    ponavljajuci: true,
    period_ponavljanja: period ?? "nedeljno",
    ponavlja_se_do: ponavljaSeDo,
  };
}

export default function KalendarDetalji() {
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [layout, setLayout] = useState("month");
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [draggingEventId, setDraggingEventId] = useState(null);

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

  const onDayClick = (dateObj) => {
    setSelectedDate(dateObj);
    setCreateOpen(true);
  };

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
  const calendarName = useMemo(() => `Kalendar #${id}`, [id]);

  const exportAllICS = () => {
    const ics = buildICS(events, { calendarName, calendarId: id });
    downloadTextFile(`kalendar-${id}.ics`, ics);
  };

  const exportSingleEventICS = (ev) => {
    const ics = buildICS([ev], { calendarName, calendarId: id });

    const titleSafe = (ev?.naziv ?? ev?.title ?? "dogadjaj")
      .toString()
      .trim()
      .replace(/[^\p{L}\p{N}\-_ ]/gu, "");

    const key = ev?.id ?? titleSafe;
    const fileKey = key || "1";

    downloadTextFile(`dogadjaj-${fileKey}.ics`, ics);
  };

  const moveEventToDatePersist = async (eventId, targetDate) => {
    const ev = events.find((x) => String(x.id) === String(eventId));
    if (!ev) return;

    const s = parseBackendDate(ev.pocetak);
    const e = parseBackendDate(ev.kraj);
    if (!s || !e) return;

    const isAllDay = !!ev.ceo_dan;
    const durationMs = Math.max(0, e.getTime() - s.getTime());

    const newStart = new Date(targetDate);
    if (isAllDay) newStart.setHours(0, 0, 0, 0);
    else newStart.setHours(s.getHours(), s.getMinutes(), s.getSeconds(), 0);

    const newEnd = new Date(newStart.getTime() + durationMs);

    const newStartStr = toBackendString(newStart);
    const newEndStr = toBackendString(newEnd);

    const prevEvents = [...events];

    // optimistic UI
    setEvents((prev) =>
      prev.map((x) =>
        String(x.id) === String(eventId) ? { ...x, pocetak: newStartStr, kraj: newEndStr } : x
      )
    );

    try {
      const repeat = normalizeRepeat(ev);

      const payload = {
        kalendar_id: Number(id),
        naziv: ev.naziv ?? "Događaj",
        opis: ev.opis ?? null,
        lokacija: ev.lokacija ?? null,
        pocetak: newStartStr,
        kraj: newEndStr,
        ceo_dan: !!ev.ceo_dan,
        status: ev.status ?? "planirano",
 
        ponavljajuci: repeat.ponavljajuci,
        period_ponavljanja: repeat.period_ponavljanja,
        ponavlja_se_do: repeat.ponavlja_se_do,
      };

      await api.put(`/dogadjaji/${eventId}`, payload);
      setMessage("");
    } catch (err) {
      console.error("PUT /dogadjaji failed:", err.response?.data || err);

      const firstError =
        err.response?.data?.errors ? Object.values(err.response.data.errors)?.[0]?.[0] : null;

      setMessage(firstError || err.response?.data?.message || "Greška pri čuvanju promene (drag & drop).");
      setEvents(prevEvents);
    }
  };

  const onEventDragStart = (eventId) => {
    setDraggingEventId(eventId);
  };

  const onDayDrop = async (dateObj) => {
    if (!draggingEventId) return;
    const idToMove = draggingEventId;
    setDraggingEventId(null);
    await moveEventToDatePersist(idToMove, dateObj);
  };

  const onEventDragEnd = () => {
    setDraggingEventId(null);
  };

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
              <div className="cal-switch">
                <button
                  type="button"
                  className={`cal-switch-btn ${layout === "month" ? "active" : ""}`}
                  onClick={() => {
                    setLayout("month");
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

              <button className="btn-outline" type="button" onClick={exportAllICS} title="Export svih događaja u .ics">
                Export .ics
              </button>
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn-outline btn-link" to="/kalendari">
              Nazad na moje kalendare
            </Link>

            {draggingEventId && (
              <span className="auth-subtitle" style={{ margin: 0 }}>
                Prevlačiš događaj #{draggingEventId}…
              </span>
            )}
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
              onEventDragStart={onEventDragStart}
              onEventDragEnd={onEventDragEnd}
              onDayDrop={onDayDrop}
              draggingEventId={draggingEventId}
            />
          )}

          <EventModal
            open={createOpen}
            onClose={closeCreate}
            kalendarId={id}
            selectedDate={selectedDate}
            onSubmit={createEvent}
          />

          <EventInfoModal
            open={infoOpen}
            onClose={closeInfo}
            event={selectedEvent}
            onDelete={deleteEvent}
            onExportICS={exportSingleEventICS}
          />
        </div>
      </div>
    </div>
  );
}