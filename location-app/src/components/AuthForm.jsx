// import React from "react";

// const AuthForm = ({ isLogin, formData, onChange, onSubmit, onToggle, onForgotPassword }) => {
//   return (
//     <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl">
//       <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
//         {isLogin ? "Login" : "Register"}
//       </h2>

//       <form onSubmit={onSubmit} className="space-y-5">
//         {!isLogin && (
//           <div>
//             <label className="block text-base font-medium text-gray-700 mb-1">
//               Full Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={onChange}
//               required
//               placeholder="Enter your full name"
//               className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//             />
//           </div>
//         )}

//         <div>
//           <label className="block text-base font-medium text-gray-700 mb-1">
//             Phone Number
//           </label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone}
//             onChange={onChange}
//             required
//             placeholder="Enter phone number"
//             className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//           />
//         </div>

//         <div>
//           <label className="block text-base font-medium text-gray-700 mb-1">
//             Password
//           </label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={onChange}
//             required
//             placeholder="Enter password"
//             className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
//           />
//         </div>

//         {/* Forgot Password for Login */}
//         {isLogin && (
//           <div className="text-right">
//             <button
//               type="button"
//               onClick={onForgotPassword}
//               className="text-sm md:text-base text-green-600 hover:underline font-medium cursor-pointer"
//             >
//               Forgot Password?
//             </button>
//           </div>
//         )}

//         <button
//           type="submit"
//           className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 text-lg transition duration-300 cursor-pointer"
//         >
//           {isLogin ? "Login" : "Register"}
//         </button>
//       </form>

//       <p className="text-center text-base text-gray-700 mt-6">
//         {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
//         <button
//           onClick={onToggle}
//           className="text-green-600 font-semibold hover:underline text-base cursor-pointer"
//         >
//           {isLogin ? "Register" : "Login"}
//         </button>
//       </p>
//     </div>
//   );
// };

// export default AuthForm;


// src/components/AuthForm.jsx
import React from "react";

const AuthForm = ({ isLogin, formData, onChange, onSubmit, onToggle, onForgotPassword, isLoading }) => {
  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {isLogin ? "Login" : "Register"}
      </h2>

      <form onSubmit={onSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              placeholder="Enter your full name"
              className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
            />
          </div>
        )}

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            required
            placeholder="Enter phone number"
            className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
            placeholder="Enter password (min 8 characters)"
            className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-3 text-base"
          />
        </div>

        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-green-600 hover:underline font-medium cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 text-lg transition duration-300 disabled:bg-gray-400"
        >
          {isLoading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? "Login" : "Register")}
        </button>
      </form>

      <p className="text-center text-base text-gray-700 mt-6">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={onToggle}
          className="text-green-600 font-semibold hover:underline cursor-pointer"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
