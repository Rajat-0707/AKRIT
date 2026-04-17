import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>Akrit</h3>
          <p>
            Connect with professional performers, choreographers, and vocal coaches. 
            Elevate your events with verified industry talent or advance your artistic career.
          </p>
        </div>
        
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li>
              <a href="/#about" onClick={(e) => {
                if(window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}>About Us</a>
            </li>
            <li><Link to="/">Find Artists</Link></li>
            <li>
              <a href="/#contact" onClick={(e) => {
                if(window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}>Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Services</h3>
          <ul className="footer-links">
            <li><Link to="/services/singer">Vocalists</Link></li>
            <li><Link to="/services/dance">Dance Groups</Link></li>
            <li><Link to="/services/choreographer">Choreographers</Link></li>
            <li><Link to="/services/teacher">Vocal Coaches</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} Akrit. All rights reserved.</div>
        <div className="footer-social">
          <a href="#" aria-label="Twitter">Twitter</a>
          <a href="#" aria-label="Instagram">Instagram</a>
          <a href="#" aria-label="LinkedIn">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
