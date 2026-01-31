import { useState, useEffect } from "react";
import api from "../api/axios";

function AdminCarousel() {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mediaType, setMediaType] = useState("image");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCarousels();
  }, []);

  const fetchCarousels = async () => {
    try {
      setLoading(true);
      const response = await api.get("/carousel/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCarousels(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load carousel items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setError("");
    setSuccess("");

    // Check file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size exceeds 100MB limit");
      return;
    }

    try {
      const data = new FormData();
      data.append("mediaType", mediaType);
      if (mediaType === "image") {
        data.append("image", file);
      } else {
        data.append("video", file);
      }

      await api.post("/carousel/admin", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(`${mediaType === "image" ? "Image" : "Video"} uploaded successfully!`);
      fetchCarousels();
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || `Failed to upload ${mediaType}`;
      setError(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      try {
        await api.delete(`/carousel/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Item deleted successfully!");
        fetchCarousels();
      } catch (err) {
        setError("Failed to delete item");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(
        `/carousel/admin/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCarousels();
    } catch (err) {
      setError("Failed to update item");
    }
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>⏳ Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>
      <h2>🎠 Manage Carousel Posters</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>Upload images or videos to display in carousel</p>

      {error && (
        <div style={{ background: "#fee", color: "#c33", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fcc" }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ background: "#efe", color: "#3c3", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #cfc" }}>
          ✅ {success}
        </div>
      )}

      <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", marginBottom: "30px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "12px" }}>
            Select Media Type
          </label>
          <div style={{ display: "flex", gap: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                value="image"
                checked={mediaType === "image"}
                onChange={(e) => setMediaType(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              📷 Image
            </label>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                value="video"
                checked={mediaType === "video"}
                onChange={(e) => setMediaType(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              🎥 Video
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
            {mediaType === "image" ? "📷 Upload Image" : "🎥 Upload Video"}
          </label>
          <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: "8px" }}>
            Max file size: 100MB
          </p>
          <input
            type="file"
            accept={mediaType === "image" ? "image/*" : "video/*"}
            onChange={(e) => {
              if (e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
                e.target.value = "";
              }
            }}
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #e0e7f0",
              borderRadius: "6px",
            }}
          />
        </div>
      </div>

      <h3>📂 Current Items ({carousels.length})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
        {carousels.map((item) => (
          <div key={item._id} style={{ border: "1px solid #e0e7f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
            {item.mediaType === "image" && item.image && (
              <img
                src={getFullUrl(item.image)}
                alt="Carousel"
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            )}
            {item.mediaType === "video" && item.video && (
              <video
                src={getFullUrl(item.video)}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            )}
            <div style={{ padding: "12px" }}>
              <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "12px" }}>
                {item.mediaType === "image" ? "📷 Image" : "🎥 Video"}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleToggle(item._id)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: item.isActive ? "#4caf50" : "#999",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {item.isActive ? "✓ Active" : "○ Inactive"}
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminCarousel;
