import { useEffect, useState } from "react";
import api from "../api/axios";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>⏳ Loading analytics...</div>;
  if (!data) return <div style={{ textAlign: "center", padding: "40px" }}>No data available</div>;

  // Calculate statistics
  const totalIssues = data.statusStats.reduce((sum, s) => sum + s.count, 0);
  // Treat reported, assigned, inprogress as pending
  const pendingStatuses = ["reported", "assigned", "inprogress"];
  const completedStatuses = ["resolved", "closed"];
  const pendingCount = data.statusStats
    .filter(s => pendingStatuses.includes(s._id))
    .reduce((sum, s) => sum + s.count, 0);
  const resolvedCount = data.statusStats
    .filter(s => completedStatuses.includes(s._id))
    .reduce((sum, s) => sum + s.count, 0);

  // Calculate average times
  const avgResponseTime = data.avgTimes ? 
    (data.avgTimes.avgResponseTime / (1000 * 60 * 60 * 24)).toFixed(1) + " days" : "N/A";
  const avgResolutionTime = data.avgTimes ? 
    (data.avgTimes.avgResolutionTime / (1000 * 60 * 60 * 24)).toFixed(1) + " days" : "N/A";

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#2c7be5", margin: "0 0 10px 0" }}>📊 Management Analytics</h1>
        <p style={{ color: "#718096", fontSize: "1.1rem", margin: 0 }}>Real-time insights into hostel operations</p>
      </div>

      {/* Key Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <MetricCard 
          icon="📋"
          label="Total Issues"
          value={totalIssues}
          subtext="All time"
          color="#2c7be5"
        />
        <MetricCard 
          icon="⏳"
          label="Pending"
          value={pendingCount}
          subtext="Awaiting response"
          color="#ffc107"
        />
        <MetricCard 
          icon="✅"
          label="Resolved"
          value={resolvedCount}
          subtext="Completed"
          color="#28a745"
        />
        <MetricCard 
          icon="⚡"
          label="Avg Response"
          value={avgResponseTime}
          subtext="Time to acknowledge"
          color="#667eea"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {/* Issue Categories Chart */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid #e0e7f0"
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#2c7be5", fontSize: "1.2rem" }}>
            📌 Issue Categories
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.categoryStats && data.categoryStats.length > 0 ? (
              data.categoryStats.map((c, idx) => {
                const maxCount = Math.max(...data.categoryStats.map(x => x.count));
                const percentage = (c.count / maxCount) * 100;
                return (
                  <div key={c._id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "600", color: "#2d3748" }}>{c._id}</span>
                      <span style={{ background: "#f0f5ff", padding: "4px 8px", borderRadius: "4px", fontWeight: "600", color: "#2c7be5" }}>
                        {c.count}
                      </span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "8px",
                      background: "#e0e7f0",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, #2c7be5 0%, #667eea 100%)`,
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#a0aec0" }}>No issue data available</p>
            )}
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid #e0e7f0"
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#2c7be5", fontSize: "1.2rem" }}>
            📊 Resolution Status
          </h3>
          {totalIssues > 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: `conic-gradient(#ffc107 0deg ${(pendingCount/totalIssues)*360}deg, #28a745 ${(pendingCount/totalIssues)*360}deg)`,
                  margin: "0 auto 12px"
                }} />
                <p style={{ margin: "0", color: "#2d3748", fontWeight: "600" }}>Pending vs Resolved</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", background: "#ffc107", borderRadius: "3px" }} />
                  <span style={{ fontWeight: "600", color: "#2d3748" }}>Pending: <span style={{ color: "#ffc107" }}>{pendingCount}</span></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "16px", height: "16px", background: "#28a745", borderRadius: "3px" }} />
                  <span style={{ fontWeight: "600", color: "#2d3748" }}>Resolved: <span style={{ color: "#28a745" }}>{resolvedCount}</span></span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "#a0aec0", textAlign: "center" }}>No issue data available</p>
          )}
        </div>
      </div>

      {/* Hostel-wise Density */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #e0e7f0",
        marginBottom: "40px"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#2c7be5", fontSize: "1.2rem" }}>
          🏢 Hostel/Block-wise Issue Density
        </h3>
        {data.hostelStats && data.hostelStats.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
            {data.hostelStats.map((h) => {
              const maxCount = Math.max(...data.hostelStats.map(x => x.count));
              return (
                <div key={h._id} style={{
                  background: '#fff',
                  border: '2px solid #2c7be5',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(44,123,229,0.07)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(44, 123, 229, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(44,123,229,0.07)";
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#2c7be5', fontWeight: '600' }}>
                    {h._id.includes('-') ? `Hostel ${h._id.split('-')[0]}, Block ${h._id.split('-')[1]}` : `Hostel ${h._id}`}
                  </p>
                  <p style={{ margin: '0', fontSize: '2rem', fontWeight: '800', color: '#2c7be5' }}>
                    {h.count}
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#718096' }}>
                    Issues reported
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#a0aec0" }}>No hostel data available</p>
        )}
      </div>

      {/* Time Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        <TimeMetricCard 
          icon="⏱️"
          label="Average Response Time"
          value={avgResponseTime}
          description="Time from issue report to first response"
        />
        <TimeMetricCard 
          icon="🎯"
          label="Average Resolution Time"
          value={avgResolutionTime}
          description="Time from report to complete resolution"
        />
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon, label, value, subtext, color }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: `2px solid ${color}`,
      transition: "all 0.3s ease",
      cursor: "pointer"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = `0 8px 24px rgba(44, 123, 229, 0.15)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{icon}</div>
      <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#718096", fontWeight: "600", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: "0 0 8px 0", fontSize: "2rem", fontWeight: "800", color: color }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "#a0aec0" }}>
        {subtext}
      </p>
    </div>
  );
}

// Time Metric Card Component
function TimeMetricCard({ icon, label, value, description }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: "1px solid #e0e7f0"
    }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{icon}</div>
      <h4 style={{ margin: "0 0 12px 0", color: "#2c7be5", fontSize: "1.1rem" }}>
        {label}
      </h4>
      <p style={{ margin: "0 0 12px 0", fontSize: "2.2rem", fontWeight: "800", color: "#2d3748" }}>
        {value}
      </p>
      <p style={{ margin: 0, color: "#718096", fontSize: "0.95rem" }}>
        {description}
      </p>
    </div>
  );
}

export default Analytics;
