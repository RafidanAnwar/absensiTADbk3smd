import AbsensiForm from '../components/AbsensiForm';
import AdminLoginModal from '../components/AdminLoginModal';
import { useState } from 'react';
import { FaRegUser } from 'react-icons/fa';
import './Home.css';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="home-container">
      {/* Background Image */}
      <div
        className="home-bg-image"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}DSC06273.JPG%201.png')` }}
      ></div>

      <div className="home-overlay"></div>

      {/* Header Container */}
      <header className="home-header">
        {/* Logos */}
        <div className="logo-container">
          <img
            src={`${import.meta.env.BASE_URL}logo kemnaker.png`}
            alt="Logo Kemnaker"
            className="logo-kemnaker"
          />
          <img
            src={`${import.meta.env.BASE_URL}logo balaik3.png`}
            alt="Logo Balai K3"
            className="logo-balaik3"
          />
        </div>

        {/* Login Button */}
        <div className="login-btn-container" onClick={() => setIsLoginOpen(true)}>
          <FaRegUser className="text-[12px] text-white" />
          <span className="login-btn-text">Login</span>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="home-main">
        <AbsensiForm />
      </main>

      <AdminLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
