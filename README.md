# Employee Activity & Location Analytics Platform

This is a comprehensive, full-stack Progressive Web Application (PWA) designed for tracking employee attendance, location, and daily activities. It features a secure, password-based authentication system, a functional dashboard for employees, and a powerful analytics dashboard for administrators to monitor and analyze user activity, duration, and location data.

The backend is a structured **FastAPI** application that connects to a **PostgreSQL** database, while the frontend is a modern, responsive single-page application built with **React**, **Tailwind CSS**, and **Leaflet** for mapping.

---

## ✨ Features

### User Features
- **Secure Password Authentication**: Standard user registration and login using a phone number and a securely hashed password.
- **Persistent Sessions**: Users remain logged in via JWT until they manually log out or the token expires (currently 24 hours).
- **Activity Logging**: A user-friendly dashboard to select a work category (e.g., 'Work location', 'Lunch break') and record 'Start' and 'End' times for that activity.
- **Geolocation Stamping**: All recorded activities are stamped with the user's current latitude and longitude.
- **Daily State Persistence**: The UI state of activities (started/ended) is saved in the browser's local storage for the current day.

### Admin Features
- **Role-Based Access Control**: Separate, protected dashboards for regular users and administrators.
- **User Management**: A complete list of all registered users in the system.
- **Daily Activity Analysis**: Admins can select any user and any date to view a detailed breakdown of their activities.
- **Duration Calculation**: The backend automatically processes raw start/end events to calculate the total duration spent on each activity (e.g., "Work location: 8h 15m").
- **Activity Visualization**:
    - **Pie Chart**: Shows the distribution of time spent across different activities for the selected day.
    - **Activity Log**: A detailed table showing all events, with timestamps and remarks.
- **Location Path Mapping**:
    - **Interactive Map**: Displays all location-stamped events for a user on a given day.
    - **Marker Clustering**: Groups nearby location pins to keep the map clean and readable.
    - **Polyline Path**: Draws a line connecting the event markers in chronological order to visualize the user's travel path.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Security**: Passlib (for password hashing), Python-JOSE (for JWT)
- **Validation**: Pydantic
- **Environment Variables**: `python-dotenv`

### Frontend
- **Framework**: React
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Charting**: Recharts
- **Mapping**: Leaflet, React Leaflet, React Leaflet Markercluster

---

## 📂 Project Structure

The project is organized with a structured backend and a component-based frontend.

/├── .env                # Environment variables for the backend├── main.py             # Main FastAPI application entry point└── src/                # Frontend React application├── assets/├── components/│   ├── AuthForm.jsx│   ├── ProtectedRoute.jsx│   ├── PublicRoute.jsx│   ├── AdminRoute.jsx│   └── Toast.jsx├── contexts/│   ├── APIContext.js│   └── AuthContext.jsx├── pages/│   ├── LoginPage.jsx│   ├── RegisterPage.jsx│   ├── ForgotPasswordPage.jsx│   ├── Dashboard.jsx│   ├── AdminDashboard.jsx│   └── AuthRedirect.jsx├── App.jsx└── main.jsx
---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+ and `pip`
- Node.js v14+ and `npm`
- A running PostgreSQL database instance

### Backend Setup

1.  **Clone the repository** and navigate into the project directory.

2.  **Install Python dependencies:**
    ```bash
    pip install "fastapi[all]" sqlalchemy psycopg2-binary passlib[bcrypt] python-jose[cryptography] python-dotenv
    ```

3.  **Create and Configure the `.env` file:**
    - Create a file named `.env` in the root of the project.
    - Copy the following content into it:
      ```
      # .env file
      DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database_name>"
      SECRET_KEY="<your_super_secret_random_string>"
      ADMIN_PHONE="+919876543210"
      ADMIN_PASSWORD="Admin@123"
      ```
    - **Update `DATABASE_URL`** to point to your PostgreSQL instance.
    - **Update `SECRET_KEY`** with a new, randomly generated secret. You can generate one with: `openssl rand -hex 32`.
    - Optionally, update the default admin credentials.

4.  **Run the Backend Server:**
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`. The first time it runs, it will create the necessary tables and a default admin user.

### Frontend Setup

1.  **Navigate to the `src` directory** (or your frontend root) and install Node.js dependencies:
    ```bash
    npm install
    npm install leaflet react-leaflet react-leaflet-markercluster recharts
    ```

2.  **Configure API URL:**
    In `src/contexts/APIContext.js`, ensure the `API_URL` constant points to your running backend server.
    ```javascript
    export const API_URL = '[http://127.0.0.1:8000](http://127.0.0.1:8000)';
    ```

3.  **Start the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The React application will be available at `http://localhost:5173`.

---

## 🔐 Authentication Flow

1.  **Registration**: A user provides their name, phone, and password. The backend hashes the password and stores the user.
2.  **Login**: The user provides their credentials. The backend verifies them and issues a **JWT (JSON Web Token)** with a 24-hour expiry.
3.  **Session Management**: The frontend stores this JWT in `localStorage`. For every subsequent request, the token is sent in the `Authorization` header.
4.  **Role-Based Redirection**: After login, the user is redirected to an intermediate `/redirect` page, which checks their `is_admin` status from the user context and navigates them to the appropriate dashboard (`/admin` or `/dashboard`).
5.  **Token Validation**: The backend validates the JWT on every protected request. If the token is invalid or expired, it returns a `401 Unauthorized` error, and the frontend automatically logs the user out.
