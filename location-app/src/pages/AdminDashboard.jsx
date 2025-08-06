// // src/pages/AdminDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import api from '../contexts/APIContext';
// import { useAuth } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';

// // Fix for default marker icon issue with webpack
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });

// const AdminDashboard = () => {
//   const { logout } = useAuth();
//   const navigate = useNavigate();
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [activity, setActivity] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Fetch all users on component mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await api.get('/admin/users');
//         setUsers(response.data);
//       } catch (err) {
//         setError('Failed to fetch users. You may not have admin privileges.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Fetch activity for a selected user
//   useEffect(() => {
//     if (selectedUser) {
//       const fetchActivity = async () => {
//         try {
//           setActivity(null); // Clear previous activity
//           const response = await api.get(`/admin/activity/${selectedUser.id}`);
//           setActivity(response.data);
//         } catch (err) {
//           setError(`Failed to fetch activity for ${selectedUser.name}.`);
//         }
//       };
//       fetchActivity();
//     }
//   }, [selectedUser]);

//   const handleUserSelect = (user) => {
//     setSelectedUser(user);
//   };
  
//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const locationPoints = activity?.attendance_records.filter(rec => rec.latitude && rec.longitude) || [];
//   const mapCenter = locationPoints.length > 0 ? [locationPoints[0].latitude, locationPoints[0].longitude] : [20.5937, 78.9629]; // Default to India

//   if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;
//   if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-md">
//         <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//           <button
//             onClick={handleLogout}
//             className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* User List */}
//           <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
//             <h2 className="text-xl font-semibold mb-4">All Users ({users.length})</h2>
//             <ul className="space-y-2 max-h-screen overflow-y-auto">
//               {users.map(user => (
//                 <li key={user.id}>
//                   <button
//                     onClick={() => handleUserSelect(user)}
//                     className={`w-full text-left p-3 rounded-lg transition-colors ${selectedUser?.id === user.id ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
//                   >
//                     <p className="font-bold">{user.name}</p>
//                     <p className="text-sm">{user.phone_number}</p>
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Activity Feed and Map */}
//           <div className="lg:col-span-2 space-y-6">
//             {!selectedUser ? (
//               <div className="bg-white p-10 rounded-lg shadow text-center">
//                 <h2 className="text-xl font-semibold">Select a user to view their activity.</h2>
//               </div>
//             ) : (
//               <>
//                 {/* Activity Table */}
//                 <div className="bg-white p-6 rounded-lg shadow">
//                   <h2 className="text-xl font-semibold mb-4">Activity Log for {selectedUser.name}</h2>
//                   <div className="overflow-x-auto max-h-96">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {activity ? activity.attendance_records.map(rec => (
//                           <tr key={rec.id}>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.event_txt}</td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rec.create_dttm).toLocaleString()}</td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.remarks_txt || '-'}</td>
//                           </tr>
//                         )) : (
//                            <tr><td colSpan="3" className="text-center py-4">Loading activity...</td></tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {/* Map View */}
//                 <div className="bg-white p-6 rounded-lg shadow h-96">
//                    <h2 className="text-xl font-semibold mb-4">Location History</h2>
//                    <MapContainer center={mapCenter} zoom={locationPoints.length > 0 ? 13 : 5} style={{ height: '100%', width: '100%' }}>
//                         <TileLayer
//                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                         />
//                         {locationPoints.map(point => (
//                             <Marker key={point.id} position={[point.latitude, point.longitude]}>
//                                 <Popup>
//                                     <b>{point.event_txt}</b><br/>
//                                     {new Date(point.create_dttm).toLocaleString()}<br/>
//                                     {point.remarks_txt && `Remarks: ${point.remarks_txt}`}
//                                 </Popup>
//                             </Marker>
//                         ))}
//                     </MapContainer>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;

// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../contexts/APIContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users. You may not have admin privileges.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch activity for a selected user
  useEffect(() => {
    if (selectedUser) {
      const fetchActivity = async () => {
        try {
          setActivity(null); // Clear previous activity
          const response = await api.get(`/admin/activity/${selectedUser.id}`);
          setActivity(response.data);
        } catch (err) {
          setError(`Failed to fetch activity for ${selectedUser.name}.`);
        }
      };
      fetchActivity();
    }
  }, [selectedUser]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const locationPoints = activity?.attendance_records.filter(rec => rec.latitude && rec.longitude) || [];
  const mapCenter = locationPoints.length > 0 ? [locationPoints[0].latitude, locationPoints[0].longitude] : [20.5937, 78.9629]; // Default to India

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">All Users ({users.length})</h2>
            <ul className="space-y-2 max-h-screen overflow-y-auto">
              {users.map(user => (
                <li key={user.id}>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedUser?.id === user.id ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm">{user.phone_number}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Feed and Map */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedUser ? (
              <div className="bg-white p-10 rounded-lg shadow text-center">
                <h2 className="text-xl font-semibold">Select a user to view their activity.</h2>
              </div>
            ) : (
              <>
                {/* Activity Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Activity Log for {selectedUser.name}</h2>
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activity ? activity.attendance_records.map(rec => {
                           const eventDate = new Date(rec.create_dttm);
                           return (
                            <tr key={rec.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.event_txt}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eventDate.toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eventDate.toLocaleTimeString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.remarks_txt || '-'}</td>
                            </tr>
                           )
                        }) : (
                           <tr><td colSpan="4" className="text-center py-4">Loading activity...</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Map View */}
                <div className="bg-white p-6 rounded-lg shadow h-96">
                   <h2 className="text-xl font-semibold mb-4">Location History</h2>
                   <MapContainer center={mapCenter} zoom={locationPoints.length > 0 ? 13 : 5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {locationPoints.map(point => (
                            <Marker key={point.id} position={[point.latitude, point.longitude]}>
                                <Popup>
                                    <b>{point.event_txt}</b><br/>
                                    {new Date(point.create_dttm).toLocaleString()}<br/>
                                    {point.remarks_txt && `Remarks: ${point.remarks_txt}`}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
