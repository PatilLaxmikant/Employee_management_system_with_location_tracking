# Employee Attendance & Location PWA (Password Auth)

This is a full-stack Progressive Web Application (PWA) designed for tracking employee attendance and location-based activities. This version uses a secure, password-based authentication system and provides a user-friendly dashboard for employees to record their daily events.

The backend is built with a structured **FastAPI** application, and the frontend is a modern, responsive single-page application built with **React** and **Tailwind CSS**.

---

## ✨ Features

- **Secure Password Authentication**: Standard user registration and login using a phone number and a securely hashed password.
- **JWT-Based Sessions**: User sessions are managed via JSON Web Tokens (JWT) with a configurable expiration time (currently 24 hours).
- **Persistent User Sessions**: Users remain logged in until they explicitly log out or their token expires.
- **Protected & Public Routes**: Secure dashboard accessible only to authenticated users, while login/register pages are only for unauthenticated users.
- **Full-Featured Dashboard**:
    - Live, real-time clock.
    - Dropdown to select different work categories (e.g., 'Work location', 'Lunch break').
    - 'Start' and 'End' buttons to log activities.
    - Geolocation stamping for all recorded actions.
- **Daily State Persistence**: The UI state of activities (started/ended) is saved in the browser's local storage for the current day, ensuring consistency across page refreshes.
- **Toast Notifications**: Sleek, auto-expiring notifications for success and error messages.
- **Progressive Web App (PWA)**: Can be "installed" on a user's device for a native app-like experience.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Security**: Passlib (for password hashing), Python-JOSE (for JWT)
- **Validation**: Pydantic

### Frontend
- **Framework**: React
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API

---

## 📂 Project Structure

The project is organized with a structured backend and a component-based frontend.


/
├── .env                # Environment variables for the backend
├── main.py             # Main FastAPI application entry point
├── database.py         # Database connection and session logic
├── models.py           # SQLAlchemy database models
├── schemas.py          # Pydantic data validation schemas
├── auth.py             # Authentication logic (hashing, tokens)
├── routers/
│   ├── auth.py         # Router for authentication endpoints
│   └── attendance.py   # Router for attendance and event endpoints
└── src/                # Frontend React application
├── assets/
├── components/
│   ├── AuthForm.jsx
│   ├── ProtectedRoute.jsx
│   ├── PublicRoute.jsx
│   └── Toast.jsx
├── contexts/
│   ├── APIContext.js
│   └── AuthContext.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ForgotPasswordPage.jsx
│   └── Dashboard.jsx
├── App.jsx
└── main.jsx


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
    *(Note: `python-dotenv` is added to read the `.env` file).*

3.  **Create and Configure the `.env` file:**
    - Create a file named `.env` in the root of the backend project.
    - Copy the contents from the `.env` example file provided.
    - **Update `DATABASE_URL`** to point to your PostgreSQL instance.
    - **Update `SECRET_KEY`** with a new, randomly generated secret. You can generate one with the command: `openssl rand -hex 32`.

4.  **Run the Backend Server:**
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the `src` directory** (or your frontend root) and install Node.js dependencies:
    ```bash
    npm install
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
    The React application will be available at `http://localhost:5173` (or another port if 5173 is in use).

---

## 🔐 Authentication Flow

1.  **Registration**: A user provides their name, phone number, and a password. The backend hashes the password using `bcrypt` and stores the user's details.
2.  **Login**: The user provides their phone number and password. The backend verifies the provided password against the stored hash.
3.  **Token Issuance**: Upon successful login, the backend generates a **JWT (JSON Web Token)** containing the user's phone number and an expiration timestamp (24 hours). This token is sent to the frontend.
4.  **Session Management**: The frontend stores this JWT in `localStorage`. For every subsequent request to a protected API endpoint, the token is included in the `Authorization` header.
5.  **Token Validation**: The backend validates the JWT on every protected request. If the token is valid and not expired, it grants access. If not, it returns a `401 Unauthorized` error, and the frontend automatically logs the user out.
