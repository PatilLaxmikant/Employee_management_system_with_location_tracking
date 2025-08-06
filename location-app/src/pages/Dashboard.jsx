
// // src/pages/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../contexts/APIContext';
// import { useAuth } from '../contexts/AuthContext';

// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const toastStyles = { success: 'bg-green-500', error: 'bg-red-500' };
//   return (
//     <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white ${toastStyles[type]} transition-opacity duration-300 z-50`}>
//       {message}
//     </div>
//   );
// };

// const useLiveClock = () => {
//   const [time, setTime] = useState(new Date());
//   useEffect(() => {
//     const timerId = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(timerId);
//   }, []);
//   return time;
// };

// const eventCategories = ['Work location', 'Lunch break', 'Other Break', 'Work visit'];
// const getTodayStorageKey = () => `eventStatus_${new Date().toISOString().split('T')[0]}`;

// const DashboardPage = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
  
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [remark, setRemark] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState(eventCategories[0]);
//   const [toast, setToast] = useState(null);
  
//   const [eventStatus, setEventStatus] = useState(() => {
//     const savedStatus = localStorage.getItem(getTodayStorageKey());
//     try {
//       return savedStatus ? JSON.parse(savedStatus) : eventCategories.reduce((acc, cat) => ({...acc, [cat]: 'ended'}), {});
//     } catch {
//       return eventCategories.reduce((acc, cat) => ({...acc, [cat]: 'ended'}), {});
//     }
//   });

//   const currentTime = useLiveClock();

//   const showToast = (message, type = 'success') => setToast({ message, type });

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const eventsResponse = await api.get('/events');
//         setEvents(eventsResponse.data);
//       } catch (err) {
//         if (err.response?.status !== 401) showToast('Failed to fetch event data.', 'error');
//       } finally {
//         setLoading(false);
//       }
//     };
//     if(user) fetchEvents();
//   }, [user]);

//   const handleAction = (category, action) => {
//     const eventTextToFind = `${action} ${category}`;
//     const selectedEvent = events.find(e => e.event_txt === eventTextToFind);
    
//     if (!selectedEvent) return showToast(`Action "${eventTextToFind}" is not configured.`, 'error');
//     if (!navigator.geolocation) return showToast("Geolocation is not supported.", 'error');

//     navigator.geolocation.getCurrentPosition(
//       (pos) => sendActionToServer(selectedEvent.id, eventTextToFind, category, action, pos.coords.latitude, pos.coords.longitude),
//       () => {
//         showToast("Could not get location. Recording action without it.", 'error');
//         sendActionToServer(selectedEvent.id, eventTextToFind, category, action, null, null);
//       }
//     );
//   };

//   const sendActionToServer = async (eventId, eventText, category, action, latitude, longitude) => {
//     try {
//       await api.post('/attendance', { event_id: eventId, latitude, longitude, remarks_txt: remark });
//       showToast(`Action '${eventText}' recorded!`, 'success');
      
//       const newStatus = { ...eventStatus, [category]: action === 'Start' ? 'started' : 'ended' };
//       setEventStatus(newStatus);
//       localStorage.setItem(getTodayStorageKey(), JSON.stringify(newStatus));
//       setRemark('');
//     } catch (err) {
//        if (err.response?.status !== 401) showToast(`Error recording action.`, 'error');
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   if (loading || !user) {
//     return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Loading Dashboard...</div>;
//   }

//   const isCurrentCategoryStarted = eventStatus[selectedCategory] === 'started';

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
//       <div className="w-full max-w-2xl mx-auto">
//         <header className="bg-white p-6 rounded-2xl shadow-md mb-6">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
//           <p className="text-md sm:text-lg text-gray-500 mt-1">{currentTime.toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
//           <p className="text-2xl font-mono font-semibold text-green-600 mt-2">{currentTime.toLocaleTimeString()}</p>
//         </header>

//         <div className="bg-white p-6 rounded-2xl shadow-md">
//             <div className="mb-4">
//                 <label htmlFor="category-select" className="block text-base font-medium text-gray-700 mb-2">Select Category</label>
//                 <select id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-xl border-gray-300 shadow-sm p-3 text-lg focus:ring-green-500 focus:border-green-500">
//                     {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                 </select>
//             </div>
            
//             <div className="mb-6">
//               <label htmlFor="remark" className="block text-base font-medium text-gray-700 mb-2">Remark (Optional)</label>
//               <input id="remark" type="text" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Add a comment for your next action..." className="w-full rounded-xl border-gray-300 shadow-sm p-3 focus:ring-green-500 focus:border-green-500" />
//             </div>

//             <div className="flex gap-4">
//                 <button onClick={() => handleAction(selectedCategory, 'Start')} disabled={isCurrentCategoryStarted} className="flex-1 p-3 text-white font-bold text-base rounded-xl shadow-lg bg-green-600 hover:bg-green-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">Start</button>
//                 <button onClick={() => handleAction(selectedCategory, 'End')} disabled={!isCurrentCategoryStarted} className="flex-1 p-3 text-white font-bold text-base rounded-xl shadow-lg bg-red-600 hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">End</button>
//             </div>
//         </div>
        
//         <div className="w-full mt-6 flex justify-end">
//             <button onClick={handleLogout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Logout</button>
//         </div>
//       </div>

//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   );
// };

// export default DashboardPage;


// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../contexts/APIContext'; // The configured axios instance
import { useAuth } from '../contexts/AuthContext'; // To get user data and logout function
import Toast from '../components/Toast'; // The reusable Toast component

// Custom hook for a live-updating clock
const useLiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  return time;
};

