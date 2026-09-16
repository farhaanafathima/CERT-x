import React, { useState } from "react";

import CyberSecBankLogin from "./CyberSecBankLogin";
import CyberSecBankPortal from "./CyberSecBankPortal";
import CertXApp from "./CertXApp";

import "./App.css";

function App() {
  const [bankLoggedIn, setBankLoggedIn] = useState(false);
  const [bankUser, setBankUser] = useState("");
  const [appMode, setAppMode] = useState("bank");

  // ============================================================
  // BANK LOGIN
  // ============================================================

  const handleBankLogin = (username) => {
    setBankUser(username);
    setBankLoggedIn(true);

    // IMPORTANT:
    // After Bank Login always open Bank Portal.
    setAppMode("bank");
  };

  // ============================================================
  // BANK LOGOUT
  // ============================================================

  const handleBankLogout = () => {
    setBankUser("");
    setBankLoggedIn(false);

    // Always return to Bank Login
    setAppMode("bank");
  };

  // ============================================================
  // CERT X LOGOUT
  // ============================================================

  const handleCertXLogout = () => {
    setBankUser("");
    setBankLoggedIn(false);

    setAppMode("bank");
  };

  // ============================================================
  // BANK LOGIN PAGE
  // ============================================================

  if (!bankLoggedIn) {
    return (
      <CyberSecBankLogin
        onLogin={handleBankLogin}
      />
    );
  }

  // ============================================================
  // CERT X
  // ============================================================

  if (appMode === "certx") {
    return (
      <CertXApp
        bankUser={bankUser}

        onBackToBank={() => {
          setAppMode("bank");
        }}

        onLogout={handleCertXLogout}
      />
    );
  }

  // ============================================================
  // NORMAL BANK PORTAL
  // ============================================================

  return (
    <CyberSecBankPortal
      username={bankUser}

      onOpenCertX={() => {
        setAppMode("certx");
      }}

      onLogout={handleBankLogout}
    />
  );
}

export default App;