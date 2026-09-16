import React, { useState } from "react";
import "./BankPortal.css";

const accountData = {
  savings: {
    name: "Savings Account",
    number: "XXXX 4821",
    balance: "₹1,24,580.00",
  },
  current: {
    name: "Current Account",
    number: "XXXX 7294",
    balance: "₹82,450.00",
  },
};

const transactions = [
  {
    name: "Amazon India",
    date: "15 Sep 2026",
    amount: "₹2,450",
    type: "debit",
    category: "Shopping",
  },
  {
    name: "Salary Credit",
    date: "12 Sep 2026",
    amount: "₹45,000",
    type: "credit",
    category: "Income",
  },
  {
    name: "Electricity Bill",
    date: "10 Sep 2026",
    amount: "₹1,280",
    type: "debit",
    category: "Bills",
  },
  {
    name: "UPI Transfer",
    date: "08 Sep 2026",
    amount: "₹3,500",
    type: "debit",
    category: "Transfer",
  },
  {
    name: "Swiggy",
    date: "06 Sep 2026",
    amount: "₹680",
    type: "debit",
    category: "Food",
  },
  {
    name: "Interest Credit",
    date: "01 Sep 2026",
    amount: "₹1,240",
    type: "credit",
    category: "Income",
  },
];

const beneficiaries = [
  {
    name: "Mom",
    account: "XXXX 1190",
  },
  {
    name: "Home Account",
    account: "XXXX 4821",
  },
  {
    name: "College",
    account: "XXXX 7294",
  },
];

