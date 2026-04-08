import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { FaCamera, FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa';
import { DATA_PEGAWAI, STATUS_KEHADIRAN, type Pegawai } from '../utils/data';
import { getCurrentWITA, isMasukTime, isPulangTime } from '../utils/time';
import { submitPresensi } from '../utils/api';

export default function AbsensiForm() {
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    jabatan: '',
    status: 'Hadir',
    aktivitas: '',
  });

  const [suggestions, setSuggestions] = useState<Pegawai[]>([]);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationText, setLocationText] = useState('Sedang mencari lokasi...');
  const [foto, setFoto] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const [timeWITA, setTimeWITA] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const tipeAbsen = isMasukTime() ? 'Masuk' : (isPulangTime() ? 'Pulang' : null);

  useEffect(() => {
    // Update live clock
    const timer = setInterval(() => {
      setTimeWITA(getCurrentWITA().timeString);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationText(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          setLocationText('Gagal mendapatkan lokasi. Izinkan akses geolokasi.');
          console.error(error);
        }
      );
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, nama: val });

    if (val.length > 0) {
      const filtered = DATA_PEGAWAI.filter(p => p.nama.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
      setFormData(prev => ({ ...prev, nik: '', jabatan: '' }));
    }
  };

  const selectPegawai = (p: Pegawai) => {
    setFormData({
      ...formData,
      nama: p.nama,
      nik: p.nik,
      jabatan: p.jabatan
    });
    setSuggestions([]);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFoto(imageSrc);
      setShowWebcam(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipeAbsen) {
      alert("Saat ini bukan waktu absensi (Masuk: 07:00-10:00, Pulang: 16:00-24:00 WITA)");
      return;
    }
    if (!foto) {
      alert("Harap ambil foto bukti terlebih dahulu.");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        waktu: getCurrentWITA().timeString,
        tipe: tipeAbsen, // 'Masuk' atau 'Pulang'
        lokasi: location ? `${location.lat},${location.lng}` : '',
        fotoBase64: foto
      };

      await submitPresensi(payload);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ nama: '', nik: '', jabatan: '', status: '', aktivitas: '' });
        setFoto(null);
      }, 3000);
    } catch (err) {
      alert("Gagal mengirim presensi");
      console.error(err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 md:p-8 rounded-3xl w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide text-center sm:text-left">Formulir Presensi</h2>
        <div className="bg-white/10 px-4 py-2 rounded-full text-white flex items-center gap-2 font-medium shadow-inner border border-white/10 backdrop-blur-md text-sm sm:text-base">
          <FaSyncAlt className="animate-spin-slow" />
          {timeWITA || "Memuat..."} WITA
        </div>
      </div>

      {!tipeAbsen && !isSuccess && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
          Saat ini di luar jam operasional absensi. (Masuk: 07:00-10:00, Pulang: 16:00-24:00)
        </div>
      )}

      {isSuccess ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-k3-green/20 backdrop-blur-md z-10 text-white p-8 rounded-2xl text-center border-2 border-k3-green/50 shadow-[0_0_20px_rgba(29,185,84,0.3)]"
        >
          <div className="text-4xl mb-4 text-center mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-inner">✅</div>
          <h3 className="font-bold text-xl mb-2 drop-shadow-md">Presensi Berhasil!</h3>
          <p className="text-green-50">Terima kasih, data Anda telah tersimpan ke sistem.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="relative z-20">
            <label className="block text-sm font-medium text-blue-50 mb-1 drop-shadow-sm">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={handleNameChange}
              className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
              placeholder="Ketik nama Anda..."
              disabled={!tipeAbsen || isSubmitLoading}
            />
            {suggestions.length > 0 && (
              <ul className="absolute top-full mt-2 w-full bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl max-h-48 overflow-auto z-30">
                {suggestions.map((p, i) => (
                  <li
                    key={i}
                    onClick={() => selectPegawai(p)}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer text-sm text-blue-50 border-b border-white/5 last:border-0 transition-colors"
                  >
                    {p.nama}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-50 mb-1 drop-shadow-sm">NIK</label>
              <input
                type="text"
                required
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                disabled={!tipeAbsen || isSubmitLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-50 mb-1 drop-shadow-sm">Jabatan</label>
              <input
                type="text"
                required
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                disabled={!tipeAbsen || isSubmitLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-50 mb-1 drop-shadow-sm">Status Kehadiran</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="glass-input w-full px-4 py-2.5 rounded-xl outline-none [&>option]:text-gray-800"
                disabled={!tipeAbsen || isSubmitLoading}
              >
                {STATUS_KEHADIRAN.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-blue-50 mb-1 drop-shadow-sm">Lokasi</label>
              {location ? (
                <div className="relative w-full h-24 md:h-full min-h-[60px] rounded-xl overflow-hidden border border-white/20 shadow-inner group">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '60px' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/90 text-xs px-2 py-1 text-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full min-h-[44px] px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm flex items-center gap-2 text-blue-100 shadow-inner">
                  <FaMapMarkerAlt className="text-red-400 shrink-0" />
                  {locationText}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-50 mb-1 drop-shadow-sm">Aktivitas</label>
            <textarea
              value={formData.aktivitas}
              onChange={(e) => setFormData({ ...formData, aktivitas: e.target.value })}
              className="glass-input w-full px-4 py-3 rounded-xl outline-none resize-none h-24"
              placeholder="Deskripsi aktivitas hari ini..."
              disabled={!tipeAbsen || isSubmitLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-50 mb-2 drop-shadow-sm">Bukti Foto</label>
            {!foto ? (
              showWebcam ? (
                <div className="relative rounded-2xl overflow-hidden bg-black text-center shadow-2xl border-2 border-white/20">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.8}
                    videoConstraints={{ 
                      facingMode: "user",
                      width: { ideal: 640 },
                      height: { ideal: 480 } 
                    }}
                    className="w-full max-h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={capture}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-k3-dark px-6 py-2.5 rounded-full font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all outline-none"
                  >
                    📸 Ambil Foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="w-full py-6 md:py-10 border border-dashed border-white/30 rounded-2xl text-blue-100 hover:border-white/80 hover:bg-white/5 transition-all flex flex-col items-center gap-3 backdrop-blur-sm shadow-inner group"
                  disabled={!tipeAbsen || isSubmitLoading}
                >
                  <FaCamera size={36} className="text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                  <span className="font-medium tracking-wide">Aktifkan Kamera</span>
                </button>
              )
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl inline-block border-2 border-k3-green/50">
                <img src={foto} alt="Bukti Absen" className="max-h-64 object-cover" />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  disabled={isSubmitLoading}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!tipeAbsen || !foto || isSubmitLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all tracking-wide 
              ${(!tipeAbsen || !foto || isSubmitLoading) ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5' : 'bg-white text-k3-dark hover:bg-green-50 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isSubmitLoading ? 'Tunggu...' : `🚀 Submit Absen ${tipeAbsen || ''}`}
          </button>
        </form>
      )}
    </motion.div>
  );
}
