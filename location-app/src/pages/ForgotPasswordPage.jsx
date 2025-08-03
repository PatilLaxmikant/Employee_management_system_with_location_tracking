// import React, { useState } from "react";
// import Logo from "../assets/Logo.png";
// import { useNavigate } from "react-router-dom";

// const ForgotPasswordPage = () => {
//   const [formData, setFormData] = useState({ phone: "", newPassword: "" });
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Resetting password for", formData);
//     // TODO: Call API to reset password
//     // On success:
//     alert("Password updated successfully.");
//     navigate("/");
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6 overflow-y-auto">
//       <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-48 mb-4" />

//       <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl">
//         <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
//           Reset Password
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-base font-medium text-gray-700 mb-1">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               required
//               placeholder="Enter registered phone number"
//               className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//             />
//           </div>

//           <div>
//             <label className="block text-base font-medium text-gray-700 mb-1">
//               New Password
//             </label>
//             <input
//               type="password"
//               name="newPassword"
//               value={formData.newPassword}
//               onChange={handleChange}
//               required
//               placeholder="Enter new password"
//               className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 text-lg transition duration-300"
//           >
//             Update Password
//           </button>
//         </form>

//         <p className="text-center text-base text-gray-700 mt-6">
//           Back to{" "}
//           <button
//             onClick={() => navigate("/")}
//             className="text-green-600 font-semibold hover:underline"
//           >
//             Login
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ForgotPasswordPage;


import React, { useState } from "react";
import Logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure to install axios: npm install axios

// Define your backend API URL
const API_URL = "https://1b07df74fa70.ngrok-free.app";

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({ phone: "", newPassword: "" });
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
      // The payload must match the PasswordReset Pydantic model in FastAPI
      const payload = {
        phone_number: formData.phone,
        new_password: formData.newPassword,
      };

      // This is the API call to your backend's /reset-password endpoint
      await axios.post(`${API_URL}/reset-password`, payload);

      // On success, show a message and redirect to the login page
      alert("Password updated successfully. Please log in with your new password.");
      navigate("/");

    } catch (err) {
      // Set a user-friendly error message
      setError(err.response?.data?.detail || "Password reset failed. Please check the phone number.");
      console.error("Password reset error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4 py-6 overflow-y-auto">
      <img src={Logo} alt="Company Logo" className="h-28 md:h-40 lg:h-48 mb-4" />

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          Reset Password
        </h2>
        
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter registered phone number"
              className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter new password"
              className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 text-lg transition duration-300 disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="text-center text-base text-gray-700 mt-6">
          Back to{" "}
          <button
            onClick={() => navigate("/")}
            className="text-green-600 font-semibold hover:underline cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
