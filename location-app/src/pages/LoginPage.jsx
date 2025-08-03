import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import Logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure to install axios: npm install axios

// Define your backend API URL
const API_URL = "https://ed41b5548e92.ngrok-free.app";
// const API_URL = "http://127.0.0.1:8000";

const LoginPage = () => {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FastAPI's OAuth2PasswordRequestForm expects data as 'x-www-form-urlencoded'
      const params = new URLSearchParams();
      params.append("username", formData.phone); // 'username' is the phone number
      params.append("password", formData.password);

      const response = await axios.post(`${API_URL}/token`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      
      // Store the token. In a real app, you might use Context or Redux.
      localStorage.setItem("authToken", response.data.access_token);
      
      // On success, navigate to a protected dashboard page
      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
      console.error("Login error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6 overflow-y-auto">
      <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-40 mb-4" />
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
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