function CyberSecBankPortal({
  username,
  onOpenCertX,
  onLogout,
}) {
  const [page, setPage] = useState("dashboard");
  const [selectedAccount, setSelectedAccount] =
    useState("savings");
  const [showNotification, setShowNotification] =
    useState(false);

  const currentAccount =
    accountData[selectedAccount];

  const navigate = (target) => {
    setPage(target);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
      id: "transactions",
      label: "Transactions",
      icon: "↕",
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
      id: "documents",
      label: "Documents",
      icon: "▤",
    },
  ];

  return (
    <div className="bank-portal">

      {/* SIDEBAR */}

      <aside className="bank-sidebar">

        <div className="bank-sidebar-brand">
          <div className="bank-sidebar-logo">
            <img
              src="/cybersecbank-photo.jpeg"
              alt="CyberSec Bank"
            />
          </div>

          <div>
            <h2>CyberSec</h2>
            <span>Bank</span>
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
                navigate(item.id)
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
                Digital Security
              </small>
            </div>
            <b>→</b>
          </button>

          <button
            className="bank-logout"
            onClick={onLogout}
          >
            ⇥ Logout
          </button>

        </div>
      </aside>

      {/* MAIN */}

      <main className="bank-main">

        {/* TOPBAR */}

        <header className="bank-topbar">

          <div className="mobile-brand">
            <div className="bank-sidebar-logo">
              <img
                src="/cybersecbank-photo.jpeg"
                alt="CyberSec Bank"
              />
            </div>

            <strong>CyberSec Bank</strong>
          </div>

          <div className="bank-breadcrumb">
            CyberSec Bank
            <span>/</span>
            Secure Banking
          </div>

          <div className="bank-top-actions">

            <button
              className="notification-button"
              onClick={() =>
                setShowNotification(
                  !showNotification
                )
              }
            >
              ♢
              <span></span>
            </button>

            <div className="top-user">
              <div className="top-user-avatar">
                {username?.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{username}</strong>
                <small>Banking User</small>
              </div>
            </div>

          </div>

          {showNotification && (
            <div className="notification-box">
              <strong>Notifications</strong>
              <p>
                Your account is secure.
              </p>
              <p>
                No new security alerts.
              </p>
            </div>
          )}

        </header>

        {/* CONTENT */}

        <div className="bank-content">

          {/* DASHBOARD */}

          {page === "dashboard" && (
            <>
              <div className="bank-page-header">

                <div>
                  <span>WELCOME BACK</span>

                  <h1>
                    Hello, {username}
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

              <section className="bank-section">

                <div className="section-heading">
                  <div>
                    <span>YOUR FINANCES</span>
                    <h2>Account Overview</h2>
                  </div>

                  <button
                    onClick={() =>
                      navigate("accounts")
                    }
                  >
                    View Accounts →
                  </button>
                </div>

                <div className="account-cards">

                  <AccountCard
                    account={
                      accountData.savings
                    }
                    active={
                      selectedAccount ===
                      "savings"
                    }
                    onClick={() =>
                      setSelectedAccount(
                        "savings"
                      )
                    }
                  />

                  <AccountCard
                    account={
                      accountData.current
                    }
                    active={
                      selectedAccount ===
                      "current"
                    }
                    onClick={() =>
                      setSelectedAccount(
                        "current"
                      )
                    }
                  />

                </div>

              </section>

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
                        navigate(
                          "transactions"
                        )
                      }
                    >
                      View All
                    </button>
                  </div>

                  <TransactionList
                    items={transactions.slice(
                      0,
                      4
                    )}
                  />

                </section>

                <section className="bank-panel quick-panel">

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

                    <QuickAction
                      icon="₹"
                      title="Send Money"
                      text="Transfer funds"
                      onClick={() =>
                        navigate(
                          "payments"
                        )
                      }
                    />

                    <QuickAction
                      icon="↗"
                      title="Pay Bills"
                      text="Manage payments"
                      onClick={() =>
                        navigate(
                          "payments"
                        )
                      }
                    />

                    <QuickAction
                      icon="♙"
                      title="Beneficiaries"
                      text="Manage recipients"
                      onClick={() =>
                        navigate(
                          "beneficiaries"
                        )
                      }
                    />

                    <QuickAction
                      icon="▤"
                      title="Statements"
                      text="View documents"
                      onClick={() =>
                        navigate(
                          "documents"
                        )
                      }
                    />

                  </div>

                </section>

              </div>

              {/* CERT X */}

              <section className="certx-bank-banner">

                <div className="certx-bank-icon">
                  ✦
                </div>

                <div className="certx-bank-text">
                  <span>
                    CYBERSECURITY SERVICE
                  </span>

                  <h2>Cert X</h2>

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

              </section>
            </>
          )}

          {/* ACCOUNTS */}

          {page === "accounts" && (
            <PageContainer
              label="BANKING"
              title="Your Accounts"
              subtitle="View your account balances and account information."
            >
              <div className="account-cards large">

                <AccountCard
                  account={
                    accountData.savings
                  }
                  active={
                    selectedAccount ===
                    "savings"
                  }
                  onClick={() =>
                    setSelectedAccount(
                      "savings"
                    )
                  }
                />

                <AccountCard
                  account={
                    accountData.current
                  }
                  active={
                    selectedAccount ===
                    "current"
                  }
                  onClick={() =>
                    setSelectedAccount(
                      "current"
                    )
                  }
                />

              </div>

              <div className="account-detail-card">

                <span>
                  SELECTED ACCOUNT
                </span>

                <h2>
                  {currentAccount.name}
                </h2>

                <p>
                  Account Number:{" "}
                  {currentAccount.number}
                </p>

                <strong>
                  {currentAccount.balance}
                </strong>

                <div className="detail-actions">
                  <button
                    onClick={() =>
                      navigate(
                        "transactions"
                      )
                    }
                  >
                    View Transactions
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "documents"
                      )
                    }
                  >
                    View Statement
                  </button>
                </div>

              </div>
            </PageContainer>
          )}

          {/* TRANSACTIONS */}

          {page === "transactions" && (
            <PageContainer
              label="ACCOUNT ACTIVITY"
              title="Transactions"
              subtitle="Review your recent account activity."
            >
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

                  <span className="transaction-count">
                    {transactions.length} Transactions
                  </span>
                </div>

                <TransactionList
                  items={transactions}
                  detailed
                />

              </section>
            </PageContainer>
          )}

          {/* PAYMENTS */}

          {page === "payments" && (
            <PageContainer
              label="PAYMENTS"
              title="Payments & Transfers"
              subtitle="Choose a banking service to continue."
            >
              <div className="payment-grid">

                <PaymentCard
                  icon="₹"
                  title="Send Money"
                  text="Transfer money to a beneficiary."
                />

                <PaymentCard
                  icon="↗"
                  title="Pay Bills"
                  text="Manage electricity and utility bills."
                />

                <PaymentCard
                  icon="▣"
                  title="UPI Payment"
                  text="Make a quick digital payment."
                />

                <PaymentCard
                  icon="◷"
                  title="Scheduled Payments"
                  text="View your upcoming payments."
                />

              </div>
            </PageContainer>
          )}

          {/* BENEFICIARIES */}

          {page === "beneficiaries" && (
            <PageContainer
              label="PAYMENT MANAGEMENT"
              title="Beneficiaries"
              subtitle="Manage your saved payment recipients."
            >
              <div className="beneficiary-grid">

                {beneficiaries.map(
                  (person) => (
                    <div
                      className="beneficiary-card"
                      key={person.name}
                    >
                      <div className="beneficiary-avatar">
                        {person.name
                          .charAt(0)}
                      </div>

                      <div>
                        <strong>
                          {person.name}
                        </strong>

                        <span>
                          {person.account}
                        </span>
                      </div>

                      <button>
                        Transfer →
                      </button>
                    </div>
                  )
                )}

              </div>
            </PageContainer>
          )}

          {/* DOCUMENTS */}

          {page === "documents" && (
            <PageContainer
              label="DOCUMENT CENTER"
              title="Documents & Statements"
              subtitle="Access your banking documents."
            >
              <div className="documents-grid">

                <DocumentCard
                  title="Savings Statement"
                  date="September 2026"
                />

                <DocumentCard
                  title="Current Account Statement"
                  date="September 2026"
                />

                <DocumentCard
                  title="Transaction Summary"
                  date="September 2026"
                />

                <DocumentCard
                  title="Annual Account Summary"
                  date="FY 2025–26"
                />

              </div>
            </PageContainer>
          )}

        </div>

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

