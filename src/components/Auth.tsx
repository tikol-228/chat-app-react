import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import styles from "./Auth.module.css";
import Toast from "./Toast";

const Auth = () => {
  const navigate = useNavigate()

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!email.trim()) {
      setToastType("error");
      setToastMessage("Email is required");
      setShowToast(true);
      return;
    }

    if (!pass.trim()) {
      setToastType("error");
      setToastMessage("Password is required");
      setShowToast(true);
      return;
    }

    if (authMode === "register") {
      if (!confirmPass.trim()) {
        setToastType("error");
        setToastMessage("Please confirm your password");
        setShowToast(true);
        return;
      }

      if (pass !== confirmPass) {
        setToastType("error");
        setToastMessage("Passwords do not match");
        setShowToast(true);
        return;
      }

      // send to server
      try {
        const res = await fetch('http://localhost:8081/api/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });

        const data = await res.json();
        if (!res.ok) {
          setToastType('error');
          setToastMessage(data?.error || 'Registration failed');
          setShowToast(true);
          return;
        }

        setToastType('success');
        setToastMessage('Registered successfully');
        setShowToast(true);
        // clear form
        setEmail(''); setPass(''); setConfirmPass('');
        setAuthMode('login');
      } catch (err) {
        setToastType('error');
        setToastMessage('Network error');
        setShowToast(true);
      }

      return;
    }

    // login: call server to set auth cookie
    try {
      const res = await fetch('http://localhost:8081/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass })
      })
      const data = await res.json()
      if (!res.ok) {
        setToastType('error')
        setToastMessage(data?.error || 'Login failed')
        setShowToast(true)
        return
      }
      setToastType('success')
      setToastMessage('Logged in')
      setShowToast(true)
      // redirect to app
      setTimeout(() => {
        navigate('/')
      }, 400)
    } catch (err) {
      setToastType('error')
      setToastMessage('Network error')
      setShowToast(true)
    }
  };

  return (
    <div className={styles.container}>
      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
      <div className={styles.card}>
        <h2 className={styles.title}>
          {authMode === "login" ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={styles.input}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />

          {authMode === "register" && (
            <>
              <label htmlFor="confirm" className={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className={styles.input}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
            </>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.button}>
              {authMode === "login" ? "Log in" : "Sign up"}
            </button>
          </div>

          <div className={styles.muted}>
            {authMode === "login" ? (
              <>
                <a href="/forgot" className={styles.link}>
                  Forgot password?
                </a>
                <p>
                  Don’t have an account?{" "}
                  <span
                    className={styles.toggle}
                    onClick={() => setAuthMode("register")}
                  >
                    Register
                  </span>
                </p>
              </>
            ) : (
              <p>
                Already have an account?{" "}
                <span
                  className={styles.toggle}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;