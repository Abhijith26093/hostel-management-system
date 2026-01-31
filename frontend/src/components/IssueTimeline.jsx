import { useState } from "react";

function IssueTimeline({ statusTimestamps, currentStatus, assignedTo }) {
  const [expandedStep, setExpandedStep] = useState(null);

  const steps = [
    { key: "reported", label: "Reported", emoji: "📝" },
    { key: "assigned", label: "Assigned", emoji: "👨‍🔧" },
    { key: "inProgress", label: "In Progress", emoji: "🔄" },
    { key: "resolved", label: "Resolved", emoji: "✅" },
    { key: "closed", label: "Closed", emoji: "🔒" },
  ];

  const getColor = (stepKey) => {
    if (statusTimestamps?.[stepKey]) {
      return "#2ecc71"; // Green for completed
    }
    return "#bdc3c7"; // Gray for not completed
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      }),
      time: d.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      })
    };
  };

  return (
    <div className="issue-timeline-container">
      {/* Timeline Bullets */}
      <div className="timeline-bullets">
        {steps.map((step, index) => {
          const isCompleted = !!statusTimestamps?.[step.key];
          const formatted = formatDate(statusTimestamps?.[step.key]);

          return (
            <div key={step.key} className="timeline-step-container">
              <div className="timeline-step">
                {/* Connector line */}
                {index !== steps.length - 1 && (
                  <div 
                    className="timeline-connector"
                    style={{
                      backgroundColor: isCompleted ? "#2ecc71" : "#bdc3c7"
                    }}
                  />
                )}

                {/* Bullet point */}
                <div
                  className={`timeline-bullet ${isCompleted ? "completed" : "pending"}`}
                  style={{
                    backgroundColor: getColor(step.key),
                  }}
                  onClick={() => setExpandedStep(expandedStep === step.key ? null : step.key)}
                  title={isCompleted ? "Click for details" : "Not yet completed"}
                >
                  <span className="bullet-emoji">{step.emoji}</span>
                </div>

                {/* Label */}
                <div className="timeline-label">{step.label}</div>
              </div>

              {/* Expanded Details */}
              {expandedStep === step.key && isCompleted && (
                <div className="timeline-details">
                  <div className="detail-item">
                    <span className="detail-date">{formatted.date}</span>
                    <span className="detail-time">{formatted.time}</span>
                  </div>
                  {step.key === "assigned" && assignedTo && (
                    <div className="detail-item assigned-to">
                      <span className="detail-label">Assigned to:</span>
                      <span className="detail-value">{assignedTo}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IssueTimeline;
