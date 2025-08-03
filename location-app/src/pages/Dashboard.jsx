

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define your backend API URL
const API_URL = "https://ed41b5548e92.ngrok-free.app";

// Custom hook for the live clock
const useLiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return time;
};

// Main Dashboard Component
const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonStates, setButtonStates] = useState({
    entry: false,
    lunchStart: false,
    lunchEnd: false,
    exit: false,
  });
  const navigate = useNavigate();
  const currentTime = useLiveClock();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Function to handle button clicks
  const handleAction = (actionType) => {
    // Get current location
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendActionToServer(actionType, latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        // Still send action, but without location data
        sendActionToServer(actionType, null, null);
        alert("Could not get location. Action will be recorded without it.");
      }
    );
  };

  // Function to send data to the backend
  const sendActionToServer = async (actionType, latitude, longitude) => {
    const token = localStorage.getItem('authToken');
    try {
      const payload = {
        action_type: actionType,
        timestamp: new Date().toISOString(),
        latitude,
        longitude,
      };

      await axios.post(`${API_URL}/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Action '${actionType}' recorded successfully!`);

      // Update button disabled states
      if (actionType === 'Office Entry') setButtonStates(prev => ({ ...prev, entry: true }));
      if (actionType === 'Start Lunch') setButtonStates(prev => ({ ...prev, lunchStart: true }));
      if (actionType === 'End Lunch') setButtonStates(prev => ({ ...prev, lunchEnd: true }));
      if (actionType === 'Office Exit') setButtonStates(prev => ({ ...prev, exit: true }));

    } catch (err) {
      console.error(`Failed to record action '${actionType}':`, err);
      alert(`Error: Could not record action '${actionType}'.`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl font-semibold">Loading Dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome, {user ? user.name : 'Employee'}!
          </h1>
          <p className="text-md sm:text-lg text-gray-500 mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-2xl font-mono font-semibold text-green-600 mt-2">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionButton onClick={() => handleAction('Office Entry')} disabled={buttonStates.entry}>Mark Office Entry</ActionButton>
          <ActionButton onClick={() => handleAction('Office Exit')} disabled={buttonStates.exit} color="red">Mark Office Exit</ActionButton>
          <ActionButton onClick={() => handleAction('Start Lunch')} disabled={buttonStates.lunchStart} color="yellow">Start Lunch</ActionButton>
          <ActionButton onClick={() => handleAction('End Lunch')} disabled={buttonStates.lunchEnd} color="yellow">End Lunch</ActionButton>
          <ActionButton onClick={() => handleAction('Start Other Work')} color="blue">Start Other Work</ActionButton>
          <ActionButton onClick={() => handleAction('End Other Work')} color="blue">End Other Work</ActionButton>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
           <button
             onClick={() => {
               localStorage.removeItem('authToken');
               navigate('/');
             }}
             className="w-full bg-gray-700 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 text-lg transition duration-300"
           >
             Logout
           </button>
        </div>
      </div>
    </div>
  );
};

// Reusable ActionButton component
const ActionButton = ({ children, onClick, disabled = false, color = 'green' }) => {
  const colors = {
    green: 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500',
    red: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 focus-visible:ring-yellow-400',
    blue: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 sm:p-6 text-white font-bold text-lg rounded-xl shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none ${colors[color]}`}
    >
      {children}
    </button>
  );
};

export default DashboardPage;
