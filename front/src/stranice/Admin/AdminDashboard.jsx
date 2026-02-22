import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./Admin.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatDateLabel(ymd) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}.${m}.`;
}

function pickNiceTicks(maxVal) {
  if (maxVal <= 0) return [0, 1, 2, 3, 4];
  const step = Math.ceil(maxVal / 4);
  return [0, step, step * 2, step * 3, step * 4];
}

function LineChart({ labels, values, height = 180 }) {
  const width = 920;
  const padding = 28;

  const maxVal = Math.max(0, ...(values || []));
  const ticks = pickNiceTicks(maxVal);

  const points = useMemo(() => {
    const n = values?.length || 0;
    if (!n) return [];

    const usableW = width - padding * 2;
    const usableH = height - padding * 2;

    const xStep = n === 1 ? 0 : usableW / (n - 1);

    return values.map((v, i) => {
      const x = padding + i * xStep;
      const yNorm = maxVal === 0 ? 0 : v / maxVal;
      const y = padding + (1 - yNorm) * usableH;
      return { x, y, v };
    });
  }, [values, height, maxVal]);

  const pathD = useMemo(() => {
    if (!points.length) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
  }, [points]);

  const lastLabel = labels?.[labels.length - 1] || "";
  const firstLabel = labels?.[0] || "";

  return (
    <div className="admin-chart">
      <div className="admin-chart-head">
        <div>
          <div className="admin-chart-title">Korisnici kroz vreme</div>
          <div className="admin-chart-sub">{firstLabel} — {lastLabel}</div>
        </div>

        <div className="admin-chart-legend">
          <span className="admin-chip">linija</span>
          <span className="admin-chip">po danu</span>
        </div>
      </div>

      <div className="admin-chart-body">
        {!points.length ? (
          <div className="admin-muted" style={{ padding: 14 }}>
            Nema podataka za prikaz.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            role="img"
            aria-label="Line chart"
          >
            {ticks.map((t) => {
              const yNorm = maxVal === 0 ? 0 : t / maxVal;
              const y = padding + (1 - yNorm) * (height - padding * 2);
              return (
                <g key={t}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(17,24,39,0.10)" />
                  <text x={6} y={y + 4} fontSize="12" fill="#6b7280">
                    {t}
                  </text>
                </g>
              );
            })}

            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(17,24,39,0.14)" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(17,24,39,0.14)" />

            <path d={pathD} fill="none" stroke="#111827" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

            {points.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#111827" />
            ))}

            {labels?.length ? (
              <>
                <text x={padding} y={height - 6} fontSize="12" fill="#6b7280">
                  {formatDateLabel(labels[0])}
                </text>
                <text x={width - padding} y={height - 6} fontSize="12" fill="#6b7280" textAnchor="end">
                  {formatDateLabel(labels[labels.length - 1])}
                </text>
              </>
            ) : null}
          </svg>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [summary, setSummary] = useState({
    users_total: 0,
    calendars_total: 0,
    events_total: 0,
    notifications_total: 0,
  });

  const [notif, setNotif] = useState({
    na_cekanju: 0,
    poslato: 0,
    greska: 0,
  });

  const [days, setDays] = useState(30);
  const [line, setLine] = useState({ labels: [], values: [] });

  const loadAll = async (daysArg) => {
    setLoading(true);
    setMessage("");

    try {
      const [sumRes, notifRes, lineRes] = await Promise.all([
        api.get("/admin/stats/summary"),
        api.get("/admin/stats/notifications-by-status"),
        api.get(`/admin/stats/users-over-time?days=${daysArg}`),
      ]);

      setSummary(sumRes.data?.data || summary);
      setNotif(notifRes.data?.data || notif);

      const labels = lineRes.data?.data?.labels || [];
      const values = (lineRes.data?.data?.series?.[0]?.data || []).map((x) => Number(x) || 0);

      setLine({ labels, values });
    } catch (err) {
      const firstError =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors)?.[0]?.[0]
          : null;

      setMessage(firstError || err.response?.data?.message || "Greška pri učitavanju admin statistika.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card admin-card-wide">
          <div className="admin-head">
            <div>
              <h2 className="auth-title" style={{ marginBottom: 4 }}>
                Admin panel
              </h2>
              <p className="auth-subtitle" style={{ margin: 0 }}>
                Pregled sistema, statistike i korisnici
              </p>
            </div>

            <div className="admin-head-actions">
              <Link className="btn-outline btn-link" to="/kalendari">
                Nazad na kalendare
              </Link>

              <Link className="btn-primary btn-link" to="/admin/users">
                Korisnici
              </Link>
            </div>
          </div>

          {loading && <p className="auth-subtitle calendar-loading">Učitavanje...</p>}
          {!loading && message && <div className="alert alert-error">{message}</div>}

          {!loading && !message && (
            <>
              <div className="admin-kpis">
                <div className="admin-kpi">
                  <div className="admin-kpi-label">Korisnici</div>
                  <div className="admin-kpi-value">{summary.users_total}</div>
                </div>
                <div className="admin-kpi">
                  <div className="admin-kpi-label">Kalendari</div>
                  <div className="admin-kpi-value">{summary.calendars_total}</div>
                </div>
                <div className="admin-kpi">
                  <div className="admin-kpi-label">Događaji</div>
                  <div className="admin-kpi-value">{summary.events_total}</div>
                </div>
                <div className="admin-kpi">
                  <div className="admin-kpi-label">Notifikacije</div>
                  <div className="admin-kpi-value">{summary.notifications_total}</div>
                </div>
              </div>

              <div className="admin-grid">
                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div className="admin-panel-title">Notifikacije po statusu</div>
                    <div className="admin-muted">ukupno u sistemu</div>
                  </div>

                  <div className="admin-badges">
                    <div className="admin-badge">
                      <div className="admin-badge-label">Na čekanju</div>
                      <div className="admin-badge-value">{notif.na_cekanju}</div>
                    </div>
                    <div className="admin-badge">
                      <div className="admin-badge-label">Poslato</div>
                      <div className="admin-badge-value">{notif.poslato}</div>
                    </div>
                    <div className="admin-badge">
                      <div className="admin-badge-label">Greška</div>
                      <div className="admin-badge-value">{notif.greska}</div>
                    </div>
                  </div>

                  <div className="admin-muted" style={{ marginTop: 10 }}>
                    Ovo je zgodno za admin monitoring (da li se mailovi gomilaju u na_cekanju).
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div className="admin-panel-title">Period za grafikon</div>
                    <div className="admin-muted">kroz koliko dana unazad</div>
                  </div>

                  <div className="admin-days">
                    <button
                      type="button"
                      className={`cal-switch-btn ${days === 7 ? "active" : ""}`}
                      onClick={() => setDays(7)}
                    >
                      7
                    </button>
                    <button
                      type="button"
                      className={`cal-switch-btn ${days === 30 ? "active" : ""}`}
                      onClick={() => setDays(30)}
                    >
                      30
                    </button>
                    <button
                      type="button"
                      className={`cal-switch-btn ${days === 90 ? "active" : ""}`}
                      onClick={() => setDays(90)}
                    >
                      90
                    </button>

                    <button type="button" className="btn-outline" onClick={() => loadAll(days)}>
                      Osveži
                    </button>
                  </div>

                  <div className="admin-muted" style={{ marginTop: 10 }}>
                    Linijski graf pokazuje koliko je korisnika registrovano po danu.
                  </div>
                </div>
              </div>

              <LineChart labels={line.labels} values={line.values} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}