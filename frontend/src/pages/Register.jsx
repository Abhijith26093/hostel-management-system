import { useState } from "react";
import api from "../api/axios";

function Register({ setToken, goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [hostel, setHostel] = useState("");
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      
      if (role === "student") {
        formData.append("hostel", hostel);
        formData.append("block", block);
        formData.append("room", room);
      }
      
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      if (user.profileImage) {
        localStorage.setItem("userProfileImage", user.profileImage);
      }

      setToken(token);
      alert("Registration successful!");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "40px auto" }}>
      <h2>Sign Up</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="student">Student</option>
          <option value="management">Management</option>
        </select>

        {role === "student" && (
          <>
            <select
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            >
              <option value="">Select Hostel</option>
              <option value="A">Hostel A</option>
              <option value="B">Hostel B</option>
              <option value="C">Hostel C</option>
              <option value="D">Hostel D</option>
            </select>
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            >
              <option value="">Select Block</option>
              <option value="1">Block 1</option>
              <option value="2">Block 2</option>
              <option value="3">Block 3</option>
              <option value="4">Block 4</option>
            </select>
            <input
              placeholder="Room Number"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </>
        )}

        <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
          Profile Picture (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImage(e.target.files[0])}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        {profileImage && (
          <p style={{ color: "green", fontSize: "0.9rem", marginBottom: "10px" }}>
            ✅ Image selected: {profileImage.name}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p style={{ marginTop: "10px" }}>
        Already have an account?{" "}
        <button onClick={goToLogin}>Login</button>
      </p>
    </div>
  );
}

export default Register;
