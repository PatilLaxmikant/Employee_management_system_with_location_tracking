// import React, { useState } from "react";
// import Logo from "../assets/Logo.png";

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({ name: "", phone: "", password: "" });

//   const handleToggle = () => {
//     setIsLogin(!isLogin);
//     setFormData({ name: "", phone: "", password: "" });
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(isLogin ? "Logging in..." : "Registering...", formData);
//   };

//   const handleForgotPassword = () => {
//     alert("Redirect to forgot password page");
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6 overflow-y-auto">
//       {/* Logo */}
//       <div className="mb-4">
//         <img
//           src={Logo}
//           alt="Company Logo"
//           className="h-28 md:h-40 lg:h-48 w-auto object-contain"
//         />
//       </div>

//       {/* Card */}
//       <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl">
//         <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
//           {isLogin ? "Login" : "Register"}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {!isLogin && (
//             <div>
//               <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 id="name"
//                 required
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter your full name"
//                 className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//               />
//             </div>
//           )}

//           <div>
//             <label htmlFor="phone" className="block text-base font-medium text-gray-700 mb-1">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               name="phone"
//               id="phone"
//               required
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder="Enter phone number"
//               className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               id="password"
//               required
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter password"
//               className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//             />
//           </div>

//           {/* Forgot Password */}
//           {isLogin && (
//             <div className="text-right">
//               <button
//                 type="button"
//                 onClick={handleForgotPassword}
//                 className="text-sm md:text-base text-green-600 hover:underline font-medium"
//               >
//                 Forgot Password?
//               </button>
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 text-lg transition duration-300"
//           >
//             {isLogin ? "Login" : "Register"}
//           </button>
//         </form>

//         {/* Switch login/register */}
//         <p className="text-center text-base text-gray-700 mt-6">
//           {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
//           <button
//             onClick={handleToggle}
//             className="text-green-600 font-semibold hover:underline text-base"
//           >
//             {isLogin ? "Register" : "Login"}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AuthPage;

// import React, { useState } from "react";
// import AuthForm from "../components/AuthForm";
// import Logo from "../assets/Logo.png";
// import { useNavigate } from "react-router-dom";

// const LoginPage = () => {
//   const [formData, setFormData] = useState({ phone: "", password: "" });
//   const navigate = useNavigate();

//   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Logging in with", formData);
//     // On success: navigate("/dashboard")
//   };


//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6 overflow-y-auto">
//       <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-48 mb-4" />
//       <AuthForm
//         isLogin
//         formData={formData}
//         onChange={handleChange}
//         onSubmit={handleSubmit}
//         onForgotPassword={() => navigate("/forgot-password")}
//         // onForgotPassword={() => alert("Redirect to Forgot Password")}
//         onToggle={() => navigate("/register")}
//       />
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import Logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure to install axios: npm install axios

// Define your backend API URL
const API_URL = "http://127.0.0.1:8000";

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
      <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-48 mb-4" />
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
