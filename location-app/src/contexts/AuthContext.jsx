// // src/context/AuthContext.jsx
// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("authToken"));
//   const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

//   const login = (token, userData) => {
//     localStorage.setItem("authToken", token);
//     localStorage.setItem("user", JSON.stringify(userData));
//     setToken(token);
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("user");
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ token, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "./APIContext"; // Import the configured axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // If a token exists on initial load, fetch user data
    if (token && !user) {
      api.get("/users/me")
        .then(response => {
          localStorage.setItem("user", JSON.stringify(response.data));
          setUser(response.data);
        })
        .catch(() => {
          // If token is invalid, log out
          logout();
        });
    }
  }, [token, user]);

  const login = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Clear daily event status on logout
    // const todayKey = `eventStatus_${new Date().toISOString().split('T')[0]}`;
    // localStorage.removeItem(todayKey);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
