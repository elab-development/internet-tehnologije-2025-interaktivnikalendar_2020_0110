import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./Admin.css";

/**
 * Google Charts loader (učita se jednom po stranici)
 */
function loadGoogleCharts() {
  return new Promise((resolve, reject) => {
    if (window.google?.charts) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[data-google-charts="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Charts load failed")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.async = true;
    script.dataset.googleCharts = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Charts load failed"));
    document.body.appendChild(script);
  });
}

/**
 * Google Line Chart komponenta (API za vizualizaciju)
 */
function GoogleLineChart({ labels, values }) {
  const chartId = "google-line-chart";

  const rows = useMemo(() => {
    const l = labels || [];
    const v = values || [];
    return l.map((label, i) => [String(label), Number(v[i] || 0)]);
  }, [labels, values]);

  useEffect(() => {
    let cancelled = false;

    const draw = async () => {
      try {
        await loadGoogleCharts();
        if (cancelled) return;

        window.google.charts.load("current", { packages: ["corechart"] });
        window.google.charts.setOnLoadCallback(() => {
          if (cancelled) return;

          const data = new window.google.visualization.DataTable();
          data.addColumn("string", "Datum");
          data.addColumn("number", "Broj korisnika");

          if (rows.length) data.addRows(rows);

          const firstLabel = labels?.[0] || "";
          const lastLabel = labels?.[labels.length - 1] || "";

          const options = {
            title: `Korisnici kroz vreme (${firstLabel} — ${lastLabel})`,
            curveType: "function",
            legend: { position: "bottom" },
            height: 320,
            chartArea: { left: 50, top: 60, right: 20, bottom: 60 },
            pointSize: 5,
          };

          const el = document.getElementById(chartId);
          if (!el) return;

          const chart = new window.google.visualization.LineChart(el);
          chart.draw(data, options);
        });
      } catch {
        // ako ne uspe loader, samo ostavi fallback poruku (dole)
      }
    };

    draw();

    const onResize = () => {
      // minimalno: samo ponovo nacrtaj na resize
      draw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [chartId, rows, labels]);

  return (
    <div className="admin-chart">
      <div className="admin-chart-head">
        <div>
          <div className="admin-chart-title">Korisnici kroz vreme</div>
          <div className="admin-chart-sub">
            Vizualizacija pomoću Google Charts API
          </div>
        </div>

        <div className="admin-chart-legend">
          <span className="admin-chip">Google</span>
          <span className="admin-chip">Line chart</span>
        </div>
      </div>

      <div className="admin-chart-body">
        {!rows.length ? (
          <div className="admin-muted" style={{ padding: 14 }}>
            Nema podataka za prikaz.
          </div>
        ) : (
          <div id={chartId} style={{ width: "100%" }} />
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
                    Linijski graf pokazuje koliko je korisnika registrovano po danu (Google Charts API).
                  </div>
                </div>
              </div>

              <GoogleLineChart labels={line.labels} values={line.values} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}