

// import React, { useState } from "react";
// import AuthForm from "../components/AuthForm";
// import Logo from "../assets/Logo.png";
// import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Make sure to install axios: npm install axios

// // Define your backend API URL
// const API_URL = "http://127.0.0.1:8000";

// const LoginPage = () => {
//   const [formData, setFormData] = useState({ phone: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // FastAPI's OAuth2PasswordRequestForm expects data as 'x-www-form-urlencoded'
//       const params = new URLSearchParams();
//       params.append("username", formData.phone); // 'username' is the phone number
//       params.append("password", formData.password);

//       const response = await axios.post(`${API_URL}/token`, params, {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       });
      
//       // Store the token. In a real app, you might use Context or Redux.
//       localStorage.setItem("authToken", response.data.access_token);
      
//       // On success, navigate to a protected dashboard page
//       navigate("/dashboard");

//     } catch (err) {
//       setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
//       console.error("Login error:", err.response?.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6 overflow-y-auto">
//       <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-48 mb-4" />
//       {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
//       <AuthForm
//         isLogin
//         formData={formData}
//         onChange={handleChange}
//         onSubmit={handleSubmit}
//         onForgotPassword={() => navigate("/forgot-password")}
//         onToggle={() => navigate("/register")}
//         isLoading={loading}
//       />
//     </div>
//   );
// };

// export default LoginPage;

// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import AuthForm from "../components/AuthForm";
import Logo from "../assets/Logo.png";
import Toast from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../contexts/APIContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  /**
   * Handles changes in the form input fields.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles the form submission for logging in.
   * @param {React.FormEvent<HTMLFormElement>} e - The event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      // FastAPI's OAuth2PasswordRequestForm expects data as 'x-www-form-urlencoded'
      const params = new URLSearchParams();
      params.append("username", formData.phone); // 'username' is the phone number
      params.append("password", formData.password);

      // 1. Get the authentication token from the /token endpoint
      const tokenResponse = await axios.post(`${API_URL}/token`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      
      const accessToken = tokenResponse.data.access_token;

      // 2. Use the new token to fetch the user's details from the /users/me endpoint
      const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = userResponse.data;
      // 3. Store token and user data in the global context and localStorage
      login(accessToken, userData);

      // 4. Redirect to the appropriate dashboard based on user role
      if (userData.is_admin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      // Display a toast notification on login failure
      setToast({ 
        message: err.response?.data?.detail || "Login failed. Please check your credentials.", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6">
      {/* Render the Toast component when a message is set */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-48 mb-4" />
      
      <AuthForm
        isLogin
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onForgotPassword={() => navigate("/forgot-password")}
        onToggle={() => navigate("/register")}
        isLoading={loading}
      />
    </div>
  );
};

export default LoginPage;
