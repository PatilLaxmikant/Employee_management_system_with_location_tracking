// src/components/Toast.jsx
import React, { useEffect } from 'react';

/**
 * A reusable toast notification component.
 * @param {object} props - The component props.
 * @param {string} props.message - The message to display.
 * @param {'success' | 'error' | 'info'} props.type - The type of toast, which determines its color.
 * @param {() => void} props.onClose - A function to call when the toast should be closed.
 */
const Toast = ({ message, type, onClose }) => {
  // This effect sets a timer to automatically close the toast after 3 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1000);

    // Cleanup function to clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseStyle = "fixed top-5 right-5 px-4 py-3 rounded-lg shadow-2xl text-white font-semibold transition-all duration-300 z-50 animate-slide-in";
  
  // Define styles for different toast types
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type] || 'bg-gray-700'}`}>
      {message}
    </div>
  );
};

// Add some basic animation keyframes to your index.css for a nicer effect
/*
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in {
  animation: slide-in 0.5s forwards;
}
*/

export default Toast;
