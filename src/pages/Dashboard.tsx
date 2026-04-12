import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../components/AdminTable';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) {
      navigate('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">Kelola Data Presensi TAD</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shrink-0"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

        <AdminTable />
      </div>
    </div>
  );
}
