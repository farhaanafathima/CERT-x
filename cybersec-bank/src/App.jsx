
import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
const API = "http://127.0.0.1:8000";
function App() {
  const [page, setPage] = useState("dashboard");
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const loadAlerts = async () => {
    try {
      const response = await fetch(
        `${API}/api/security-officer/alerts`
      );
      if (!response.ok) {
        throw new Error("API failed");
      }
      const data = await response.json();
      setAlerts(
        Array.isArray(data.alerts)
          ? data.alerts
          : []
      );
      setApiError(false);
    } catch (error) {
      console.error(error);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };
  const loadHistory = async () => {
    try {
      const response = await fetch(`${API}/api/security-officer/activity`);
      if (!response.ok) {
        throw new Error("History API failed");
      }
      const data = await response.json();
      setHistory(
        Array.isArray(data.activity)
          ? data.activity
          : []
      );
    } catch (error) {
      console.error("History loading error:", error);
    }
  };
  
  useEffect(() => {
    loadAlerts();
    loadHistory();
    const interval = setInterval(
      loadAlerts,
      5000
    );
    return () => clearInterval(interval);
  }, []);
  const activeAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          alert.status !== "RESOLVED"
      ),
    [alerts]
  );
  const highRiskAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          Number(alert.risk_score) >= 80
      ),
    [alerts]
  );
  const averageRisk = useMemo(() => {
    if (!alerts.length) return 0;
    const total = alerts.reduce(
      (sum, alert) =>
        sum +
        Number(alert.risk_score || 0),
      0
    );
    return Math.round(
      total / alerts.length
    );
  }, [alerts]);
  const uniqueEmployees = useMemo(() => {
    return new Set(
      alerts
        .map(
          (alert) =>
            alert.employee_id
        )
        .filter(Boolean)
    ).size;
  }, [alerts]);
  const resolveAlert = async (id) => {
    try {
      const endpoints = [
        `${API}/api/security-officer/alerts/${id}/resolve`,
        `${API}/api/security-officer/alerts/${id}`,
      ];
      let success = false;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(
            endpoint,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );
          if (response.ok) {
            success = true;
            break;
          }
        } catch (error) {
          console.error(error);
        }
      }
      if (success) {
        await loadAlerts();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "n",
      badge: 0,
    },
    {
      id: "alerts",
      label: "Live Alerts",
      icon: "!",
      badge: activeAlerts.length,
    },
    {
      id: "activity",
      label: "Activity",
      icon: "n",
      badge: 0,
    },
    {
      id: "history",
      label: "History",
      icon: "n",
      badge: 0,
    },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img
            src="/certx-logo.jpeg"
            alt="Cert X Logo"
            className="brand-logo"
          />
          <div className="brand-text">
            <h1>Cert X</h1>
            <span>Security Center</span>
          </div>
        </div>
        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                page === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setPage(item.id)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>
              <span className="nav-label">
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className="alert-badge">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="officer">
            <div className="officer-avatar">
              SO
            </div>
            <div>
              <strong>
                Security Officer
              </strong>
              <span>
                Monitoring System
              </span>
            </div>
          </div>
          <div className="online-status">
            <span className="online-dot"></span>
            System Online
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="section-label">
            SECURITY OPERATIONS
          </div>
          <div className="system-status">
            <span className="online-dot"></span>
            System Online
          </div>
        </header>
        {page === "dashboard" && (
          <Dashboard
            alerts={alerts}
            activeAlerts={activeAlerts}
            highRiskAlerts={highRiskAlerts}
            averageRisk={averageRisk}
            uniqueEmployees={
              uniqueEmployees
            }
            loading={loading}
            apiError={apiError}
            setPage={setPage}
            resolveAlert={resolveAlert}
          />
        )}
        {page === "alerts" && (
          <AlertsPage
            alerts={alerts}
            activeAlerts={activeAlerts}
            loading={loading}
            apiError={apiError}
            resolveAlert={resolveAlert}
          />
        )}
        {page === "activity" && (
          <ActivityPage
            alerts={alerts}
            uniqueEmployees={
              uniqueEmployees
            }
            loading={loading}
          />
        )}
        {page === "history" && (
          <HistoryPage history={history} loading={loading} />
        )}
        <footer>
          <span>
            Cert X Security Monitoring System
          </span>
          <span>•</span>
          <span>
            Real-time protection enabled
          </span>
        </footer>
      </main>
    </div>
  );
}
/* =========================================================
   DASHBOARD
   ========================================================= */
