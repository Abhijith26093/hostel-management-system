import { useState } from "react";
import api from "../api/axios";
import "./Login.css";

function Login({ setToken, showRegister, onBackToLanding }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: forgot email, 2: reset password

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setForgotLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: forgotEmail,
      });

      setResetToken(response.data.resetToken);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process forgot password");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setForgotLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: forgotEmail,
        resetToken: resetToken,
        newPassword: newPassword,
      });

      alert("Password reset successful! Please login with your new password.");
      setShowForgotPassword(false);
      setStep(1);
      setForgotEmail("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Reset Password</h2>

          {error && <p className="error-message">{error}</p>}

          {step === 1 ? (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Reset Token"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn" disabled={forgotLoading}>
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="extra-links">
            <button onClick={() => {
              setShowForgotPassword(false);
              setStep(1);
              setError("");
              setForgotEmail("");
            }}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      if (user.profileImage) {
        localStorage.setItem("userProfileImage", user.profileImage);
      }

      // tell App that login succeeded
      setToken(token);

      alert(`Login successful as ${user.role}`);

    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <button onClick={onBackToLanding} className="back-btn">
          &larr;
        </button>
        <h2>Login</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="extra-links">
          <button
            className="forgot-password-btn"
            onClick={() => {
              setShowForgotPassword(true);
              setError("");
            }}
          >
            Forgot Password?
          </button>
        </div>

        <div className="register-link">
          <span>New user?</span>
          <button onClick={showRegister} className="register-link-btn">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;