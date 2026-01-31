import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminLostFound() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("claim-pending");

  const token = localStorage.getItem("token");

  const fetchItems = async () => {
    const res = await api.get("/lost-found", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const approveClaim = async (id) => {
    try {
      await api.patch(
        `/lost-found/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
    } catch (error) {
      alert("Failed to approve claim");
    }
  };

  const filteredItems =
    filter === "all"
      ? items
      : items.filter((item) => item.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔖 Manage Lost & Found Claims</h1>
        <p>Review and approve pending item claims</p>
      </div>

      <div className="filter-bar">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All Items
        </button>

        <button
          className={filter === "claim-pending" ? "active warning" : "warning"}
          onClick={() => setFilter("claim-pending")}
        >
          Pending Claims
        </button>

        <button
          className={filter === "claimed" ? "active approved-filter" : "approved-filter"}
          onClick={() => setFilter("claimed")}
        >
          Approved
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", marginTop: "40px" }}>
          No items to manage.
        </p>
      ) : filteredItems.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", marginTop: "40px" }}>
          No items in this category.
        </p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Status</th>
                <th>Reported By</th>
                <th>Claim Requested By</th>
                <th>Location</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.title}</strong>
                    <br />
                    <small style={{ color: "#666" }}>
                      {item.description}
                    </small>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {item.status === "claim-pending"
                        ? "PENDING"
                        : item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{item.reportedBy?.name || "Unknown"}</td>
                  <td>
                    {item.claimRequestedBy?.name || "-"}
                  </td>
                  <td>{item.location}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    {item.status === "claim-pending" && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => approveClaim(item._id)}
                      >
                        ✓ Approve
                      </button>
                    )}
                    {item.status === "claimed" && (
                      <span style={{ color: "#28a745", fontWeight: "600" }}>
                        ✓ Approved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminLostFound;