import { useState } from "react";
import api from "../api/axios";

function Announcements({ announcements, setAnnouncements, fetchAnnouncements }) {
  const [filter, setFilter] = useState("all");
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState({});


  const REACTION_EMOJIS = ["👍", "❤️", "😂", "😢", "😮", "🔥", "🎉"];

  const getTypeIcon = (type) => {
    const icons = {
      general: "📢",
      cleaning: "🧹",
      water: "💧",
      electricity: "⚡",
      "pest-control": "🦠",
      maintenance: "🔧",
    };
    return icons[type] || "📢";
  };

  const getTypeColor = (type) => {
    const colors = {
      general: "#2c7be5",
      cleaning: "#28a745",
      water: "#17a2b8",
      electricity: "#ffc107",
      "pest-control": "#dc3545",
      maintenance: "#6c757d",
    };
    return colors[type] || "#2c7be5";
  };

  const getReactionCounts = (reactions) => {
    const counts = {};
    reactions.forEach((r) => {
      const emoji = r.emoji || r;
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    return counts;
  };

  const handleReaction = async (announcementId, emoji) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(`/announcements/${announcementId}/react`, { emoji }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchAnnouncements();

      setShowReactionPicker((prev) => ({
        ...prev,
        [announcementId]: false,
      }));
    } catch (err) {
      console.error("Failed to react to announcement", err);
    }
  };

  const handleRemoveReaction = async (announcementId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/announcements/${announcementId}/react`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to remove reaction", err);
    }
  };

  const handleLike = async (announcementId) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(`/announcements/${announcementId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to like announcement", err);
    }
  };

  const handleAddComment = async (announcementId) => {
    const text = commentInputs[announcementId];
    if (!text || text.trim().length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await api.post(
        `/announcements/${announcementId}/comment`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAnnouncements();

      setCommentInputs((prev) => ({
        ...prev,
        [announcementId]: "",
      }));
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleDeleteComment = async (announcementId, commentId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(
        `/announcements/${announcementId}/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleAddReply = async (announcementId, commentId) => {
    const key = `${announcementId}-${commentId}`;
    const text = replyInputs[key];
    if (!text || text.trim().length === 0) return;

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        `/announcements/${announcementId}/comment/${commentId}/reply`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAnnouncements();

      setReplyInputs((prev) => ({
        ...prev,
        [key]: "",
      }));

      setShowReplyForm((prev) => ({
        ...prev,
        [key]: false,
      }));
    } catch (err) {
      console.error("Failed to add reply", err);
    }
  };

  const handleDeleteReply = async (announcementId, commentId, replyId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(
        `/announcements/${announcementId}/comment/${commentId}/reply/${replyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to delete reply", err);
    }
  };

  const filteredAnnouncements =
    filter === "all"
      ? announcements
      : announcements.filter((a) => a.type === filter);

  return (
    <div className="page">
      <div className="announcements-header">
        <h1>📢 Hostel Announcements</h1>
        <p>Stay updated with important hostel information</p>
      </div>

      <div className="announcements-filter">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "general" ? "active" : ""}`}
          onClick={() => setFilter("general")}
        >
          📢 General
        </button>
        <button
          className={`filter-btn ${filter === "cleaning" ? "active" : ""}`}
          onClick={() => setFilter("cleaning")}
        >
          🧹 Cleaning
        </button>
        <button
          className={`filter-btn ${filter === "water" ? "active" : ""}`}
          onClick={() => setFilter("water")}
        >
          💧 Water
        </button>
        <button
          className={`filter-btn ${filter === "electricity" ? "active" : ""}`}
          onClick={() => setFilter("electricity")}
        >
          ⚡ Electricity
        </button>
      </div>

      <div className="announcements-container">
        {filteredAnnouncements.length === 0 ? (
          <div className="no-announcements">
            <p>No announcements available.</p>
          </div>
        ) : (
          filteredAnnouncements.map((a) => (
            <div
              key={a._id}
              className={`announcement-card announcement-${a.type}`}
              style={{
                borderLeftColor: getTypeColor(a.type),
                "--type-color": getTypeColor(a.type),
              }}
            >
              <div className="announcement-header">
                <div className="announcement-type-badge" style={{ backgroundColor: getTypeColor(a.type) }}>
                  {getTypeIcon(a.type)}
                </div>
                <div className="announcement-title-section">
                  <h3 className="announcement-title">{a.title}</h3>
                  <span className="announcement-type-label">{a.type.charAt(0).toUpperCase() + a.type.slice(1).replace(/-/g, " ")}</span>
                </div>
              </div>

              <p className="announcement-message">{a.message}</p>

              <div className="announcement-meta">
                <div className="meta-item">
                  <span className="meta-label">📍 Location:</span>
                  <span className="meta-value">Hostel {a.hostel}, Block {a.block}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">📅 Date:</span>
                  <span className="meta-value">
                    {new Date(a.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Interactions */}
              <div className="announcement-interactions">
                <div className="reactions-section">
                  <div className="reactions-display">
                    {Object.entries(getReactionCounts((a.reactions || []).map((r) => r.emoji))).map(
                      ([emoji, count]) => (
                        <span key={emoji} className="reaction-badge">
                          {emoji} {count}
                        </span>
                      )
                    )}
                  </div>
                  <div className="reaction-actions">
                    <div className="reaction-picker-container">
                      <button
                        className="reaction-btn"
                        onClick={() =>
                          setShowReactionPicker((prev) => ({
                            ...prev,
                            [a._id]: !prev[a._id],
                          }))
                        }
                      >
                        {a.userReaction ? a.userReaction : "😊"} React
                      </button>
                      {showReactionPicker[a._id] && (
                        <div className="reaction-picker">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              className="reaction-emoji"
                              onClick={() => handleReaction(a._id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {a.userReaction && (
                      <button
                        className="remove-reaction-btn"
                        onClick={() => handleRemoveReaction(a._id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="interaction-buttons">
                  <button
                    className="interaction-btn comment-btn"
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [a._id]: !prev[a._id],
                      }))
                    }
                  >
                    💬 Comments ({a.commentCount || 0})
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments[a._id] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {a.comments && a.comments.length > 0 ? (
                        a.comments.map((comment) => (
                          <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-author">{comment.userName}</span>
                              <span className="comment-date">
                                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="comment-text">{comment.text}</p>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="replies-list">
                                {comment.replies.map((reply) => (
                                  <div key={reply._id} className="reply-item">
                                    <div className="reply-header">
                                      <span className="reply-author">{reply.userName}</span>
                                      <span className="reply-date">
                                        {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <p className="reply-text">{reply.text}</p>
                                    <button
                                      className="delete-reply-btn"
                                      onClick={() =>
                                        handleDeleteReply(a._id, comment._id, reply._id)
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="comment-actions">
                              <button
                                className="reply-btn"
                                onClick={() => {
                                  const key = `${a._id}-${comment._id}`;
                                  setShowReplyForm((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                  }));
                                }}
                              >
                                ↳ Reply
                              </button>
                              <button
                                className="delete-comment-btn"
                                onClick={() => handleDeleteComment(a._id, comment._id)}
                              >
                                Delete
                              </button>
                            </div>

                            {/* Reply Form */}
                            {showReplyForm[`${a._id}-${comment._id}`] && (
                              <div className="reply-input-section">
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={replyInputs[`${a._id}-${comment._id}`] || ""}
                                  onChange={(e) =>
                                    setReplyInputs((prev) => ({
                                      ...prev,
                                      [`${a._id}-${comment._id}`]: e.target.value,
                                    }))
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddReply(a._id, comment._id);
                                    }
                                  }}
                                  className="reply-input"
                                />
                                <button
                                  className="reply-submit-btn"
                                  onClick={() => handleAddReply(a._id, comment._id)}
                                >
                                  Send
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="no-comments">No comments yet. Be the first to comment!</p>
                      )}
                    </div>

                    <div className="comment-input-section">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[a._id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [a._id]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(a._id);
                          }
                        }}
                        className="comment-input"
                      />
                      <button
                        className="comment-submit-btn"
                        onClick={() => handleAddComment(a._id)}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Announcements;