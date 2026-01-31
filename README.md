# StayMate - Hostel Management System

**StayMate** is a modern, full-stack web application designed to streamline communication and manage daily operations within a student hostel. It provides a centralized digital platform for both students and administrators, replacing outdated paper-based systems with an efficient and interactive solution.

---

## ✨ Key Features

StayMate offers a role-based experience with tailored features for students and management.

### For Students:
- **Secure Authentication:** Secure user registration and login system with JWT-based authentication.
- **Announcements Dashboard:** View official announcements from management, with the ability to react and comment.
- **Issue Reporting:** Submit maintenance or other issues directly to the administration and track their status (`Pending`, `In Progress`, `Resolved`).
- **Lost & Found:** Report lost or found items, view listings, and claim found items through a managed approval process.
- **Profile Management:** View and edit personal profile information.

### For Management (Admin):
- **Admin Dashboard:** A central hub to oversee all hostel activities.
- **Announcement Management:** Create, update, and delete announcements.
- **Issue Tracking:** View all student-reported issues, manage them, and update their status.
- **Lost & Found Administration:** Review and approve/deny claims made by students on found items.
- **User Analytics:** (Future) View analytics on issue resolution times, user engagement, and more.

---

## 🛠️ Tech Stack

This project is built using the **MERN** stack and other modern web technologies.

- **Frontend:**
  - **React:** A powerful JavaScript library for building dynamic user interfaces.
  - **Axios:** A promise-based HTTP client for making API requests to the backend.
  - **CSS3:** Custom styling for a clean, responsive, and modern design.

- **Backend:**
  - **Node.js:** A JavaScript runtime for the server-side.
  - **Express.js:** A fast and minimalist web framework for building the RESTful API.
  - **MongoDB:** A NoSQL database used to store all application data (users, issues, announcements, etc.).
  - **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
  - **JSON Web Tokens (JWT):** For implementing secure, role-based user authentication.
  - **Multer:** A middleware for handling `multipart/form-data`, used for file uploads (e.g., images for Lost & Found items).

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/en/) (which includes npm)
- [MongoDB](https://www.mongodb.com/try/download/community) (make sure the MongoDB server is running)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/staymate.git
    cd staymate
    ```

2.  **Setup the Backend:**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Install dependencies
    npm install

    # Create a .env file in the /backend directory
    # and add the following environment variables:
    ```
    **File: `backend/.env`**
    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/hostel-db
    JWT_SECRET=your_super_secret_jwt_key
    ```
    ```bash
    # Start the backend server
    npm start
    ```
    The backend server should now be running on `http://localhost:5000`.

3.  **Setup the Frontend:**
    ```bash
    # Navigate to the frontend directory from the root
    cd ../frontend

    # Install dependencies
    npm install

    # Start the React development server
    npm start
    ```
    The frontend application should now be running and accessible at `http://localhost:3000`.

---

## 📂 Project Structure

The project is organized into two main folders: `frontend` and `backend`.
