import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../components/AdminTable';
import { FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDino, setShowDino] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) {
      navigate('/');
    } else {
      setIsAuthenticated(true);
      
      // Cek apakah dino sudah pernah dilihat di sesi ini
      const hasSeenDino = sessionStorage.getItem('hasSeenDino');
      if (!hasSeenDino) {
        setShowDino(true);
        sessionStorage.setItem('hasSeenDino', 'true');
        
        // Hilangkan dino setelah 4 detik
        setTimeout(() => {
          setShowDino(false);
        }, 4000);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative overflow-hidden">
      
      {/* Yellow Dino Overlay */}
      <AnimatePresence>
        {showDino && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, y: 50, rotate: -10 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0, y: -50, rotate: 10 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="relative text-center"
            >
              <img 
                src={`${import.meta.env.BASE_URL}dino-kuning-dino-boy.gif`} 
                alt="Cute Yellow Dino" 
                className="w-64 h-64 mx-auto drop-shadow-[0_0_20px_rgba(255,255,0,0.6)]" 
              />
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-xl px-8 py-3 rounded-full shadow-2xl"
              >
                Rawrrr! Selamat Datang Admin! 🦖✨
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
