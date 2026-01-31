import { useEffect, useState } from "react";
import api from "../api/axios";
import IssueTimeline from "../components/IssueTimeline";

// Helper function to convert relative URLs to absolute
const getFullUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url; // Already absolute
  return `http://localhost:5000${url}`; // Convert relative to absolute
};


function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("my-issues"); // "my-issues" or "all-issues"
  const [statusFilter, setStatusFilter] = useState("active"); // "active" or "closed"
  const userId = localStorage.getItem("userId");

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/issues", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIssues(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load issues");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter issues based on view
  const filteredIssues = 
    view === "my-issues" 
      ? issues.filter(i => i.createdBy._id === userId)
      : issues.filter(i => i.visibility === "public");

  // Priority order for sorting
  const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };

  // Separate closed and active issues, then sort by priority
  const activeIssues = filteredIssues
    .filter(i => i.status !== "closed")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  const closedIssues = filteredIssues
    .filter(i => i.status === "closed")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const displayedIssues = statusFilter === "active" ? activeIssues : closedIssues;

  const categoryEmojis = {
    electrical: "⚡",
    plumbing: "🚰",
    cleanliness: "🧹",
    internet: "📡",
    furniture: "🪑",
    other: "❓"
  };

  const getStatusIcon = (status) => {
    const icons = {
      reported: "📝",
      assigned: "👨‍🔧",
      "in-progress": "🔄",
      resolved: "✅"
    };
    return icons[status] || "📝";
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "60px" }}>
        <p style={{ fontSize: "1.1rem", color: "var(--text-light)" }}>⏳ Loading issues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px" }}>
          <div>
            <h1>📋 Issues</h1>
            <p>Track and manage hostel issues</p>
          </div>
          <button
            onClick={fetchIssues}
            className="btn btn-secondary btn-small"
            style={{ height: "fit-content" }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "20px" }}>
          {error}
          <button 
            onClick={fetchIssues} 
            style={{ marginLeft: "10px", background: "#dc3545", color: "white", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={view === "my-issues" ? "toggle-btn active" : "toggle-btn"}
          onClick={() => setView("my-issues")}
        >
          👤 My Issues
        </button>
        <button
          className={view === "all-issues" ? "toggle-btn active" : "toggle-btn"}
          onClick={() => setView("all-issues")}
        >
          👥 All Public Issues
        </button>
      </div>

      {/* Status Filter Toggle */}
      <div className="view-toggle" style={{ marginBottom: "30px" }}>
        <button
          className={statusFilter === "active" ? "toggle-btn active" : "toggle-btn"}
          onClick={() => setStatusFilter("active")}
        >
          🔄 Active Issues
        </button>
        <button
          className={statusFilter === "closed" ? "toggle-btn active" : "toggle-btn"}
          onClick={() => setStatusFilter("closed")}
        >
          ✅ Closed Issues
        </button>
      </div>

      {/* Stats */}
      <div className="stats-mini">
        {view === "my-issues" ? (
          <>
            <div className="stat-mini">
              <span className="stat-mini-number">{activeIssues.length}</span>
              <span className="stat-mini-label">Active Issues</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-number">{activeIssues.filter(i => i.status === "reported").length}</span>
              <span className="stat-mini-label">New</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-number">{activeIssues.filter(i => i.status === "inprogress").length}</span>
              <span className="stat-mini-label">In Progress</span>
            </div>
            <div className="stat-mini">
              <span className="stat-mini-number">{closedIssues.length}</span>
              <span className="stat-mini-label">Closed</span>
            </div>
          </>
        ) : (
          <div className="stat-mini">
            <span className="stat-mini-number">{activeIssues.length}</span>
            <span className="stat-mini-label">Public Issues</span>
          </div>
        )}
      </div>

      {/* Issues List - Active Issues */}
      {activeIssues.length === 0 && closedIssues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "1.2rem", color: "var(--text-light)", marginBottom: "10px" }}>
            {view === "my-issues" ? "📭 No issues reported yet" : "🔍 No public issues found"}
          </p>
          <p style={{ color: "#999" }}>
            {view === "my-issues" 
              ? "Start reporting issues to track them here" 
              : "All reported issues are private"}
          </p>
        </div>
      ) : displayedIssues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "1.2rem", color: "var(--text-light)", marginBottom: "10px" }}>
            {statusFilter === "active" ? "🎉 No active issues" : "📭 No closed issues"}
          </p>
          <p style={{ color: "#999" }}>
            {statusFilter === "active" 
              ? "All issues have been resolved!" 
              : "Start reporting issues to see them here"}
          </p>
        </div>
      ) : (
        <div className="issues-container">
          {displayedIssues.map((issue) => (
            <div
              key={issue._id}
              className={`issue-card priority-${issue.priority.toLowerCase()}`}
            >
              {/* Header with title and badges */}
              <div className="issue-card-header">
                <div className="issue-card-main">
                  <h3 className="issue-card-title">
                    {getStatusIcon(issue.status)} {issue.title}
                  </h3>
                  <div className="issue-card-meta">
                    <span className="issue-badge-category">
                      {categoryEmojis[issue.category]} {issue.category.toUpperCase()}
                    </span>
                    {view === "all-issues" && (
                      <span className="issue-badge-student">
                        👤 {issue.createdBy?.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="issue-card-badges">
                  <span className={`status-badge-issue status-${issue.status.replace("-", "")}`}>
                    {issue.status.replace("-", " ").toUpperCase()}
                  </span>
                  {view === "my-issues" && (
                    <span className={`visibility-badge ${issue.visibility}`}>
                      {issue.visibility === "public" ? "👥 PUBLIC" : "🔒 PRIVATE"}
                    </span>
                  )}
                  <span className={`priority-badge priority-${issue.priority}`}>
                    {issue.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="issue-card-description">
                {issue.description}
              </p>

              {/* Media/Attachments Section */}
              {issue.attachments && issue.attachments.length > 0 && (
                <div className="issue-card-attachments">
                  <div style={{ marginBottom: "8px", fontWeight: "500", color: "#555" }}>📎 Attachments</div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {issue.attachments.map((attachment, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        {attachment.fileType.startsWith("image") ? (
                          <img
                            src={getFullUrl(attachment.fileUrl)}
                            alt={`Attachment ${idx + 1}`}
                            style={{
                              maxWidth: "150px",
                              maxHeight: "150px",
                              borderRadius: "8px",
                              border: "2px solid #e0e0e0",
                              cursor: "pointer",
                              objectFit: "cover"
                            }}
                            onClick={() => window.open(getFullUrl(attachment.fileUrl), "_blank")}
                          />
                        ) : (
                          <video
                            controls
                            style={{
                              maxWidth: "150px",
                              maxHeight: "150px",
                              borderRadius: "8px",
                              border: "2px solid #e0e0e0"
                            }}
                          >
                            <source src={getFullUrl(attachment.fileUrl)} type={attachment.fileType} />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <small style={{ color: "#888", fontSize: "0.8rem", maxWidth: "150px", textAlign: "center", wordBreak: "break-word" }}>
                          {attachment.fileName}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Section */}
              <div className="issue-card-info">
                <div className="info-item">
                  <span className="info-label">📅 Reported</span>
                  <span className="info-value">
                    {new Date(issue.statusTimestamps.reported).toLocaleString()}
                  </span>
                </div>

                {issue.statusTimestamps.assigned && (
                  <div className="info-item">
                    <span className="info-label">👨‍🔧 Assigned</span>
                    <span className="info-value">
                      {new Date(issue.statusTimestamps.assigned).toLocaleString()}
                    </span>
                  </div>
                )}

                {issue.statusTimestamps.inProgress && (
                  <div className="info-item">
                    <span className="info-label">🔄 In Progress</span>
                    <span className="info-value">
                      {new Date(issue.statusTimestamps.inProgress).toLocaleString()}
                    </span>
                  </div>
                )}

                {issue.statusTimestamps.resolved && (
                  <div className="info-item">
                    <span className="info-label">✅ Resolved</span>
                    <span className="info-value">
                      {new Date(issue.statusTimestamps.resolved).toLocaleString()}
                    </span>
                  </div>
                )}

                {issue.assignedTo && (
                  <div className="info-item">
                    <span className="info-label">🔧 Handled by</span>
                    <span className="info-value">{issue.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Timeline - only show for my issues */}
              {view === "my-issues" && (
                <div className="issue-card-timeline">
                  <IssueTimeline
                    statusTimestamps={issue.statusTimestamps}
                    currentStatus={issue.status.replace("-", "")}
                    assignedTo={issue.assignedTo}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyIssues;
