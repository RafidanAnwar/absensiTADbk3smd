import AbsensiForm from '../components/AbsensiForm';
import AdminLoginModal from '../components/AdminLoginModal';
import { useState } from 'react';
import { FaUserShield } from 'react-icons/fa';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="animated-bg min-h-screen flex flex-col items-center justify-center p-4 relative w-full">
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0"></div>
      
      <button 
        onClick={() => setIsLoginOpen(true)}
        className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-all p-3 rounded-full hover:bg-white/10"
        title="Admin Login"
      >
        <FaUserShield size={24} />
      </button>

      <div className="z-10 w-full max-w-lg mt-8 mb-12">
        <div className="text-center mb-8">
          {/* Logo with Glow */}
          <div className="w-28 h-28 mx-auto mb-6 object-contain relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-500"></div>
            <img src={`${import.meta.env.BASE_URL}logo balaik3smd.png`} alt="Logo Balai K3" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-300 drop-shadow-md">
            Aplikasi Absensi TAD
          </h1>
          <p className="text-blue-100 font-medium tracking-wide mt-2 drop-shadow-sm">Balai K3 Samarinda</p>
        </div>

        <AbsensiForm />
      </div>

      <AdminLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
