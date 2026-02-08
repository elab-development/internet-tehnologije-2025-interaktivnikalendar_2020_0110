import { useMemo } from "react";

const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const jsDay = d.getDay(); // 0..6 (ned..sub)
  const offset = (jsDay + 6) % 7; // pon=0
  d.setDate(d.getDate() - offset);
  return d;
}

function makeMonthCells(viewDate, toYMD) {
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
    cells.push({
      date: d,
      key: toYMD(d),
      inMonth: d.getMonth() === month,
    });
  }

  return { year, month, cells };
}

function makeWeekDays(viewDate, toYMD) {
  const start = startOfWeek(viewDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ date: d, key: toYMD(d) });
  }
  return days;
}

export default function CalendarView({
  layout, // "month" | "week"
  viewDate,
  events,
  onDayClick,
  onEventClick,
  parseBackendDate,
  toYMD,
  getEventHeightPx,
}) {
  const todayKey = toYMD(new Date());

  // map: YYYY-MM-DD -> [events]
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const d = parseBackendDate(ev.pocetak);
      if (!d) continue;
      const key = toYMD(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }

    // sort inside each day: ceo_dan prvo, pa po pocetku
    for (const [, list] of map.entries()) {
      list.sort((a, b) => {
        const ac = a.ceo_dan ? 1 : 0;
        const bc = b.ceo_dan ? 1 : 0;
        if (ac !== bc) return bc - ac;

        const da = parseBackendDate(a.pocetak)?.getTime() ?? 0;
        const db = parseBackendDate(b.pocetak)?.getTime() ?? 0;
        return da - db;
      });
    }

    return map;
  }, [events, parseBackendDate, toYMD]);

  const monthData = useMemo(() => makeMonthCells(viewDate, toYMD), [viewDate, toYMD]);
  const weekDays = useMemo(() => makeWeekDays(viewDate, toYMD), [viewDate, toYMD]);

const renderEvent = (ev, dayKey) => {
  const start = parseBackendDate(ev.pocetak);

  // ako je ceo_dan -> ne prikazuj time pill, samo chip
  const time =
    !ev.ceo_dan && start ? `${pad2(start.getHours())}:${pad2(start.getMinutes())}` : "";

  const title = ev.naziv || "Događaj";
  const h = getEventHeightPx(ev);

  return (
    <button
      key={ev.id ?? `${dayKey}-${title}`}
      type="button"
      className={["cal-event", ev.ceo_dan ? "is-allday" : ""].join(" ")}
      style={{ ["--evh"]: `${h}px` }}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(ev);
      }}
      title={title}
    >
      <span className="cal-event-left">
        {/* time pill samo ako nije ceo_dan */}
        {time && <span className="cal-event-time">{time}</span>}
        <span className="cal-event-title">{title}</span>
      </span>

     
    </button>
  );
};


  if (layout === "week") {
    // WEEK VIEW: 7 kolona
    return (
      <div className="cal-week">
        <div className="cal-week-head">
          {weekDays.map((d, idx) => (
            <div key={d.key} className="cal-week-dow">
              <div className="cal-week-dow-name">{DAYS[idx]}</div>
              <div className={`cal-week-dow-date ${d.key === todayKey ? "is-today" : ""}`}>
                {d.date.getDate()}.
              </div>
            </div>
          ))}
        </div>

        <div className="cal-week-grid">
          {weekDays.map((d) => {
            const list = eventsByDay.get(d.key) || [];
            return (
              <div
                key={d.key}
                className={`cal-week-col ${d.key === todayKey ? "is-today" : ""}`}
                onClick={() => onDayClick(d.date)}
              >
                <div className="cal-week-events">
                  {list.slice(0, 10).map((ev) => renderEvent(ev, d.key))}
                  {list.length > 10 && <div className="cal-more">+{list.length - 10} još</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // MONTH VIEW
  return (
    <div className="cal-month">
      <div className="cal-grid">
        {DAYS.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}

        {monthData.cells.map((c) => {
          const list = eventsByDay.get(c.key) || [];
          return (
            <div
              key={c.key}
              className={[
                "cal-cell",
                c.inMonth ? "in-month" : "out-month",
                c.key === todayKey ? "is-today" : "",
              ].join(" ")}
              onClick={() => onDayClick(c.date)}
            >
              <div className="cal-cell-top">
                <span className="cal-daynum">{c.date.getDate()}</span>
                {list.length > 0 && <span className="cal-badge">{list.length}</span>}
              </div>

              <div className="cal-events">
                {list.slice(0, 4).map((ev) => renderEvent(ev, c.key))}
                {list.length > 4 && <div className="cal-more">+{list.length - 4} još</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