// Define the base categories for the UI dropdown
const eventCategories = ['Work location', 'Lunch break', 'Other Break', 'Work visit'];

// Helper function to generate a unique localStorage key for the current day
const getTodayStorageKey = () => `eventStatus_${new Date().toISOString().split('T')[0]}`;

const DashboardPage = () => {
  const { user, logout } = useAuth(); // Get user data and logout function from context
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(eventCategories[0]);
  const [toast, setToast] = useState(null);
  
  // Initialize the status of events from localStorage to persist UI state on refresh
  const [eventStatus, setEventStatus] = useState(() => {
    const todayKey = getTodayStorageKey();
    const savedStatus = localStorage.getItem(todayKey);
    try {
      // If there's saved data for today, parse it.
      return savedStatus ? JSON.parse(savedStatus) : eventCategories.reduce((acc, cat) => ({...acc, [cat]: 'ended'}), {});
    } catch {
      // If parsing fails, return the default state.
      return eventCategories.reduce((acc, cat) => ({...acc, [cat]: 'ended'}), {});
    }
  });

  const currentTime = useLiveClock();

  // Function to display a toast notification
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Effect to fetch event types from the server when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsResponse = await api.get('/events');
        setEvents(eventsResponse.data);
      } catch (err) {
        // The API interceptor will handle 401, but we can show errors for other issues.
        if (err.response?.status !== 401) {
            showToast('Failed to fetch event data.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    // Only fetch events once the user object is available from the AuthContext
    if(user) {
        fetchEvents();
    }
  }, [user]);

  /**
   * Handles the click on a "Start" or "End" button.
   */
  const handleAction = (category, action) => {
    const eventTextToFind = `${action} ${category}`;
    const selectedEvent = events.find(e => e.event_txt === eventTextToFind);
    
    if (!selectedEvent) {
        return showToast(`Action "${eventTextToFind}" is not configured.`, 'error');
    }

    if (!navigator.geolocation) {
      return showToast("Geolocation is not supported by your browser.", 'error');
    }

    // Get user's location and then send the action to the server
    navigator.geolocation.getCurrentPosition(
      (position) => sendActionToServer(selectedEvent.id, eventTextToFind, category, action, position.coords.latitude, position.coords.longitude),
      () => {
        showToast("Could not get location. Action recorded without it.", 'error');
        // Proceed to record the action even if location fails
        sendActionToServer(selectedEvent.id, eventTextToFind, category, action, null, null);
      }
    );
  };

  /**
   * Sends the recorded action to the backend and updates the persistent UI state.
   */
  const sendActionToServer = async (eventId, eventText, category, action, latitude, longitude) => {
    try {
      const payload = { event_id: eventId, latitude, longitude, remarks_txt: remark };
      await api.post('/attendance', payload);
      showToast(`Action '${eventText}' recorded successfully!`, 'success');
      
      // Update the state and persist it to localStorage for the current day.
      const newStatus = { ...eventStatus, [category]: action === 'Start' ? 'started' : 'ended' };
      setEventStatus(newStatus);
      localStorage.setItem(getTodayStorageKey(), JSON.stringify(newStatus));

      setRemark(''); // Clear remark input on success
    } catch (err) {
       if (err.response?.status !== 401) {
            showToast(`Error: Could not record action '${eventText}'.`, 'error');
       }
    }
  };

  // Handles user logout using the function from AuthContext
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show a loading screen while user data or events are being fetched
  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Loading Dashboard...</div>;
  }

  const isCurrentCategoryStarted = eventStatus[selectedCategory] === 'started';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
          <p className="text-md sm:text-lg text-gray-500 mt-1">{currentTime.toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
          <p className="text-2xl font-mono font-semibold text-green-600 mt-2">{currentTime.toLocaleTimeString()}</p>
        </header>

        {/* Main actions card */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="mb-4">
                <label htmlFor="category-select" className="block text-base font-medium text-gray-700 mb-2">Select Category</label>
                <select id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-xl border-gray-300 shadow-sm p-3 text-lg focus:ring-green-500 focus:border-green-500">
                    {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="remark" className="block text-base font-medium text-gray-700 mb-2">Remark (Optional)</label>
              <input id="remark" type="text" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Add a comment for your next action..." className="w-full rounded-xl border-gray-300 shadow-sm p-3 focus:ring-green-500 focus:border-green-500" />
            </div>

            <div className="flex gap-4">
                <button onClick={() => handleAction(selectedCategory, 'Start')} disabled={isCurrentCategoryStarted} className="flex-1 p-3 text-white font-bold text-base rounded-xl shadow-lg bg-green-600 hover:bg-green-700 cursor-pointer transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">Start</button>
                <button onClick={() => handleAction(selectedCategory, 'End')} disabled={!isCurrentCategoryStarted} className="flex-1 p-3 text-white font-bold text-base rounded-xl shadow-lg bg-red-600 hover:bg-red-700 cursor-pointer transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">End</button>
            </div>
        </div>
        
        <div className="w-full mt-6 flex justify-end">
            <button onClick={handleLogout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 cursor-pointer">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
