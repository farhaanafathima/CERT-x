import React, { useEffect, useState } from "react";
import "./CertX.css";

const API = "http://127.0.0.1:8000";

const CERTX_USERNAME = "CertX";
const CERTX_PASSWORD = "CertX@123";

function CertXApp({
  bankUser,
  onBackToBank,
  onLogout,
}) {
  const [loggedIn, setLoggedIn] = useState(false);

  const [username, setUsername] = useState("CertX");
  const [password, setPassword] = useState("CertX@123");
  const [error, setError] = useState("");

  const [page, setPage] = useState("dashboard");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ============================================================
  // CERT X LOGIN
  // ============================================================

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");

    if (
      username === CERTX_USERNAME &&
      password === CERTX_PASSWORD
    ) {
      setLoggedIn(true);
      setPage("dashboard");
    } else {
      setError("Invalid Cert X username or password.");
    }
  };

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    const savedHistory = localStorage.getItem(
      "certx_verification_history"
    );

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // ============================================================
  // SAVE HISTORY
  // ============================================================

  const saveToHistory = (verification) => {
    const item = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      ...verification,
    };

    const updated = [item, ...history];

    setHistory(updated);

    localStorage.setItem(
      "certx_verification_history",
      JSON.stringify(updated)
    );
  };

  // ============================================================
  // PDF UPLOAD + BACKEND VERIFICATION
  // ============================================================

  const handlePDFUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a PDF file.");
      return;
    }

    setSelectedFile(file);
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append(
        "employee_id",
        bankUser || "EMP001"
      );

      formData.append("file", file);

      const response = await fetch(
        `${API}/api/verify`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Verification failed."
        );
      }

      if (!data.success) {
        throw new Error(
          data.error ||
            "Cert X could not verify the PDF."
        );
      }

      setResult(data);

      saveToHistory(data);

      setPage("dashboard");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to Cert X Security API."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EXPORT REPORT
  // ============================================================

  const exportReport = () => {
    if (!result) {
      alert("No verification result available.");
      return;
    }

    const documentInfo = result.document || {};
    const signature = result.signature || {};
    const signer = result.signer || {};
    const authorization = result.authorization || {};
    const hash = result.hash_analysis || {};
    const security = result.document_security || {};
    const quantum = result.quantum_analysis || {};
    const behaviour = result.behaviour_analysis || {};
    const threat = result.threat || {};

    const report = `
====================================================
                    CERT X
          VERIFICATION SECURITY REPORT
====================================================

Document
----------------------------------------------------
Filename          : ${documentInfo.filename || "-"}
File Type         : ${documentInfo.file_type || "-"}
Size              : ${documentInfo.size_bytes || "-"} bytes
SHA-256           : ${documentInfo.sha256 || "-"}

Digital Signature
----------------------------------------------------
Signature Found   : ${signature.found ? "YES" : "NO"}
Signature Valid   : ${signature.valid ? "VALID" : "INVALID"}
Integrity         : ${signature.integrity ? "VALID" : "FAILED"}
Certificate Trust : ${
      signature.certificate_trusted
        ? "TRUSTED"
        : "NOT TRUSTED"
    }

Signer
----------------------------------------------------
Identity Status   : ${signer.identity_status || "-"}
Signer Name      : ${signer.signer_name || "-"}
Organization      : ${signer.organization || "-"}

Authorization
----------------------------------------------------
Identity Match    : ${authorization.identity_match || "-"}
Organization Match: ${
      authorization.organization_match || "-"
    }
Role Permission   : ${authorization.role_permission || "-"}
Overall Status     : ${
      authorization.overall_status || "-"
    }

Document Security
----------------------------------------------------
Tampering Detected: ${
      security.tampering_detected ? "YES" : "NO"
    }

Hash Analysis
----------------------------------------------------
Algorithm         : ${hash.algorithm || "SHA-256"}
Hash              : ${hash.hash || "-"}
Status            : ${hash.status || "-"}

Quantum-Inspired Analysis
----------------------------------------------------
Method            : ${quantum.method || "-"}
Status            : ${quantum.status || "-"}
Optimized Risk    : ${
      quantum.optimized_risk_score ?? "-"
    }
Risk Priority     : ${quantum.risk_priority || "-"}
Explanation       : ${quantum.explanation || "-"}

Behaviour Analysis
----------------------------------------------------
Status            : ${behaviour.status || "-"}
Previous Checks   : ${
      behaviour.total_previous_checks ?? "-"
    }
High Risk Checks  : ${
      behaviour.high_risk_previous_checks ?? "-"
    }
High Risk Ratio   : ${behaviour.high_risk_ratio ?? "-"}
Behaviour Status  : ${
      behaviour.behaviour_status || "-"
    }

Threat Analysis
----------------------------------------------------
Threat Score      : ${threat.score ?? "-"}
Threat Level      : ${threat.level || "-"}
Alert Required    : ${
      threat.alert_required ? "YES" : "NO"
    }

Threat Reasons
----------------------------------------------------
${
      Array.isArray(threat.reasons)
        ? threat.reasons.join("\n")
        : "-"
    }

Security Officer Alert
----------------------------------------------------
Triggered         : ${
      result.security_officer_alert?.triggered
        ? "YES"
        : "NO"
    }

Alert ID          : ${
      result.security_officer_alert?.alert_id || "-"
    }

Severity          : ${
      result.security_officer_alert?.severity || "-"
    }

====================================================
Generated by Cert X Security Center
====================================================
`;

    const blob = new Blob(
      [report],
      {
        type: "text/plain",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `${
      documentInfo.filename || "document"
    }_CertX_Report.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // VIEW HISTORY ITEM
  // ============================================================

  const viewHistory = (item) => {
    setResult(item);
    setPage("dashboard");
  };

  // ============================================================
  // CERT X LOGIN SCREEN
  // ============================================================

  if (!loggedIn) {
    return (
      <div className="certx-login-page">

        <div className="certx-login-card">

          {/* CERT X LOGO */}
          <div className="certx-login-logo">
            <img
              src="/certx-logo.jpeg"
              alt="Cert X Logo"
            />
          </div>

          <div className="certx-login-brand">
            <h1>Cert X</h1>

            <p>
              Digital Signature Security Center
            </p>
          </div>

          <div className="certx-login-security">
            <span>●</span>
            Secure Verification Environment
          </div>

          <form
            onSubmit={handleLogin}
            className="certx-login-form"
          >

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {error && (
              <div className="certx-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="certx-login-button"
            >
              Login
              <span>→</span>
            </button>

          </form>

          <div className="certx-demo-credentials">

            <span>
              Demo Credentials
            </span>

            <strong>
              CertX / CertX@123
            </strong>

          </div>

          <button
            className="certx-back-bank"
            onClick={onBackToBank}
          >
            ← Back to CyberSec Bank
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // CERT X MAIN APPLICATION
  // ============================================================

  return (
    <div className="certx-app">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="certx-sidebar">

        <div className="certx-sidebar-brand">

          {/* CERT X LOGO */}
          <div className="certx-sidebar-logo">
            <img
              src="/certx-logo.jpeg"
              alt="Cert X Logo"
            />
          </div>

          <div>
            <h2>Cert X</h2>

            <span>
              Security Center
            </span>
          </div>

        </div>

        <div className="certx-sidebar-status">
          <span></span>
          System Online
        </div>

        <nav className="certx-navigation">

          <button
            className={
              page === "dashboard"
                ? "certx-nav-active"
                : ""
            }
            onClick={() =>
              setPage("dashboard")
            }
          >
            <span>▣</span>
            Dashboard
          </button>

          <button
            className={
              page === "upload"
                ? "certx-nav-active"
                : ""
            }
            onClick={() =>
              setPage("upload")
            }
          >
            <span>↑</span>
            PDF Upload
          </button>

          <button
            className={
              page === "history"
                ? "certx-nav-active"
                : ""
            }
            onClick={() =>
              setPage("history")
            }
          >
            <span>◷</span>
            Verification History
          </button>

          <button
            className={
              page === "threat"
                ? "certx-nav-active"
                : ""
            }
            onClick={() =>
              setPage("threat")
            }
          >
            <span>△</span>
            Threat Analysis
          </button>

          <button
            className={
              page === "quantum"
                ? "certx-nav-active"
                : ""
            }
            onClick={() =>
              setPage("quantum")
            }
          >
            <span>◇</span>
            Quantum Analysis
          </button>

          <button
            className={
              page === "reports"
                ? "certx-nav-active"
                : ""
            }
            onClick={() =>
              setPage("reports")
            }
          >
            <span>▤</span>
            Reports
          </button>

        </nav>

        <div className="certx-sidebar-bottom">

          <button
            onClick={onBackToBank}
          >
            ← Bank Portal
          </button>

          <button
            onClick={onLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <main className="certx-content">

        <header className="certx-topbar">

          <div>

            <span className="certx-page-label">
              CERT X SECURITY CENTER
            </span>

            <h1>
              {page === "dashboard" &&
                "Security Dashboard"}

              {page === "upload" &&
                "PDF Verification"}

              {page === "history" &&
                "Verification History"}

              {page === "threat" &&
                "Threat Analysis"}

              {page === "quantum" &&
                "Quantum Analysis"}

              {page === "reports" &&
                "Verification Reports"}
            </h1>

          </div>

          <div className="certx-user-area">

            <div className="certx-user-avatar">
              CX
            </div>

            <div>

              <strong>
                Cert X
              </strong>

              <span>
                Security User
              </span>

            </div>

          </div>

        </header>

        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        {page === "dashboard" && (
          <div className="certx-page">

            <section className="certx-hero">

              <div>

                <span className="certx-hero-label">
                  DIGITAL DOCUMENT SECURITY
                </span>

                <h2>
                  Verify. Analyze. Protect.
                </h2>

                <p>
                  Verify digital signatures,
                  detect document tampering and
                  analyze cyber security risk.
                </p>

              </div>

              <button
                onClick={() =>
                  setPage("upload")
                }
              >
                Upload PDF →
              </button>

            </section>

            {!result && (
              <section className="certx-empty-dashboard">

                <div className="certx-empty-icon">
                  PDF
                </div>

                <h3>
                  No document verified yet
                </h3>

                <p>
                  Upload a digitally signed PDF
                  to begin security analysis.
                </p>

                <button
                  onClick={() =>
                    setPage("upload")
                  }
                >
                  Start Verification
                </button>

              </section>
            )}

            {result && (
              <>

                <div className="certx-result-heading">

                  <div>

                    <span>
                      LATEST VERIFICATION
                    </span>

                    <h3>
                      {result.document?.filename ||
                        "PDF Document"}
                    </h3>

                  </div>

                  <button
                    onClick={exportReport}
                  >
                    Export Report
                  </button>

                </div>

                <div className="certx-summary-grid">

                  <SummaryCard
                    title="Threat Score"
                    value={
                      result.threat?.score ?? "-"
                    }
                    className="risk"
                  />

                  <SummaryCard
                    title="Risk Level"
                    value={
                      result.threat?.level || "-"
                    }
                  />

                  <SummaryCard
                    title="Signature"
                    value={
                      result.signature?.valid
                        ? "VALID"
                        : "INVALID"
                    }
                  />

                  <SummaryCard
                    title="Integrity"
                    value={
                      result.signature?.integrity
                        ? "VALID"
                        : "FAILED"
                    }
                  />

                </div>

                <div className="certx-details-grid">

                  <DetailPanel
                    title="Digital Signature"
                  >

                    <DetailRow
                      label="Signature Found"
                      value={
                        result.signature?.found
                          ? "YES"
                          : "NO"
                      }
                    />

                    <DetailRow
                      label="Signature Status"
                      value={
                        result.signature?.valid
                          ? "VALID"
                          : "INVALID"
                      }
                    />

                    <DetailRow
                      label="Document Integrity"
                      value={
                        result.signature?.integrity
                          ? "VALID"
                          : "FAILED"
                      }
                    />

                    <DetailRow
                      label="Certificate"
                      value={
                        result.signature
                          ?.certificate_trusted
                          ? "TRUSTED"
                          : "NOT TRUSTED"
                      }
                    />

                  </DetailPanel>

                  <DetailPanel
                    title="Signer Verification"
                  >

                    <DetailRow
                      label="Signer"
                      value={
                        result.signer
                          ?.signer_name ||
                        "Not Available"
                      }
                    />

                    <DetailRow
                      label="Organization"
                      value={
                        result.signer
                          ?.organization ||
                        "Not Available"
                      }
                    />

                    <DetailRow
                      label="Identity"
                      value={
                        result.signer
                          ?.identity_status ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Authorization"
                      value={
                        result.authorization
                          ?.overall_status ||
                        "-"
                      }
                    />

                  </DetailPanel>

                  <DetailPanel
                    title="Hash Analysis"
                  >

                    <DetailRow
                      label="Algorithm"
                      value={
                        result.hash_analysis
                          ?.algorithm ||
                        "SHA-256"
                      }
                    />

                    <DetailRow
                      label="Status"
                      value={
                        result.hash_analysis
                          ?.status ||
                        "-"
                      }
                    />

                    <div className="hash-value">
                      {
                        result.hash_analysis
                          ?.hash ||
                        result.document
                          ?.sha256 ||
                        "-"
                      }
                    </div>

                  </DetailPanel>

                  <DetailPanel
                    title="Quantum-Inspired Analysis"
                  >

                    <DetailRow
                      label="Method"
                      value={
                        result.quantum_analysis
                          ?.method ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Status"
                      value={
                        result.quantum_analysis
                          ?.status ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Optimized Risk"
                      value={
                        result.quantum_analysis
                          ?.optimized_risk_score ??
                        "-"
                      }
                    />

                    <DetailRow
                      label="Priority"
                      value={
                        result.quantum_analysis
                          ?.risk_priority ||
                        "-"
                      }
                    />

                  </DetailPanel>

                  <DetailPanel
                    title="Behaviour Analysis"
                  >

                    <DetailRow
                      label="Status"
                      value={
                        result.behaviour_analysis
                          ?.status ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Previous Checks"
                      value={
                        result.behaviour_analysis
                          ?.total_previous_checks ??
                        0
                      }
                    />

                    <DetailRow
                      label="High Risk Checks"
                      value={
                        result.behaviour_analysis
                          ?.high_risk_previous_checks ??
                        0
                      }
                    />

                    <DetailRow
                      label="Behaviour"
                      value={
                        result.behaviour_analysis
                          ?.behaviour_status ||
                        "-"
                      }
                    />

                  </DetailPanel>

                  <DetailPanel
                    title="Threat Analysis"
                  >

                    <DetailRow
                      label="Threat Score"
                      value={
                        result.threat?.score ?? "-"
                      }
                    />

                    <DetailRow
                      label="Threat Level"
                      value={
                        result.threat?.level || "-"
                      }
                    />

                    <DetailRow
                      label="Officer Alert"
                      value={
                        result.threat?.alert_required
                          ? "REQUIRED"
                          : "NO"
                      }
                    />

                  </DetailPanel>

                </div>

                <section className="certx-reasons">

                  <h3>
                    Security Findings
                  </h3>

                  {Array.isArray(
                    result.threat?.reasons
                  ) &&
                  result.threat.reasons.length >
                    0 ? (
                    result.threat.reasons.map(
                      (reason, index) => (
                        <div
                          key={index}
                          className="certx-reason"
                        >
                          <span>!</span>
                          {reason}
                        </div>
                      )
                    )
                  ) : (
                    <div className="certx-safe-message">
                      No security findings reported.
                    </div>
                  )}

                </section>

                {result.security_officer_alert
                  ?.triggered && (
                  <section className="certx-officer-alert">

                    <div className="alert-icon">
                      !
                    </div>

                    <div>

                      <strong>
                        Security Officer Alert Created
                      </strong>

                      <p>
                        High-risk activity has been
                        sent to the Security Officer
                        monitoring system.
                      </p>

                      <span>
                        Alert ID:{" "}
                        {
                          result
                            .security_officer_alert
                            ?.alert_id
                        }
                      </span>

                    </div>

                  </section>
                )}

              </>
            )}

          </div>
        )}

        {/* ====================================================
            UPLOAD PAGE
        ==================================================== */}

        {page === "upload" && (
          <div className="certx-page">

            <section className="certx-upload-page">

              <div className="certx-upload-icon">
                PDF
              </div>

              <h2>
                Upload PDF Document
              </h2>

              <p>
                Upload a digitally signed PDF
                for complete Cert X security
                verification.
              </p>

              <label className="certx-upload-button">

                {loading
                  ? "Analyzing..."
                  : "Choose PDF"}

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePDFUpload}
                  disabled={loading}
                  hidden
                />

              </label>

              {selectedFile && (
                <div className="certx-selected-file">

                  <strong>
                    Selected Document
                  </strong>

                  <span>
                    {selectedFile.name}
                  </span>

                </div>
              )}

              {loading && (
                <div className="certx-loading">

                  <div className="spinner"></div>

                  <span>
                    Cert X is analyzing the document...
                  </span>

                </div>
              )}

              {error && (
                <div className="certx-api-error">
                  {error}
                </div>
              )}

            </section>

          </div>
        )}

        {/* ====================================================
            HISTORY
        ==================================================== */}

        {page === "history" && (
          <div className="certx-page">

            <section className="certx-history">

              <div className="certx-section-header">

                <div>

                  <span>
                    VERIFICATION RECORDS
                  </span>

                  <h2>
                    Previous PDF Results
                  </h2>

                </div>

                <strong>
                  {history.length} Records
                </strong>

              </div>

              {history.length === 0 ? (
                <div className="certx-no-history">

                  <h3>
                    No verification history
                  </h3>

                  <p>
                    Verified PDF documents will
                    appear here.
                  </p>

                </div>
              ) : (
                <div className="certx-history-list">

                  {history.map((item) => (

                    <div
                      className="certx-history-item"
                      key={item.id}
                    >

                      <div className="history-file">

                        <div className="history-file-icon">
                          PDF
                        </div>

                        <div>

                          <strong>
                            {
                              item.document
                                ?.filename ||
                              "Document"
                            }
                          </strong>

                          <span>
                            {item.date}
                          </span>

                        </div>

                      </div>

                      <div className="history-risk">

                        <strong>
                          {
                            item.threat?.score ??
                            "-"
                          }
                        </strong>

                        <span>
                          Risk Score
                        </span>

                      </div>

                      <div className="history-status">

                        <strong>
                          {
                            item.threat?.level ||
                            "-"
                          }
                        </strong>

                        <span>
                          {
                            item.signature?.valid
                              ? "VALID"
                              : "INVALID"
                          }
                        </span>

                      </div>

                      <button
                        onClick={() =>
                          viewHistory(item)
                        }
                      >
                        View Result →
                      </button>

                    </div>

                  ))}

                </div>
              )}

            </section>

          </div>
        )}

        {/* ====================================================
            THREAT ANALYSIS
        ==================================================== */}

        {page === "threat" && (
          <div className="certx-page">

            <section className="certx-analysis-page">

              <span className="certx-analysis-label">
                CYBER THREAT INTELLIGENCE
              </span>

              <h2>
                Threat Analysis
              </h2>

              <p>
                Cert X evaluates signature,
                integrity and suspicious PDF
                structures to calculate a threat
                score.
              </p>

              {result ? (
                <>

                  <div className="big-risk-score">

                    <span>
                      Current Threat Score
                    </span>

                    <strong>
                      {
                        result.threat?.score ??
                        0
                      }
                    </strong>

                    <small>
                      {
                        result.threat?.level ||
                        "UNKNOWN"
                      }
                    </small>

                  </div>

                  <div className="analysis-findings">

                    {result.threat?.reasons?.map(
                      (reason, index) => (
                        <div key={index}>
                          <span>!</span>
                          {reason}
                        </div>
                      )
                    )}

                  </div>

                </>
              ) : (
                <div className="certx-analysis-empty">
                  Upload a PDF to view threat analysis.
                </div>
              )}

            </section>

          </div>
        )}

        {/* ====================================================
            QUANTUM ANALYSIS
        ==================================================== */}

        {page === "quantum" && (
          <div className="certx-page">

            <section className="certx-analysis-page">

              <span className="certx-analysis-label">
                ADVANCED SECURITY
              </span>

              <h2>
                Quantum-Inspired Analysis
              </h2>

              <p>
                Quantum-inspired risk optimization
                is used as an enhancement to
                prioritize cyber security factors.
              </p>

              {result?.quantum_analysis ? (
                <div className="quantum-result">

                  <div>
                    <span>
                      Method
                    </span>

                    <strong>
                      {
                        result.quantum_analysis
                          .method
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Simulation Status
                    </span>

                    <strong>
                      {
                        result.quantum_analysis
                          .status
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Optimized Risk
                    </span>

                    <strong>
                      {
                        result.quantum_analysis
                          .optimized_risk_score
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Priority
                    </span>

                    <strong>
                      {
                        result.quantum_analysis
                          .risk_priority
                      }
                    </strong>
                  </div>

                  <div className="quantum-explanation">

                    <span>
                      Explanation
                    </span>

                    <p>
                      {
                        result.quantum_analysis
                          .explanation
                      }
                    </p>

                  </div>

                </div>
              ) : (
                <div className="certx-analysis-empty">
                  Upload a PDF to view quantum-inspired analysis.
                </div>
              )}

            </section>

          </div>
        )}

        {/* ====================================================
            REPORTS
        ==================================================== */}

        {page === "reports" && (
          <div className="certx-page">

            <section className="certx-report-page">

              <span className="certx-analysis-label">
                SECURITY DOCUMENTATION
              </span>

              <h2>
                Verification Reports
              </h2>

              <p>
                Export the complete Cert X
                verification analysis for audit
                and investigation.
              </p>

              {result ? (
                <div className="report-preview">

                  <div>
                    <span>
                      Document
                    </span>

                    <strong>
                      {
                        result.document
                          ?.filename
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Final Risk
                    </span>

                    <strong>
                      {
                        result.threat?.level
                      }
                    </strong>
                  </div>

                  <button
                    onClick={exportReport}
                  >
                    Export Verification Report
                  </button>

                </div>
              ) : (
                <div className="certx-analysis-empty">
                  Verify a PDF first to generate a report.
                </div>
              )}

            </section>

          </div>
        )}

      </main>

    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  className = "",
}) {
  return (
    <div
      className={`certx-summary-card ${className}`}
    >
      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

// ============================================================
// DETAIL PANEL
// ============================================================

function DetailPanel({
  title,
  children,
}) {
  return (
    <section className="certx-detail-panel">

      <div className="certx-detail-panel-header">
        <h3>
          {title}
        </h3>
      </div>

      <div className="certx-detail-panel-body">
        {children}
      </div>

    </section>
  );
}

// ============================================================
// DETAIL ROW
// ============================================================

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="certx-detail-row">

      <span>
        {label}
      </span>

      <strong>
        {String(value)}
      </strong>

    </div>
  );
}

export default CertXApp;