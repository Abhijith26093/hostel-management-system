import { useState, useEffect } from "react";
import api from "../api/axios";

function Carousel() {
  const [carousels, setCarousels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        console.log("Fetching carousel from /carousel");
        const response = await api.get("/carousel");
        console.log("Carousel data received:", response.data);
        setCarousels(response.data);
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load carousel:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCarousels();
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (carousels.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carousels.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carousels.length]);

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>Loading carousel...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>Note: No carousel items yet. Admin can upload posters to display here.</div>;
  }

  if (carousels.length === 0) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>No carousel items. Admin can upload images/videos to display.</div>;
  }

  const current = carousels[currentIndex];

  return (
    <div className="carousel-container">
      <div className="carousel-slide-simple">
        {current.mediaType === "image" && current.image && (
          <img src={getFullUrl(current.image)} alt="Carousel" className="carousel-simple-media" />
        )}

        {current.mediaType === "video" && current.video && (
          <video
            src={getFullUrl(current.video)}
            className="carousel-simple-media"
            autoPlay
            muted
            loop
          />
        )}

        {/* Carousel Dots */}
        <div className="carousel-controls">
          {carousels.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Carousel;
