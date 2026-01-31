import { useState } from "react";
import api from "../api/axios";

function CreateIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("electrical");
  const [priority, setPriority] = useState("low");
  const [visibility, setVisibility] = useState("public");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidSize) {
        alert(`File ${file.name} is too large. Max size is 10MB`);
        return false;
      }
      if (!isImage && !isVideo) {
        alert(`File ${file.name} is not an image or video`);
        return false;
      }
      return true;
    });
    setAttachments(validFiles);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("visibility", visibility);
      
      // Append all attachments
      attachments.forEach(file => {
        formData.append("attachments", file);
      });

      await api.post(
        "/issues",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("✓ Issue created successfully!");
      setTitle("");
      setDescription("");
      setPriority("low");
      setCategory("electrical");
      setVisibility("public");
      setAttachments([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create issue";
      console.error("Error creating issue:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    electrical: "⚡",
    plumbing: "🚰",
    cleanliness: "🧹",
    internet: "📡",
    furniture: "🪑",
    other: "❓"
  };

  const priorityColors = {
    low: "#28a745",
    medium: "#ffc107",
    high: "#fd7e14",
    emergency: "#dc3545"
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📋 Report an Issue</h1>
        <p>Let us know about any maintenance or facility problems</p>
      </div>

      <div className="issue-form-container">
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="issue-form">
          <div className="form-group">
            <label htmlFor="title">Issue Title *</label>
            <input
              id="title"
              placeholder="e.g., Broken ceiling fan in room 305"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              placeholder="Describe the issue in detail. Include what you've observed and when it started..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="electrical">⚡ Electrical</option>
                <option value="plumbing">🚰 Plumbing</option>
                <option value="cleanliness">🧹 Cleanliness</option>
                <option value="internet">📡 Internet</option>
                <option value="furniture">🪑 Furniture</option>
                <option value="other">❓ Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="emergency">🔴 Emergency</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="visibility">Who Can See This *</label>
            <div className="visibility-options">
              <label className="visibility-label">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                <span>👥 Public - Everyone can see</span>
              </label>
              <label className="visibility-label">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                <span>🔒 Private - Only me and admin</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="attachments">📎 Attach Images or Videos (Optional)</label>
            <div className="file-upload-area">
              <input
                id="attachments"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="attachments" className="file-upload-label">
                <span>📸 📹 Click to select files or drag & drop</span>
                <small>Max 10MB per file • Supports images and videos</small>
              </label>
            </div>
            
            {/* Preview attachments */}
            {attachments.length > 0 && (
              <div className="attachments-preview">
                <h4 style={{ marginTop: "16px", marginBottom: "12px" }}>Attached Files:</h4>
                <div className="attachment-list">
                  {attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-icon">
                        {file.type.startsWith('image/') ? '🖼️' : '🎬'}
                      </span>
                      <span className="attachment-name">
                        {file.name}
                        <small>({(file.size / 1024 / 1024).toFixed(2)}MB)</small>
                      </span>
                      <button
                        type="button"
                        className="attachment-remove"
                        onClick={() => removeAttachment(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? "Submitting..." : "📤 Submit Issue"}
            </button>
          </div>
        </form>

        <div className="issue-tips">
          <h3>💡 Tips for reporting issues</h3>
          <ul>
            <li><strong>Be specific:</strong> Include room number and details</li>
            <li><strong>Choose correct priority:</strong> Use Emergency only for urgent problems</li>
            <li><strong>Select accurate category:</strong> Helps us route to right team</li>
            <li><strong>Describe the problem:</strong> More info = faster resolution</li>
            <li><strong>Add photos/videos:</strong> Visual evidence helps identify issues faster</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreateIssue;
