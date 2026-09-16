import React, { useState } from "react";
import "./BankPortal.css";

function CyberSecBankPortal({
  username = "Farhaana",
  onOpenCertX,
  onLogout,
}) {
  const [page, setPage] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName =
    username.charAt(0).toUpperCase() + username.slice(1);

  const accounts = [
    {
      type: "Savings Account",
      number: "XXXX 4821",
      balance: "₹1,24,580.00",
    },
    {
      type: "Current Account",
      number: "XXXX 7294",
      balance: "₹82,450.00",
    },
  ];

  const transactions = [
    {
      name: "Amazon India",
      date: "15 Sep 2026",
      amount: "-₹2,450",
      type: "debit",
      icon: "↑",
    },
    {
      name: "Salary Credit",
      date: "12 Sep 2026",
      amount: "+₹45,000",
      type: "credit",
      icon: "↓",
    },
    {
      name: "Electricity Bill",
      date: "10 Sep 2026",
      amount: "-₹1,280",
      type: "debit",
      icon: "↑",
    },
    {
      name: "UPI Transfer",
      date: "08 Sep 2026",
      amount: "-₹3,500",
      type: "debit",
      icon: "↑",
    },
  ];

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "accounts",
      label: "Accounts",
      icon: "▣",
    },
    {
      id: "payments",
      label: "Payments",
      icon: "₹",
    },
    {
      id: "beneficiaries",
      label: "Beneficiaries",
      icon: "♙",
    },
    {
      id: "statements",
      label: "Statements",
      icon: "▤",
    },
  ];

  const handleNavigation = (id) => {
    setPage(id);
    setShowNotifications(false);
  };

  return (
    <div className="bank-portal">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="bank-sidebar">

        <div className="bank-sidebar-brand">

          <div className="bank-sidebar-logo">
            <img
              src="/cybersecbank-logo.png"
              alt="CyberSec Bank"
            />
          </div>

          <div>
            <h2>CyberSec Bank</h2>
            <span>Secure Digital Banking</span>
          </div>

        </div>

        <div className="bank-secure-session">
          <span className="green-dot"></span>
          Secure Session
        </div>

        <nav className="bank-nav">

          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                page === item.id
                  ? "bank-nav-active"
                  : ""
              }
              onClick={() =>
                handleNavigation(item.id)
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

        </nav>

        <div className="bank-sidebar-bottom">

          <button
            className="certx-side-button"
            onClick={onOpenCertX}
          >
            <span>✦</span>

            <div>
              <strong>Cert X</strong>

              <small>
                Digital Security Service
              </small>
            </div>

            <b>→</b>
          </button>

          <button
            className="bank-logout"
            onClick={onLogout}
          >
            ⇥ &nbsp; Sign Out
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="bank-main">

        {/* TOP BAR */}

        <header className="bank-topbar">

          <div className="mobile-brand">

            <div className="bank-sidebar-logo">
              <img
                src="/cybersecbank-logo.png"
                alt="CyberSec Bank"
              />
            </div>

            <strong>
              CyberSec Bank
            </strong>

          </div>

          <div className="bank-breadcrumb">
            CyberSec Bank
            <span>›</span>
            {page.charAt(0).toUpperCase() +
              page.slice(1)}
          </div>

          <div className="bank-top-actions">

            <button
              className="notification-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >
              ♧
              <span></span>
            </button>

            <div className="top-user">

              <div className="top-user-avatar">
                {displayName.charAt(0)}
              </div>

              <div>
                <strong>{displayName}</strong>
                <small>Banking User</small>
              </div>

            </div>

          </div>

          {showNotifications && (
            <div className="notification-box">

              <strong>
                Notifications
              </strong>

              <p>
                Your banking session is secure.
              </p>

              <p>
                No new security alerts.
              </p>

            </div>
          )}

        </header>


        {/* =====================================================
            DASHBOARD
        ====================================================== */}

        {page === "dashboard" && (

          <div className="bank-page-container">

            <div className="bank-content">

              <div className="bank-page-header">

                <div>

                  <span>
                    WELCOME BACK
                  </span>

                  <h1>
                    Hello, {displayName}
                  </h1>

                  <p>
                    Manage your banking activities
                    securely from one place.
                  </p>

                </div>

                <div className="account-protected">

                  <span>✓</span>

                  Account Protected

                </div>

              </div>


              {/* ACCOUNTS */}

              <section className="bank-section">

                <div className="section-heading">

                  <div>
                    <span>
                      YOUR FINANCES
                    </span>

                    <h2>
                      Account Overview
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      setPage("accounts")
                    }
                  >
                    View Accounts →
                  </button>

                </div>


                <div className="account-cards">

                  {accounts.map(
                    (account, index) => (

                      <button
                        key={index}
                        className="account-card"
                        onClick={() =>
                          setPage("accounts")
                        }
                      >

                        <div className="account-card-top">

                          <span>
                            {account.type}
                          </span>

                          <span>
                            •••
                          </span>

                        </div>

                        <strong>
                          {account.number}
                        </strong>

                        <small>
                          Available Balance
                        </small>

                        <h2>
                          {account.balance}
                        </h2>

                        <div className="account-card-footer">

                          <span>
                            View account details
                          </span>

                          <span>
                            →
                          </span>

                        </div>

                      </button>

                    )
                  )}

                </div>

              </section>


              {/* TRANSACTIONS + QUICK ACTIONS */}

              <div className="dashboard-columns">

                <section className="bank-panel">

                  <div className="panel-heading">

                    <div>
                      <span>
                        ACCOUNT ACTIVITY
                      </span>

                      <h2>
                        Recent Transactions
                      </h2>
                    </div>

                    <button
                      onClick={() =>
                        setPage("statements")
                      }
                    >
                      View All
                    </button>

                  </div>


                  <div className="transaction-list">

                    {transactions.map(
                      (transaction, index) => (

                        <div
                          className="transaction-row"
                          key={index}
                        >

                          <div
                            className={`transaction-icon ${transaction.type}`}
                          >
                            {transaction.icon}
                          </div>

                          <div className="transaction-info">

                            <strong>
                              {transaction.name}
                            </strong>

                            <span>
                              {transaction.date}
                            </span>

                          </div>

                          <div
                            className={`transaction-amount ${transaction.type}`}
                          >
                            {transaction.amount}
                          </div>

                        </div>

                      )
                    )}

                  </div>

                </section>


                {/* QUICK ACTIONS */}

                <section className="bank-panel">

                  <div className="panel-heading">

                    <div>
                      <span>
                        QUICK ACTIONS
                      </span>

                      <h2>
                        Banking Services
                      </h2>
                    </div>

                  </div>


                  <div className="quick-actions">

                    <button
                      className="quick-action"
                      onClick={() =>
                        setPage("payments")
                      }
                    >

                      <div>₹</div>

                      <span>
                        <strong>
                          Send Money
                        </strong>

                        <small>
                          Transfer funds
                        </small>
                      </span>

                      <b>→</b>

                    </button>


                    <button
                      className="quick-action"
                      onClick={() =>
                        setPage("payments")
                      }
                    >

                      <div>↗</div>

                      <span>
                        <strong>
                          Pay Bills
                        </strong>

                        <small>
                          Manage payments
                        </small>
                      </span>

                      <b>→</b>

                    </button>


                    <button
                      className="quick-action"
                      onClick={() =>
                        setPage("beneficiaries")
                      }
                    >

                      <div>♙</div>

                      <span>
                        <strong>
                          Beneficiaries
                        </strong>

                        <small>
                          Manage recipients
                        </small>
                      </span>

                      <b>→</b>

                    </button>


                    <button
                      className="quick-action"
                      onClick={() =>
                        setPage("statements")
                      }
                    >

                      <div>▤</div>

                      <span>
                        <strong>
                          Statements
                        </strong>

                        <small>
                          View documents
                        </small>
                      </span>

                      <b>→</b>

                    </button>

                  </div>

                </section>

              </div>


              {/* CERT X */}

              <section className="bank-section">

                <div className="certx-bank-banner">

                  <div className="certx-bank-icon">
                    ✦
                  </div>

                  <div className="certx-bank-text">

                    <span>
                      CYBERSECURITY SERVICE
                    </span>

                    <h2>
                      Cert X
                    </h2>

                    <p>
                      Verify digital signatures,
                      document integrity and
                      security risks.
                    </p>

                    <div className="certx-features">

                      <span>
                        ✓ Signature Verification
                      </span>

                      <span>
                        ✓ Integrity Check
                      </span>

                      <span>
                        ✓ Threat Analysis
                      </span>

                    </div>

                  </div>

                  <button
                    onClick={onOpenCertX}
                  >
                    Open Cert X
                    <span>→</span>
                  </button>

                </div>

              </section>

            </div>

          </div>

        )}


        {/* =====================================================
            ACCOUNTS PAGE
        ====================================================== */}

        {page === "accounts" && (

          <div className="bank-page-container">

            <div className="bank-content">

              <div className="bank-page-header">

                <div>
                  <span>
                    YOUR FINANCES
                  </span>

                  <h1>
                    Accounts
                  </h1>

                  <p>
                    View your account balances
                    and details.
                  </p>
                </div>

              </div>


              <div className="account-cards large">

                {accounts.map(
                  (account, index) => (

                    <div
                      className="account-detail-card"
                      key={index}
                    >

                      <span>
                        {account.type}
                      </span>

                      <h2>
                        {account.number}
                      </h2>

                      <p>
                        CyberSec Bank
                      </p>

                      <strong>
                        {account.balance}
                      </strong>

                      <div className="detail-actions">

                        <button>
                          Account Details
                        </button>

                        <button
                          onClick={() =>
                            setPage("statements")
                          }
                        >
                          View Transactions
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            PAYMENTS PAGE
        ====================================================== */}

        {page === "payments" && (

          <div className="bank-page-container">

            <div className="bank-content">

              <div className="bank-page-header">

                <div>
                  <span>
                    BANKING SERVICES
                  </span>

                  <h1>
                    Payments
                  </h1>

                  <p>
                    Manage your transfers and
                    bill payments.
                  </p>
                </div>

              </div>


              <div className="payment-grid">

                <div className="payment-card">

                  <div className="payment-icon">
                    ₹
                  </div>

                  <h3>
                    Send Money
                  </h3>

                  <p>
                    Transfer money securely
                    to your beneficiaries.
                  </p>

                  <span>
                    Start Transfer →
                  </span>

                </div>


                <div className="payment-card">

                  <div className="payment-icon">
                    ↗
                  </div>

                  <h3>
                    Pay Bills
                  </h3>

                  <p>
                    Manage electricity,
                    utility and other payments.
                  </p>

                  <span>
                    Pay a Bill →
                  </span>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            BENEFICIARIES PAGE
        ====================================================== */}

        {page === "beneficiaries" && (

          <div className="bank-page-container">

            <div className="bank-content">

              <div className="bank-page-header">

                <div>
                  <span>
                    BANKING SERVICES
                  </span>

                  <h1>
                    Beneficiaries
                  </h1>

                  <p>
                    Manage your saved recipients.
                  </p>
                </div>

              </div>


              <div className="beneficiary-grid">

                {[
                  "Srinivasan",
                  "Thirunavukarasu",
                  "Abdul Wahith",
                ].map(
                  (name, index) => (

                    <div
                      className="beneficiary-card"
                      key={index}
                    >

                      <div className="beneficiary-avatar">
                        {name.charAt(0)}
                      </div>

                      <div>

                        <strong>
                          {name}
                        </strong>

                        <span>
                          Bank Account •••• {4821 + index}
                        </span>

                      </div>

                      <button>
                        View
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            STATEMENTS PAGE
        ====================================================== */}

        {page === "statements" && (

          <div className="bank-page-container">

            <div className="bank-content">

              <div className="bank-page-header">

                <div>
                  <span>
                    ACCOUNT ACTIVITY
                  </span>

                  <h1>
                    Statements
                  </h1>

                  <p>
                    View your recent banking
                    documents and transactions.
                  </p>
                </div>

              </div>


              <section className="bank-panel">

                <div className="panel-heading">

                  <div>
                    <span>
                      RECENT ACTIVITY
                    </span>

                    <h2>
                      Transaction History
                    </h2>
                  </div>

                </div>


                <div className="transaction-list transaction-list-detailed">

                  {transactions.map(
                    (transaction, index) => (

                      <div
                        className="transaction-row"
                        key={index}
                      >

                        <div
                          className={`transaction-icon ${transaction.type}`}
                        >
                          {transaction.icon}
                        </div>

                        <div className="transaction-info">

                          <strong>
                            {transaction.name}
                          </strong>

                          <span>
                            {transaction.date}
                          </span>

                        </div>

                        <div
                          className={`transaction-amount ${transaction.type}`}
                        >
                          {transaction.amount}
                        </div>

                        <button className="transaction-view">
                          View
                        </button>

                      </div>

                    )
                  )}

                </div>

              </section>

            </div>

          </div>

        )}

        {/* FOOTER */}

        <footer className="bank-footer">

          <span>
            © 2026 CyberSec Bank
          </span>

          <span>
            Secure Digital Banking
          </span>

          <span>
            Protected Session
          </span>

        </footer>

      </main>

    </div>
  );
}

export default CyberSecBankPortal;