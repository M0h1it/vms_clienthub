import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaLock, FaEnvelope, FaInfoCircle } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  const lastActivity = localStorage.getItem("lastActivity");

  if (token && lastActivity) {
    const now = Date.now();
    const SESSION_TIMEOUT = 30 * 60 * 1000;

    if (now - lastActivity < SESSION_TIMEOUT) {
      navigate("/");
    } else {
      localStorage.clear(); // साफ करो expired data
    }
  }
}, [navigate]);
  useEffect(() => {
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = function () {
    window.history.go(1);
  };
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.admin));
      localStorage.setItem("lastActivity", Date.now());

      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container shadow-lg">
        {/* Branding Side */}
        <div className="login-branding d-none d-lg-flex">
          <div className="branding-content">
            <div className="brand-logo-white mb-4">
              <FaShieldAlt size={40} />
            </div>

            <h2 className="fw-bold">VMS Admin Portal</h2>

            <p className="opacity-75">
              Secure access for administrators to manage visitors, employees,
              and system operations.
            </p>
          </div>

          <div className="branding-footer">
            <small>© 2026 Visitor Management System</small>
          </div>
        </div>

        {/* Login Form */}
        <div className="login-form-area">
          <div className="form-inner">
            <div className="mb-5">
              <h3 className="fw-bold text-dark">Admin Login</h3>
              <p className="text-muted">Sign in to access the dashboard</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 small d-flex align-items-center">
                <FaInfoCircle className="me-2" /> {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  Email Address
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FaEnvelope className="text-muted" />
                  </span>

                  <input
                    type="email"
                    className="form-control form-control-lg border-start-0 ps-0"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Password</label>

                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FaLock className="text-muted" />
                  </span>

                  <input
                    type="password"
                    className="form-control form-control-lg border-start-0 ps-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-100 btn-lg fw-bold shadow-sm py-3 mb-4"
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background-color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 1000px;
          min-height: 600px;
          background: #fff;
          border-radius: 24px;
          display: flex;
          overflow: hidden;
        }

        .login-branding {
          flex: 1;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .login-branding::after {
          content: "";
          position: absolute;
          top: -10%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 50%;
        }

        .login-form-area {
          flex: 1;
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-inner {
          width: 100%;
          max-width: 360px;
        }

        .input-group-text {
          border: 1.5px solid #e5e7eb;
          color: #9ca3af;
        }

        .form-control {
          border: 1.5px solid #e5e7eb;
          font-size: 0.95rem;
        }

        .form-control:focus {
          border-color: #3b82f6;
          box-shadow: none;
        }

        .btn-primary {
          background-color: #2563eb;
          border: none;
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          background-color: #1d4ed8;
        }

        @media (max-width: 991px) {
          .login-form-area {
            padding: 40px;
          }

          .login-container {
            max-width: 500px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
