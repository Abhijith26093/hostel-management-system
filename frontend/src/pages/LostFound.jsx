import { useEffect, useState } from "react";
import api from "../api/axios";


function LostFound() {
  
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("lost");
  const [image, setImage] = useState(null);


  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  const fetchItems = async () => {
    const res = await api.get("/lost-found", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("itemName", itemName);
  formData.append("description", description);
  formData.append("location", location);
  formData.append("date", date);
  formData.append("status", status);


  if (image) {
    formData.append("image", image);
  }

  await api.post("/lost-found", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  setItemName("");
  setDescription("");
  setLocation("");
  setDate("");
  setStatus("lost");
  setImage(null);
  setShowForm(false);
  fetchItems();
};


  const claimItem = async (id) => {
    await api.post(
      `/lost-found/${id}/claim`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchItems();
  };

  const approveClaim = async (id) => {
    await api.patch(
      `/lost-found/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchItems();
  };

  const filteredItems =
  filter === "all"
    ? items
    : items.filter((item) => item.status === filter);


 return (
  <div className="page">
    <h2>🎒 Lost & Found</h2>
    <button
  className="add-lost-btn"
  onClick={() => setShowForm(!showForm)}
>
  ➕ Report Lost / Found Item
</button>

{showForm && (
  <form className="lostfound-form" onSubmit={handleSubmit}>
    <input
      placeholder="Item title"
      value={itemName}
      onChange={(e) => setItemName(e.target.value)}
      required
    />

    <textarea
      placeholder="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      required
    />

    <input
      placeholder="Location"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      required
    />

    <input
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      required
    />

    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
    >
      <option value="lost">Lost</option>
      <option value="found">Found</option>
    </select>

    <input
      type="file"
      accept="image/*"
      onChange={(e) => setImage(e.target.files[0])}
      title="Click to upload or drag and drop"
    />
    {image && (
      <div style={{
        marginBottom: "16px",
        padding: "10px 16px",
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
        borderRadius: "8px",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        color: "#667eea",
        fontWeight: "500"
      }}>
        ✅ File selected: {image.name}
      </div>
    )}

    <button type="submit" className="claim-btn">
      Submit
    </button>
  </form>
)}


      <div className="filter-bar">
  <button
    className={filter === "all" ? "active" : ""}
    onClick={() => setFilter("all")}
  >
    All
  </button>

  <button
    className={filter === "lost" ? "active lost" : "lost"}
    onClick={() => setFilter("lost")}
  >
    Lost
  </button>

  <button
    className={filter === "found" ? "active found" : "found"}
    onClick={() => setFilter("found")}
  >
    Found
  </button>

  <button
    className={filter === "claimed" ? "active claimed" : "claimed"}
    onClick={() => setFilter("claimed")}
  >
    Claimed
  </button>
</div>

    {items.length === 0 ? (
      <p>No lost or found items reported.</p>
    ) : (
      <div className="lostfound-grid">
        {filteredItems.map((item) => (

          <div key={item._id} className="lostfound-card">
            {/* Image wrapper with badge */}
            <div className="lostfound-image-wrapper">
              {item.imageUrl && (
                <img
                  src={`http://localhost:5000${item.imageUrl}`}
                  alt="Lost item"
                  className="lostfound-image"
                />
              )}
              <span className={`status-badge ${item.status}`}>
                {item.status === "claim-pending" ? "PENDING" : item.status.toUpperCase()}
              </span>
            </div>

            {/* Content */}
            <div className="lostfound-content">
              <div className="lostfound-desc">
                {item.title}
              </div>

              <p className="lostfound-desc" style={{ fontSize: '0.95rem', fontWeight: '400', color: '#666', marginTop: '8px' }}>
                {item.description}
              </p>

              <div className="lostfound-meta">
                📍 {item.location} <br />
                📅 {new Date(item.date).toLocaleDateString()}
              </div>

              {/* Show appropriate buttons based on status and user role */}
              {item.status === "lost" && item.reportedBy._id !== userId && (
                <button
                  className="btn btn-success btn-block"
                  onClick={() => claimItem(item._id)}
                >
                  ✓ I Found It
                </button>
              )}

              {item.status === "found" && userId && item.reportedBy._id !== userId && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => claimItem(item._id)}
                >
                  🙋 It's Mine
                </button>
              )}

              {item.status === "claim-pending" && role === "admin" && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => approveClaim(item._id)}
                >
                  ✓ Approve Claim
                </button>
              )}

              {item.status === "claimed" && (
                <p style={{ color: '#28a745', fontWeight: '600', margin: '12px 0 0 0' }}>✓ Item Claimed</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

}

export default LostFound;