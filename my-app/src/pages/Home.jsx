import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedArtists from "../components/FeaturedArtists";
import Footer from "../components/Footer";
import AboutUs from "../components/ui/AboutUs";
import ContactUs from "../components/ui/ContactUs";
import ArtistDashboard from "./ArtistDashboard";
import FindArtists from "../components/FindArtists";
import { getUser } from "../utils/auth";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="app-container">
      <Navbar />

      {user?.role === 'artist' ? (
        <>
          <Hero />

          <section id="artist-dashboard" className="hero-section">
            <ArtistDashboard showLayout={false} />
          </section>

          <div className="partitioner"><hr /></div>
          <div id="about"><AboutUs /></div>

          <div className="partitioner"><hr /></div>
          <div id="contact"><ContactUs /></div>
        </>
      ) : (
        <>
          <Hero />

          {user && (
            <>
              <div className="partitioner"><hr /></div>
              <section id="find-artists">
                <FindArtists />
              </section>
            </>
          )}

          <div className="partitioner"><hr /></div>
          <FeaturedArtists />

          <div className="partitioner"><hr /></div>
          <div id="about"><AboutUs /></div>

          <div className="partitioner"><hr /></div>
          <div id="contact"><ContactUs /></div>
        </>
      )}

      <div className="partitioner"><hr /></div>
      <Footer />
    </div>
  );
};

export default Home;
