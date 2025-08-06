// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import RegisterPage from './pages/Register.jsx'
// import LoginPage from './pages/LoginPage.jsx'
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import DashboardPage from './pages/Dashboard.jsx'; 

// function App() {

//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//         <Route path="/dashboard" element={<DashboardPage />} />
//       </Routes>
//     </Router>
//   )
// }

// export default App


// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import RegisterPage from './pages/Register.jsx';
// import LoginPage from './pages/LoginPage.jsx';
// import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
// import DashboardPage from './pages/Dashboard.jsx';
// import ProtectedRoute from './components/ProtectedRoute.jsx';
// import PublicRoute from './components/PublicRoute.jsx';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route element={<PublicRoute />}>
//           <Route path="/" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//         </Route>
        
//         <Route element={<ProtectedRoute />}>
//           <Route path="/dashboard" element={<DashboardPage />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from './pages/Register.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import DashboardPage from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx'; // Import the new admin dashboard
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx'; // Import the new admin guard

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes for unauthenticated users */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        
        {/* Protected routes for standard authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Nested route specifically for admin users */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
