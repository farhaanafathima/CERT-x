import React, { useState } from "react";
import "./BankLogin.css";

const USERS = [
  { username: "srinivasan", password: "Sri@123" },
  { username: "thirunavukarasu", password: "Thiru@123" },
  { username: "abdul_vahith", password: "Abdul@123" },
  { username: "priya", password: "Priya@123" },
  { username: "farhaana", password: "Farhaana@123" },
  { username: "sherin", password: "Sherin@123" },
];

function CyberSecBankLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const user = USERS.find(
      (item) =>
        item.username.toLowerCase() ===
          username.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setError("Invalid User ID or Password.");
      return;
    }

    onLogin(user.username);
  };

  return (
    <div className="bank-login-page">

      <div className="bank-login-left">

        <div className="bank-login-brand">
          <div className="bank-logo-large">
            <img
              src="/cybersecbank-logo.png"
              alt="CyberSec Bank"
            />
          </div>

          <div>
            <h1>CyberSec Bank</h1>
            <p>Secure Digital Banking</p>
          </div>
        </div>

        <div className="bank-login-message">
          <span>SECURE DIGITAL BANKING</span>

          <h2>
            Banking made
            <br />
            <strong>simple & secure.</strong>
          </h2>

          <p>
            Access your accounts, transactions and
            digital security services from one secure
            banking portal.
          </p>

          <div className="security-points">

            <div>
              <span>✓</span>
              Secure Login
            </div>

            <div>
              <span>✓</span>
              Protected Banking
            </div>

            <div>
              <span>✓</span>
              Digital Security
            </div>

          </div>
        </div>

        <div className="bank-login-footer">
          © 2026 CyberSec Bank
        </div>

      </div>

      <div className="bank-login-right">

        <div className="login-card">

          <div className="mobile-bank-logo">
            <img
              src="/cybersecbank-logo.png"
              alt="CyberSec Bank"
            />
          </div>

          <div className="login-heading">
            <span>WELCOME BACK</span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to continue
              securely.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>User ID</label>

              <div className="input-wrapper">
                <span>◉</span>

                <input
                  type="text"
                  placeholder="Enter your User ID"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="input-wrapper">
                <span>●</span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="bank-signin-button"
            >
              Sign In
              <span>→</span>
            </button>

          </form>

          <div className="secure-login-note">
            <span>🔒</span>
            Secure connection • CyberSec Bank
          </div>

        </div>

      </div>

    </div>
  );
}

export default CyberSecBankLogin;