import { useState } from "react";
import api from "../api/axios";

function AdminAnnouncements({ fetchAnnouncements }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [hostel, setHostel] = useState("ALL");
  const [block, setBlock] = useState("ALL");
  const [targetRole, setTargetRole] = useState("all");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/announcements",
        { title, message, type, hostel, block, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle("");
      setMessage("");
      setType("general");
      setHostel("ALL");
      setBlock("ALL");
      setTargetRole("all");
      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to publish announcement:", error);
      alert("Failed to publish announcement.");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h2>Admin – Announcements</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="general">General</option>
          <option value="cleaning">Cleaning</option>
          <option value="pest-control">Pest Control</option>
          <option value="water">Water</option>
          <option value="electricity">Electricity</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select value={hostel} onChange={(e) => setHostel(e.target.value)}>
          <option value="ALL">All Hostels</option>
          <option value="A">Hostel A</option>
          <option value="B">Hostel B</option>
        </select>

        <select value={block} onChange={(e) => setBlock(e.target.value)}>
          <option value="ALL">All Blocks</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>

        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        >
          <option value="all">All</option>
          <option value="student">Students</option>
          <option value="management">Management</option>
        </select>

        <button type="submit">Publish Announcement</button>
      </form>
    </div>
  );
}

export default AdminAnnouncements;