function Dashboard({
  alerts,
  activeAlerts,
  highRiskAlerts,
  averageRisk,
  uniqueEmployees,
  loading,
  apiError,
  setPage,
  resolveAlert,
}) {
  return (
    <section className="page">
      <PageHeader
        title="Security Officer Dashboard"
        subtitle="Real-time digital signature security monitoring"
      />
      {apiError && (
        <div className="api-warning">
          <span>!</span>
          Unable to connect to security monitoring API.
        </div>
      )}
      <div className="stats-grid">
        <StatCard
          title="FILES VERIFIED"
          value={alerts.length}
          subtitle="Last 24 hours"
        />
        <StatCard
          title="EMPLOYEES ACTIVE"
          value={uniqueEmployees || 0}
          subtitle="Detected activity"
        />
        <StatCard
          title="HIGH RISK"
          value={highRiskAlerts.length}
          subtitle="Requires attention"
          danger
        />
        <StatCard
          title="AVERAGE RISK"
          value={averageRisk}
          subtitle="Current alerts"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel alerts-panel">
          <PanelHeader
            title="Live Security Alerts"
            subtitle="High-risk activity detected by Cert X"
            action={
              <button
                className="count-pill"
                onClick={() =>
                  setPage("alerts")
                }
              >
                {activeAlerts.length} Active
              </button>
            }
          />
          {loading ? (
            <Loading />
          ) : activeAlerts.length === 0 ? (
            <EmptyState
              icon="3"
              title="No active security alerts"
              text="The security monitoring system has no unresolved high-risk events."
            />
          ) : (
            <AlertCard
              alert={activeAlerts[0]}
              resolveAlert={
                resolveAlert
              }
            />
          )}
        </section>
        <section className="panel risk-panel">
          <PanelHeader
            title="Risk Overview"
            subtitle="Current threat assessment"
          />
          <div className="risk-circle">
            <div>
              <strong>
                {averageRisk}
              </strong>
              <span>Risk Score</span>
            </div>
          </div>
          <div className="monitoring-active">
            <span className="online-dot"></span>
            Monitoring Active
          </div>
          <div className="risk-mini-grid">
            <div>
              <span>High Risk</span>
              <strong>
                {highRiskAlerts.length}
              </strong>
            </div>
            <div>
              <span>Total Alerts</span>
              <strong>
                {alerts.length}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
/* =========================================================
   ALERTS
   ========================================================= */
function AlertsPage({
  alerts,
  activeAlerts,
  loading,
  apiError,
  resolveAlert,
}) {
  return (
    <section className="page">
      <PageHeader
        title="Security Alerts"
        subtitle="Real-time digital signature security monitoring"
      />
      {apiError && (
        <div className="api-warning">
          <span>!</span>
          Security API is currently unavailable.
        </div>
      )}
      <section className="panel full-panel">
        <PanelHeader
          title="Security Alerts"
          subtitle="High-risk events requiring security officer review"
          action={
            <div className="active-pill">
              {activeAlerts.length} Active
            </div>
          }
        />
        {loading ? (
          <Loading />
        ) : alerts.length === 0 ? (
          <EmptyState
            icon="3"
            title="No security alerts"
            text="No suspicious activity has been detected."
          />
        ) : (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                resolveAlert={
                  resolveAlert
                }
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
/* =========================================================
   ACTIVITY
   ========================================================= */
function ActivityPage({
  alerts,
  uniqueEmployees,
  loading,
}) {
  const activityRows =
    alerts.length > 0
      ? alerts.map((alert) => ({
          time: formatDate(
            alert.created_at
          ),
          employee:
            alert.employee_id ||
            "Unknown",
          files: 1,
          highRisk:
            Number(
              alert.risk_score
            ) >= 80
              ? 1
              : 0,
          status:
            Number(
              alert.risk_score
            ) >= 80
              ? "HIGH RISK"
              : "NORMAL",
        }))
      : [
          {
            time: "—",
            employee:
              uniqueEmployees
                ? "EMP001"
                : "—",
            files: 0,
            highRisk: 0,
            status: "NORMAL",
          },
        ];
  return (
    <section className="page">
      <PageHeader
        title="Security Activity"
        subtitle="Real-time digital signature security monitoring"
      />
      <section className="panel full-panel">
        <PanelHeader
          title="Security Activity"
          subtitle="Employee verification and document access activity"
          action={
            <span className="table-label">
              24-HOUR ACTIVITY
            </span>
          }
        />
        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="security-table">
              <thead>
                <tr>
                  <th>DATE / TIME</th>
                  <th>EMPLOYEE</th>
                  <th>FILES CHECKED</th>
                  <th>HIGH RISK</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {activityRows.map(
                  (row, index) => (
                    <tr key={index}>
                      <td>{row.time}</td>
                      <td>
                        <strong>
                          {row.employee}
                        </strong>
                      </td>
                      <td>{row.files}</td>
                      <td
                        className={
                          row.highRisk
                            ? "risk-number"
                            : ""
                        }
                      >
                        {row.highRisk}
                      </td>
                      <td>
                        <StatusBadge
                          status={
                            row.status ===
                            "HIGH RISK"
                              ? "HIGH"
                              : "NORMAL"
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
/* =========================================================
   HISTORY
   ========================================================= */
function HistoryPage({
  history,
  loading,
}) {
  return (
    <section className="page">
      <PageHeader
        title="Security History"
        subtitle="Historical verification and security monitoring records"
      />
      <section className="panel full-panel">
        <PanelHeader
          title="Security History"
          subtitle="All verification activity records"
          action={
            <span className="table-label">
              ACTIVITY HISTORY
            </span>
          }
        />
        {loading ? (
          <Loading />
        ) : history.length === 0 ? (
          <EmptyState
            icon="¤"
            title="No history available"
            text="Security verification records will appear here."
          />
        ) : (
          <div className="table-wrap">
            <table className="security-table">
              <thead>
                <tr>
                  <th>DATE / TIME</th>
                  <th>EMPLOYEE</th>
                  <th>FILE</th>
                  <th>RISK</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const risk = Number(record.risk_score || 0);
                  const status =
                    record.risk_level ||
                    (risk > 50
                      ? "HIGH"
                      : risk > 25
                      ? "MEDIUM"
                      : "LOW");
                  return (
                    <tr key={record.id || index}>
                      <td>
                        {formatDate(
                          record.created_at ||
                          record.timestamp
                        )}
                      </td>
                      <td>
                        <strong>
                          {record.employee_id || "Unknown"}
                        </strong>
                      </td>
                      <td className="file-name">
                        {record.filename || "Unknown file"}
                      </td>
                      <td>{risk}</td>
                      <td>
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
function PageHeader({
  title,
  subtitle,
}) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
function PanelHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="panel-header">
      <div>
        <h3>{title}</h3>
        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
function StatCard({
  title,
  value,
  subtitle,
  danger,
}) {
  return (
    <div
      className={`stat-card ${
        danger
          ? "danger-card"
          : ""
      }`}
    >
      <span className="stat-title">
        {title}
      </span>
      <strong>{value}</strong>
      <span className="stat-subtitle">
        {subtitle}
      </span>
    </div>
  );
}
function AlertCard({
  alert,
  resolveAlert,
}) {
  const isResolved =
    alert.status ===
    "RESOLVED";
  return (
    <article
      className={`alert-card ${
        isResolved
          ? "resolved"
          : ""
      }`}
    >
      <div className="alert-top">
        <div className="alert-heading">
          <div className="alert-icon">
            !
          </div>
          <div>
            <strong>
              {Number(
                alert.risk_score
              ) >= 80
                ? "HIGH RISK ACTIVITY"
                : "SECURITY ACTIVITY"}
            </strong>
            <span className="alert-reason">
              {alert.reason ||
                "Security event detected"}
            </span>
          </div>
        </div>
        <div className="score">
          <span>Score</span>
          <strong>
            {alert.risk_score ?? 0}
          </strong>
        </div>
      </div>
      <div className="alert-details">
        <div>
          <span>Employee</span>
          <strong>
            {alert.employee_id ||
              "Unknown"}
          </strong>
        </div>
        <div>
          <span>File</span>
          <strong>
            {alert.filename ||
              "Unknown file"}
          </strong>
        </div>
        <div>
          <span>Detected</span>
          <strong>
            {formatDate(
              alert.created_at
            )}
          </strong>
        </div>
      </div>
      <div className="alert-bottom">
        <StatusBadge
          status={
            isResolved
              ? "RESOLVED"
              : "NEW"
          }
        />
        {!isResolved && (
          <button
            className="resolve-button"
            onClick={() =>
              resolveAlert(
                alert.id
              )
            }
          >
            Resolve Alert
          </button>
        )}
      </div>
    </article>
  );
}
function StatusBadge({
  status,
}) {
  const normalized =
    String(status).toUpperCase();
  return (
    <span
      className={`status-badge ${normalized.toLowerCase()}`}
    >
      {normalized}
    </span>
  );
}
function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Loading() {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <span>
        Loading security data...
      </span>
    </div>
  );
}
function formatDate(date) {
  if (!date) return "—";
  const parsed =
    new Date(date);
  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }
  return parsed.toLocaleString();
}
export default App;