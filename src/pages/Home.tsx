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
          <div className="w-full px-6 mx-auto mb-8 object-contain relative group">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500 scale-y-50"></div>
            <img src={`${import.meta.env.BASE_URL}logo balaik3smd.png`} alt="Logo Balai K3" className="w-full h-auto relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-300 drop-shadow-md">
            Aplikasi Absensi TAD
          </h1>
        </div>

        <AbsensiForm />
      </div>

      <AdminLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