/* ACCOUNT */

function AccountCard({
  account,
  active,
  onClick,
}) {
  return (
    <button
      className={`account-card ${
        active ? "account-card-active" : ""
      }`}
      onClick={onClick}
    >
      <div className="account-card-top">
        <span>{account.name}</span>
        <b>•••</b>
      </div>

      <strong>{account.number}</strong>

      <small>Available Balance</small>

      <h2>{account.balance}</h2>

      <div className="account-card-footer">
        View account details
        <span>→</span>
      </div>
    </button>
  );
}

/* TRANSACTIONS */

function TransactionList({
  items,
  detailed = false,
}) {
  return (
    <div
      className={`transaction-list ${
        detailed ? "transaction-list-detailed" : ""
      }`}
    >
      {items.map((item, index) => (
        <div
          className="transaction-row"
          key={index}
        >
          <div
            className={`transaction-icon ${
              item.type
            }`}
          >
            {item.type === "credit"
              ? "↓"
              : "↑"}
          </div>

          <div className="transaction-info">
            <strong>
              {item.name}
            </strong>

            <span>
              {item.date}
              {detailed &&
                ` • ${item.category}`}
            </span>
          </div>

          <strong
            className={`transaction-amount ${item.type}`}
          >
            {item.type === "credit"
              ? "+"
              : "-"}
            {item.amount}
          </strong>

          {detailed && (
            <button className="transaction-view">
              View
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* QUICK ACTION */

function QuickAction({
  icon,
  title,
  text,
  onClick,
}) {
  return (
    <button
      className="quick-action"
      onClick={onClick}
    >
      <div>{icon}</div>

      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>

      <b>→</b>
    </button>
  );
}

/* PAYMENT */

function PaymentCard({
  icon,
  title,
  text,
}) {
  return (
    <button className="payment-card">
      <div className="payment-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <span>
        Continue →
      </span>
    </button>
  );
}

/* DOCUMENT */

function DocumentCard({
  title,
  date,
}) {
  return (
    <div className="document-card">
      <div className="document-icon">
        PDF
      </div>

      <div>
        <strong>{title}</strong>

        <span>{date}</span>
      </div>

      <button>
        View →
      </button>
    </div>
  );
}

/* PAGE */

function PageContainer({
  label,
  title,
  subtitle,
  children,
}) {
  return (
    <section className="bank-page-container">

      <div className="bank-page-header">
        <div>
          <span>{label}</span>

          <h1>{title}</h1>

          <p>{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

export default CyberSecBankPortal;