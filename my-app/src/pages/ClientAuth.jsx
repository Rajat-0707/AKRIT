import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import "../css/auth.css";
import { useNavigate } from "react-router-dom";
import { apiBase, fetchJSON } from "../utils/api";

const ClientAuth = () => {
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password");
    const confirm = fd.get("confirm");
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      await fetchJSON(`${apiBase()}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "client",
          business_type: fd.get("business_type") || "",
          address_line: fd.get("address_line") || "",
          city: fd.get("city") || "",
          state_region: fd.get("state_region") || "",
          postal_code: fd.get("postal_code") || "",
          country: fd.get("country") || "",
          email: fd.get("email") || "",
          password,
        }),
      });
      alert("Account created! Sign in now");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  };
  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-wrapper">
        <section className="auth-hero">
          <span className="auth-badge">Event Organizer</span>
          <h1>Book world-class artists with confidence</h1>
          <p>
            Create your organizer account to browse verified performers, manage inquiries,
            and streamline bookings with industrial-grade tools.
          </p>
        </section>

        <section className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Start planning unforgettable events today</p>
          </div>

          <form className="login-form" onSubmit={submit}>
            <select name="business_type" className="form-select" required>
              <option value="">Select Business Type</option>
              <option value="corporate">Corporate</option>
              <option value="wedding">Wedding Planning</option>
              <option value="private">Private Event</option>
              <option value="other">Other</option>
            </select>

            <input name="address_line" type="text" placeholder="Business Address" className="form-input" required />
            <div className="form-row">
              <input name="city" type="text" placeholder="City" className="form-input" required />
              <input name="state_region" type="text" placeholder="State/Region" className="form-input" required />
            </div>
            <div className="form-row">
              <input name="postal_code" type="text" placeholder="Postal Code" className="form-input" required />
              <select name="country" className="form-select" required>
                <option value="">Country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
              </select>
            </div>

            <input name="email" type="email" placeholder="Email Address" className="form-input" required />
            <input name="password" type="password" placeholder="Create Password" className="form-input" required />
            <input name="confirm" type="password" placeholder="Confirm Password" className="form-input" required />

            <div className="form-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
            </div>

            <Button className="btn btn-purple btn-full" type="submit">Create Account</Button>
            <div className="helper-text">By continuing you agree to our terms and privacy policy.</div>
          </form>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ClientAuth;
