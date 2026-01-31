import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

function EditProfile({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hostel, setHostel] = useState("");
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    // Load current profile data from localStorage
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedProfileImage = localStorage.getItem("userProfileImage");
    const storedHostel = localStorage.getItem("userHostel");
    const storedBlock = localStorage.getItem("userBlock");
    const storedRoom = localStorage.getItem("userRoom");

    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedProfileImage) {
      const fullUrl = storedProfileImage.startsWith("http")
        ? storedProfileImage
        : `http://localhost:5000${storedProfileImage}`;
      setPreviewImage(fullUrl);
    }
    if (storedHostel) setHostel(storedHostel);
    if (storedBlock) setBlock(storedBlock);
    if (storedRoom) setRoom(storedRoom);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImageRemoved(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setShowPhotoMenu(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setImageRemoved(true);
    setPreviewImage("");
    setShowPhotoMenu(false);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureClick = () => {
    setShowPhotoMenu(!showPhotoMenu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("imageRemoved", imageRemoved);

      if (role === "student") {
        formData.append("hostel", hostel);
        formData.append("block", block);
        formData.append("room", room);
      }

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await api.patch("/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { user } = response.data;

      // Update localStorage
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      if (user.profileImage) {
        localStorage.setItem("userProfileImage", user.profileImage);
      } else if (imageRemoved) {
        localStorage.removeItem("userProfileImage");
      }
      if (user.hostel) localStorage.setItem("userHostel", user.hostel);
      if (user.block) localStorage.setItem("userBlock", user.block);
      if (user.room) localStorage.setItem("userRoom", user.room);

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        onSave(user);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ paddingTop: "40px" }}>
      <div className="page-header">
        <h1>✏️ Edit Profile</h1>
        <p>Update your profile information</p>
      </div>

      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
        {error && (
          <div
            style={{
              background: "#fee",
              color: "#c33",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #fcc",
            }}
          >
            ❌ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#efe",
              color: "#3c3",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #cfc",
            }}
          >
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ marginBottom: "16px", position: "relative", display: "inline-block" }}>
              <img
                src={
                  previewImage ||
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e7f0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M 20 80 Q 50 60 80 80' fill='%23999'/%3E%3C/svg%3E"
                }
                alt="Profile Preview"
                onClick={handleProfilePictureClick}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #667eea",
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.2)",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, filter 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.filter = "brightness(0.9)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.filter = "brightness(1)";
                }}
              />
              
              {/* Edit Icon */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "36px",
                  height: "36px",
                  background: "#667eea",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                  border: "3px solid white",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.2s ease",
                }}
                onClick={handleProfilePictureClick}
                onMouseEnter={(e) => {
                  e.target.style.background = "#764ba2";
                  e.target.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#667eea";
                  e.target.style.transform = "scale(1)";
                }}
              >
                ✏️
              </div>

              {/* Photo Menu */}
              {showPhotoMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "130px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                    overflow: "hidden",
                    zIndex: 1000,
                    minWidth: "180px",
                    animation: "slideDown 0.2s ease-out",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleChangePhoto}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "white",
                      color: "#667eea",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderBottom: "1px solid #f0f0f0",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f7fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                    }}
                  >
                    🖼️ Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "white",
                      color: "#dc3545",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(220, 53, 69, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                    }}
                  >
                    🗑️ Remove Photo
                  </button>
                </div>
              )}
            </div>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {profileImage && (
              <p style={{ color: "green", fontSize: "0.9rem", marginTop: "16px" }}>
                ✅ New image selected: {profileImage.name}
              </p>
            )}

            {imageRemoved && (
              <p style={{ color: "#dc3545", fontSize: "0.9rem", marginTop: "16px" }}>
                🗑️ Photo will be removed
              </p>
            )}
          </div>

          {/* Name Field */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e7f0",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e7f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e7f0",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e7f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Hostel, Block, Room (for students only) */}
          {role === "student" && (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
                  Hostel
                </label>
                <select
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e7f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select Hostel</option>
                  <option value="A">Hostel A</option>
                  <option value="B">Hostel B</option>
                  <option value="C">Hostel C</option>
                  <option value="D">Hostel D</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
                  Block
                </label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e7f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select Block</option>
                  <option value="1">Block 1</option>
                  <option value="2">Block 2</option>
                  <option value="3">Block 3</option>
                  <option value="4">Block 4</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
                  Room Number
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e7f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e7f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px 28px",
                background: loading
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loading ? "none" : "0 4px 15px rgba(102, 126, 234, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
                }
              }}
            >
              {loading ? "Saving..." : "💾 Save Changes"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px 28px",
                background: "#f0f0f0",
                color: "#333",
                border: "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = "#e0e0e0";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = "#f0f0f0";
                }
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
