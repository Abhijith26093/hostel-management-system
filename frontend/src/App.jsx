import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateIssue from "./pages/CreateIssue";
import MyIssues from "./pages/MyIssues";
import AdminIssues from "./pages/AdminIssues";
import Announcements from "./pages/Announcements";
import LandingPage from "./pages/LandingPage";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import LostFound from "./pages/LostFound";
import AdminLostFound from "./pages/AdminLostFound";
import Analytics from "./pages/Analytics";
import EditProfile from "./pages/EditProfile";
import AdminCarousel from "./pages/AdminCarousel";
import Carousel from "./components/Carousel";
import api from "./api/axios";
import logo from "./assets/logo.png";
import "./styles/theme.css";
import "./styles/ui.css";
import "./styles/main.css";

// Navigation Button Component
function NavButton({ label, page, current, onClick }) {
  const isActive = current === page;
  return (
    <button
      onClick={() => onClick(page)}
      style={{
        width: "100%",
        padding: "12px 16px",
        margin: "8px 0",
        background: isActive ? "#2c7be5" : "transparent",
        color: isActive ? "white" : "#2d3748",
        border: "none",
        borderRadius: "8px",
        fontSize: "1rem",
        fontWeight: isActive ? "600" : "500",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = "#f0f5ff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = "transparent";
        }
      }}
    >
      {label}
    </button>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userProfileImage, setUserProfileImage] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const role = localStorage.getItem("role");
  const [showLanding, setShowLanding] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/announcements", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnnouncements(response.data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserEmail = localStorage.getItem("userEmail");
    const storedProfileImage = localStorage.getItem("userProfileImage");
    
    if (storedUserName) setUserName(storedUserName);
    if (storedUserEmail) setUserEmail(storedUserEmail);
    if (storedProfileImage) setUserProfileImage(storedProfileImage);

    if (token) {
      fetchAnnouncements();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userProfileImage");
    setToken(null);
    setUserName("");
    setUserEmail("");
    setUserProfileImage("");
    setShowProfileMenu(false);
  };

  const handleFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  const handleProfileUpdate = (updatedData) => {
    setUserName(updatedData.name);
    setUserEmail(updatedData.email);
    if (updatedData.profileImage) {
      setUserProfileImage(updatedData.profileImage);
      localStorage.setItem("userProfileImage", updatedData.profileImage);
    }
    localStorage.setItem("userName", updatedData.name);
    localStorage.setItem("userEmail", updatedData.email);
    setShowEditProfile(false);
    setShowProfileMenu(false);
  };
    if (showLanding) {
    return <LandingPage onJoin={() => setShowLanding(false)} />;
  }

  if (!token) {
    return showRegister ? (
      <Register
        setToken={setToken}
        goToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
          setToken={setToken}
          showRegister={() => setShowRegister(true)}
          onBackToLanding={() => setShowLanding(true)}
        />
    );
  }

  if (showEditProfile) {
    return (
      <>
        <div className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="app-title">StayMate</h1>
            </div>
            <div className="user-section">
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
        <EditProfile 
          onSave={handleProfileUpdate}
          onCancel={() => setShowEditProfile(false)}
        />
      </>
    );
  }

 return (
  <>
    {/* Header */}
    <div className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <img src={logo} alt="StayMate Logo" className="header-logo" />
        </div>
        <div className="user-section">
          <div className="profile-avatar-container">
            <img
              src={userProfileImage ? handleFullUrl(userProfileImage) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e7f0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M 20 80 Q 50 60 80 80' fill='%23999'/%3E%3C/svg%3E"}
              alt="Profile"
              className="profile-avatar"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Click to open profile menu"
            />
            
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <img
                    src={userProfileImage ? handleFullUrl(userProfileImage) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e7f0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M 20 80 Q 50 60 80 80' fill='%23999'/%3E%3C/svg%3E"}
                    alt="Profile"
                    className="profile-dropdown-avatar"
                  />
                  <div className="profile-dropdown-info">
                    <p className="profile-dropdown-name">{userName}</p>
                    <p className="profile-dropdown-email">{userEmail}</p>
                  </div>
                </div>
                
                <div className="profile-dropdown-divider"></div>
                
                <button 
                  className="profile-dropdown-item"
                  onClick={() => setShowEditProfile(true)}
                >
                  ✏️ Edit Profile
                </button>
                <button className="profile-dropdown-item logout-item" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Role-based UI with Navigation */}
    <div style={{ display: "flex" }}>
      {/* Navigation Sidebar */}
      <nav style={{
        width: "250px",
        background: "#f8f9fa",
        borderRight: "1px solid #e0e7f0",
        padding: "20px 0",
        minHeight: "calc(100vh - 100px)",
        position: "fixed",
        height: "calc(100vh - 80px)",
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 16px" }}>
          {role === "management" ? (
            <>
              <NavButton label="📊 Dashboard" page="home" current={currentPage} onClick={setCurrentPage} />
              <NavButton label="📈 Analytics" page="analytics" current={currentPage} onClick={setCurrentPage} />
              <NavButton label="🎠 Carousel" page="carousel" current={currentPage} onClick={setCurrentPage} />
              <NavButton label="📢 Announcements" page="announcements" current={currentPage} onClick={setCurrentPage} />
              <NavButton label="⚠️ Issues" page="issues" current={currentPage} onClick={setCurrentPage} />
              <NavButton label="🔍 Lost & Found" page="lostandfound" current={currentPage} onClick={setCurrentPage} />
            </>
          ) : (
            <>
              <NavButton label="🏠 Home" page="home" current={currentPage} onClick={setCurrentPage} />
              <NavButton label="⚠️ Issues" page="issues" current={currentPage} onClick={setCurrentPage} />
              <NavButton label="🔍 Lost & Found" page="lostandfound" current={currentPage} onClick={setCurrentPage} />
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ marginLeft: "250px", flex: 1, width: "calc(100% - 250px)" }}>
        {/* Home Page - with Carousel and Announcements */}
        {currentPage === "home" && (
          <>
            <Carousel />
            <Announcements announcements={announcements} fetchAnnouncements={fetchAnnouncements} />
            {role === "management" && <Analytics />}
          </>
        )}

        {/* Issues Page */}
        {currentPage === "issues" && (
          <>
            {role === "management" ? <AdminIssues /> : <><CreateIssue /><MyIssues /></>}
          </>
        )}

        {/* Lost & Found Page */}
        {currentPage === "lostandfound" && (
          <>
            {role === "management" ? <AdminLostFound /> : <LostFound />}
          </>
        )}

        {/* Announcements Page */}
        {currentPage === "announcements" && (
          <>
            {role === "management" && <AdminAnnouncements fetchAnnouncements={fetchAnnouncements} />}
            <Announcements announcements={announcements} fetchAnnouncements={fetchAnnouncements} />
          </>
        )}

        {/* Carousel Management Page (Admin Only) */}
        {currentPage === "carousel" && role === "management" && <AdminCarousel />}

        {/* Analytics Page (Admin Only) */}
        {currentPage === "analytics" && role === "management" && <Analytics />}
      </main>
    </div>
  </>
);

}

export default App;