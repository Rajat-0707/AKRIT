import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import "./auth.css";
import { useNavigate } from "react-router-dom";
import { apiBase, fetchJSON } from "../utils/api";

const ArtistAuth = () => {
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
      const photoFile = fd.get("photo");
      
      if (photoFile && photoFile.size > 0) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("role", "artist");
        formData.append("name", fd.get("name") || "");
        formData.append("email", fd.get("email") || "");
        formData.append("phone", fd.get("phone") || "");
        formData.append("category", fd.get("category") || "");
        formData.append("city", fd.get("city") || "");
        formData.append("portfolio_url", fd.get("portfolio_url") || "");
        formData.append("password", password);
        formData.append("photo", photoFile);
        
        const data = await fetchJSON(`${apiBase()}/api/register`, {
          method: "POST",
          body: formData,
        });
      } else {
        const data = await fetchJSON(`${apiBase()}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "artist",
            name: fd.get("name") || "",
            email: fd.get("email") || "",
            phone: fd.get("phone") || "",
            category: fd.get("category") || "",
            city: fd.get("city") || "",
            portfolio_url: fd.get("portfolio_url") || "",
            password,
          }),
        });
      }
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
          <span className="auth-badge">Professional Artist</span>
          <h1>Showcase your talent. Get discovered.</h1>
          <p>
            Create a professional profile to highlight your work, connect with clients, and
            receive booking opportunities tailored to your category.
          </p>
        </section>

        <section className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Create your artist account</h2>
            <p className="auth-subtitle">Let’s build your professional presence</p>
          </div>

          <form className="login-form" onSubmit={submit}>
            <input name="name" type="text" placeholder="Full Name / Stage Name" className="form-input" required />
            <input name="email" type="email" placeholder="Email Address" className="form-input" required />
            <input name="phone" type="tel" placeholder="Phone Number" className="form-input" />

            <select name="category" className="form-select" required>
              <option value="">Select Category</option>
              <option value="singer">Singer</option>
              <option value="dance">Dance Group</option>
              <option value="choreographer">Choreographer</option>
              <option value="teacher">Vocal Coach</option>
            </select>

            <div className="form-row">
              <input name="city" type="text" placeholder="City" className="form-input" />
              <input name="portfolio_url" type="url" placeholder="Portfolio / Social Link" className="form-input" />
            </div>

            <div className="form-row">
              <div className="file-input-wrapper">
                <label className="file-input-label">Profile Photo</label>
                <input name="photo" type="file" accept="image/*" className="form-input file-input" />
                <span className="file-input-hint">Upload a professional headshot (optional)</span>
              </div>
            </div>

            <input name="password" type="password" placeholder="Create Password" className="form-input" required />
            <input name="confirm" type="password" placeholder="Confirm Password" className="form-input" required />

            <div className="form-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
            </div>

            <Button className="btn btn-purple btn-full" type="submit">Create Account</Button>
            <div className="helper-text">We’ll never share your information without permission.</div>
          </form>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ArtistAuth;
