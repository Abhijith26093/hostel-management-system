const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/lost-found", require("./routes/lostFoundRoutes"));
app.use("/api/carousel", require("./routes/carouselRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// ONLY routes, no middleware here
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/issues", require("./routes/issueRoutes"));

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
