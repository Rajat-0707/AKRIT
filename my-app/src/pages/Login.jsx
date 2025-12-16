import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import "./auth.css";
import { setToken } from "../utils/auth";
import { apiBase, fetchJSON } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchJSON(`${apiBase()}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role || undefined,
        }),
      });
      if (data.token) setToken(data.token);
      try { localStorage.setItem('ac_user', JSON.stringify(data.user || {})); } catch {}
      if ((data.user?.role || '') === 'artist') {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-page">
        <Navbar />
        <div className="auth-wrapper">
          <section className="auth-hero">
            <h1>Sign in to continue</h1>
            <p>
              Access your dashboard to manage bookings, update your profile, and connect with the
              community. New here? Create an account in seconds.
            </p>
            <div style={{ marginTop: 12 }}>
<Link to="/auth" className="btn btn-outlinehover:bg-blue-50 transition-colors duration-200 hover:text-blue-700">Create an account</Link>            </div>
          </section>

          <section className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Login</h2>
              <p className="auth-subtitle">Use your email and password to continue</p>
            </div>

            <form className="login-form" onSubmit={submit}>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                type="email"
                placeholder="Email Address"
                className="form-input"
                required
              />
              <input
                name="password"
                value={form.password}
                onChange={onChange}
                type="password"
                placeholder="Password"
                className="form-input"
                required
              />

              <select name="role" value={form.role} onChange={onChange} className="form-select">
                <option value="">Any Role</option>
                <option value="client">Client</option>
                <option value="artist">Artist</option>
              </select>

              <div className="form-checkbox" style={{ marginTop: 6 }}>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>

              {error && <div className="error" style={{ color: "#b91c1c" }}>{error}</div>}

              <Button className="btn btn-purple btn-full" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="helper-text">Forgot password? <a href="#">Reset it</a></div>
            </form>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
