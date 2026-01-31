import { useEffect, useState } from "react";
import api from "../api/axios";

// Helper function to convert relative URLs to absolute
const getFullUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url; // Already absolute
  return `http://localhost:5000${url}`; // Convert relative to absolute
};

function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // "active" or "closed"

  const token = localStorage.getItem("token");

  const fetchIssues = async () => {
    try {
      const response = await api.get("/issues", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIssues(response.data);
    } catch (err) {
      setError("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const updateStatus = async (id, status, assignedTo) => {
    try {
      await api.patch(
        `/issues/${id}/status`,
        { status, assignedTo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchIssues(); // refresh list
    } catch (err) {
      alert("Failed to update issue");
    }
  };

  // Priority order for sorting
  const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };

  // Separate closed and active issues, then sort by priority
  const activeIssues = issues
    .filter(i => i.status !== "closed")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const closedIssues = issues
    .filter(i => i.status === "closed")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const displayedIssues = statusFilter === "active" ? activeIssues : closedIssues;

  if (loading) return <p style={{ textAlign: "center", paddingTop: "60px" }}>⏳ Loading issues...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", paddingTop: "60px" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: "2.2rem", color: "#2c7be5", marginBottom: "8px", fontWeight: 800 }}>🛠️ Issue Management</h1>
      <p style={{ color: "#718096", marginBottom: "32px", fontSize: "1.1rem" }}>Total: <span style={{ color: "#2c7be5", fontWeight: 700 }}>{activeIssues.length}</span> active • <span style={{ color: "#28a745", fontWeight: 700 }}>{closedIssues.length}</span> closed</p>

      {/* Status Filter Toggle */}
      <div style={{ marginBottom: "32px", display: "flex", gap: "12px" }}>
        <button
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            border: statusFilter === "active" ? "2px solid #2c7be5" : "1px solid #e0e7f0",
            background: statusFilter === "active" ? "#eaf4ff" : "#fff",
            color: statusFilter === "active" ? "#2c7be5" : "#718096",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: statusFilter === "active" ? "0 2px 8px rgba(44,123,229,0.07)" : "none"
          }}
          onClick={() => setStatusFilter("active")}
        >
          🔄 Active Issues ({activeIssues.length})
        </button>
        <button
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            border: statusFilter === "closed" ? "2px solid #28a745" : "1px solid #e0e7f0",
            background: statusFilter === "closed" ? "#eafaf1" : "#fff",
            color: statusFilter === "closed" ? "#28a745" : "#718096",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: statusFilter === "closed" ? "0 2px 8px rgba(40,167,69,0.07)" : "none"
          }}
          onClick={() => setStatusFilter("closed")}
        >
          ✅ Closed Issues ({closedIssues.length})
        </button>
      </div>

      {activeIssues.length === 0 && closedIssues.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", paddingTop: "40px" }}>No issues found.</p>
      ) : displayedIssues.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", paddingTop: "40px" }}>
          {statusFilter === "active" ? "No active issues" : "No closed issues"}
        </p>
      ) : (
        <div style={{ marginBottom: "50px", display: "grid", gap: "24px" }}>
          {displayedIssues.map((issue) => (
            <div
              key={issue._id}
              style={{
                background: '#fff',
                border: '2px solid #e0e7f0',
                borderLeft: `8px solid ${issue.priority === 'emergency' ? '#e53e3e' : issue.priority === 'high' ? '#f59e42' : issue.priority === 'medium' ? '#2c7be5' : '#718096'}`,
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(44,123,229,0.07)',
                padding: '28px 24px',
                marginBottom: '0',
                transition: 'box-shadow 0.2s',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(44,123,229,0.13)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(44,123,229,0.07)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#2c7be5', fontWeight: 700, margin: 0 }}>{issue.title}</h3>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: issue.status === 'closed' ? '#eafaf1' : issue.status === 'resolved' ? '#eaf4ff' : '#fff',
                  color: issue.status === 'closed' ? '#28a745' : issue.status === 'resolved' ? '#2c7be5' : '#718096',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: `1px solid ${issue.status === 'closed' ? '#28a745' : issue.status === 'resolved' ? '#2c7be5' : '#e0e7f0'}`
                }}>{issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</span>
              </div>
              <p style={{ color: '#212529', fontSize: '1.05rem', margin: '0 0 8px 0' }}>{issue.description}</p>

              {/* Media/Attachments Section */}
              {issue.attachments && issue.attachments.length > 0 && (
                <div style={{ marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f7faff', borderRadius: '8px', border: '1px solid #e0e7f0' }}>
                  <div style={{ marginBottom: '8px', fontWeight: '500', color: '#2c7be5' }}>📎 Attachments</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {issue.attachments.map((attachment, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        {attachment.fileType.startsWith('image') ? (
                          <img
                            src={getFullUrl(attachment.fileUrl)}
                            alt={`Attachment ${idx + 1}`}
                            style={{
                              maxWidth: '120px',
                              maxHeight: '120px',
                              borderRadius: '8px',
                              border: '1px solid #e0e7f0',
                              cursor: 'pointer',
                              objectFit: 'cover',
                              boxShadow: '0 1px 4px rgba(44,123,229,0.07)'
                            }}
                            onClick={() => window.open(getFullUrl(attachment.fileUrl), '_blank')}
                          />
                        ) : (
                          <video
                            controls
                            style={{
                              maxWidth: '120px',
                              maxHeight: '120px',
                              borderRadius: '8px',
                              border: '1px solid #e0e7f0',
                              boxShadow: '0 1px 4px rgba(44,123,229,0.07)'
                            }}
                          >
                            <source src={getFullUrl(attachment.fileUrl)} type={attachment.fileType} />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <small style={{ color: '#718096', fontSize: '0.75rem', maxWidth: '120px', textAlign: 'center', wordBreak: 'break-word' }}>
                          {attachment.fileName}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <div>
                  <span style={{ color: '#718096', fontWeight: 600 }}>👤 Student:</span> {issue.createdBy?.name}
                </div>
                <div>
                  <span style={{ color: '#718096', fontWeight: 600 }}>📍 Location:</span> {issue.createdBy?.hostel} / {issue.createdBy?.block} / {issue.createdBy?.room}
                </div>
                <div>
                  <span style={{ color: '#718096', fontWeight: 600 }}>⚡ Priority:</span> <span style={{
                    padding: '2px 10px',
                    borderRadius: '6px',
                    background: issue.priority === 'emergency' ? '#e53e3e' : issue.priority === 'high' ? '#f59e42' : issue.priority === 'medium' ? '#eaf4ff' : '#f7fafc',
                    color: issue.priority === 'emergency' ? '#fff' : issue.priority === 'high' ? '#fff' : issue.priority === 'medium' ? '#2c7be5' : '#718096',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: '1px solid #e0e7f0',
                  }}>{issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.95em', marginTop: '8px', color: '#718096', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <strong>Reported:</strong> {new Date(issue.statusTimestamps.reported).toLocaleString()}
                </div>
                {issue.statusTimestamps.assigned && (
                  <div>
                    <strong>Assigned:</strong> {new Date(issue.statusTimestamps.assigned).toLocaleString()}
                  </div>
                )}
                {issue.statusTimestamps.inProgress && (
                  <div>
                    <strong>In Progress:</strong> {new Date(issue.statusTimestamps.inProgress).toLocaleString()}
                  </div>
                )}
                {issue.statusTimestamps.resolved && (
                  <div>
                    <strong>Resolved:</strong> {new Date(issue.statusTimestamps.resolved).toLocaleString()}
                  </div>
                )}
                {issue.statusTimestamps.closed && (
                  <div>
                    <strong>Closed:</strong> {new Date(issue.statusTimestamps.closed).toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  defaultValue={issue.status}
                  onChange={e => updateStatus(issue._id, e.target.value, issue.assignedTo)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e0e7f0',
                    background: '#f7fafc',
                    color: '#2c7be5',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="reported">Reported</option>
                  <option value="assigned">Assigned</option>
                  <option value="inprogress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <input
                  type="text"
                  placeholder="Assign staff"
                  defaultValue={issue.assignedTo || ''}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e0e7f0',
                    background: '#f7fafc',
                    color: '#212529',
                    fontWeight: 500,
                    fontSize: '1rem',
                    marginLeft: '0'
                  }}
                  onBlur={e => updateStatus(issue._id, issue.status, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminIssues;
