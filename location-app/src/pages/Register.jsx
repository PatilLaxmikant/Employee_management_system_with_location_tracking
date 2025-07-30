import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import Logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure to install axios: npm install axios

// Define your backend API URL. It's good practice to keep this in a config file.
const API_URL = "http://127.0.0.1:8000";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", password: "" });
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
      // The request body must match the Pydantic model in FastAPI
      const payload = {
        name: formData.name,
        phone_number: formData.phone,
        password: formData.password,
      };
      
      // This is the API call to your backend's /register endpoint
      await axios.post(`${API_URL}/register`, payload);
      
      // On success, show a message and redirect to the login page
      alert("Registration successful! Please log in.");
      navigate("/"); // Navigate to login page

    } catch (err) {
      // Set a user-friendly error message from the backend if it exists
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
      console.error("Registration error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6 overflow-y-auto">
      <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-48 mb-4" />
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-center">{error}</p>}
      <AuthForm
        isLogin={false}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onToggle={() => navigate("/")} // Navigate to login page
        isLoading={loading} // Pass loading state to disable form
      />
    </div>
  );
};

export default RegisterPage;
