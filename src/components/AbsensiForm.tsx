import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { FaCamera, FaMapMarkerAlt } from 'react-icons/fa';
import { DATA_PEGAWAI, STATUS_KEHADIRAN, type Pegawai } from '../utils/data';
import { getCurrentWITA, isMasukTime, isPulangTime, getTipeAbsenFallback } from '../utils/time';
import { submitPresensi } from '../utils/api';
import Swal from 'sweetalert2';

export default function AbsensiForm() {
  const defaultTipe = isMasukTime() ? 'Masuk' : (isPulangTime() ? 'Pulang' : getTipeAbsenFallback());

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    jabatan: '',
    status: '',
    aktivitas: '',
    tipe: defaultTipe,
  });

  const [suggestions, setSuggestions] = useState<Pegawai[]>([]);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationText, setLocationText] = useState('Sedang mencari lokasi...');
  const [foto, setFoto] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const [timeWITA, setTimeWITA] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

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
      jabatan: p.jabatan,
      tipe: defaultTipe
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
    if (!foto) {
      alert("Harap ambil foto bukti terlebih dahulu.");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        waktu: getCurrentWITA().timeString,
        tipe: formData.tipe,
        lokasi: location ? `${location.lat},${location.lng}` : '',
        fotoBase64: foto
      };

      await submitPresensi(payload);

      Swal.fire({
        icon: 'success',
        title: 'Presensi Berhasil!',
        text: 'Data Anda telah tersimpan ke sistem.',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true
      });

      setFormData({ nama: '', nik: '', jabatan: '', status: '', aktivitas: '', tipe: defaultTipe });
      setFoto(null);
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
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-[31px]">

        {/* Top Box: Header + Data Diri */}
        <div className="glass-box-top">
          {/* Header */}
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[#F8FAFC] text-[12px] font-semibold tracking-wide">Formulir Presensi</h2>
            <div className="flex items-center justify-center border border-white rounded-[19px] px-3 h-[25px] text-[#F8FAFC] text-[12px] font-semibold">
              {timeWITA || "Memuat..."} WITA
            </div>
          </div>

          {/* Data Diri Card */}
          <div className="inner-card">

            <div className="input-group relative z-20">
              <label className="input-label">Nama Lengkap & Gelar</label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={handleNameChange}
                className="input-field"
                placeholder="Ketik nama Anda..."
                disabled={isSubmitLoading}
              />
              {suggestions.length > 0 && (
                <ul className="absolute top-full mt-1 w-full bg-white border border-[#D5D5D5] shadow-lg rounded-[5px] max-h-40 overflow-auto z-30">
                  {suggestions.map((p, i) => (
                    <li
                      key={i}
                      onClick={() => selectPegawai(p)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[12px] text-[#4D4D4D] border-b border-gray-100 last:border-0"
                    >
                      {p.nama}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-between gap-[17px]">
              <div className="input-group flex-1">
                <label className="input-label">NIK</label>
                <input
                  type="text"
                  required
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="input-field"
                  disabled={isSubmitLoading}
                />
              </div>
              <div className="input-group flex-1">
                <label className="input-label">Jabatan</label>
                <input
                  type="text"
                  required
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  className="input-field"
                  disabled={isSubmitLoading}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Status Kehadiran</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%234D4D4D%22%20d%3D%22M2.146%204.646a.5.5%200%200%201%20.708%200L6%207.793l3.146-3.147a.5.5%200%200%201%20.708.708l-3.5%203.5a.5.5%200%200%201-.708%200l-3.5-3.5a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_11px_center] bg-no-repeat"
                disabled={isSubmitLoading}
              >
                <option value="" disabled hidden>Status Kehadiran anda</option>
                {STATUS_KEHADIRAN.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Tipe Absen</label>
              <select
                value={formData.tipe}
                onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                className={`input-field ${!['petugas keamanan', 'satpam'].includes(formData.jabatan.toLowerCase()) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                disabled={isSubmitLoading || !['petugas keamanan', 'satpam'].includes(formData.jabatan.toLowerCase())}
              >
                <option value="Masuk">Masuk</option>
                <option value="Pulang">Pulang</option>
              </select>
            </div>

          </div>

          {/* Lokasi & Aktivitas Box */}
          <div className="inner-card">
            <div className="input-group">
              <label className="input-label">Lokasi</label>
              {location ? (
                <div className="relative w-full h-[118px] rounded-[5px] overflow-hidden border border-[#D5D5D5]">
                  {/* Hiding Google Maps footer by making iframe taller and cropping it */}
                  <iframe
                    width="100%"
                    height="160px"
                    style={{ border: 0, marginTop: '-10px', marginBottom: '-30px' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              ) : (
                <div className="input-field h-[58px] flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#00629D] shrink-0 text-[16px]" />
                  <span className="font-medium text-[#4D4D4D] text-[12px]">Lokasi Presensi</span>
                  <span className="text-[#CDCDCD] text-[10px] ml-auto">{locationText}</span>
                </div>
              )}
            </div>

            <div className="input-group relative">
              {formData.tipe !== 'Pulang' && (
                <div
                  className="absolute inset-x-0 bottom-0 top-[25px] z-10 cursor-not-allowed"
                  onClick={() => {
                    Swal.fire({
                      icon: 'info',
                      title: 'Aktivitas Terkunci',
                      text: 'Anda hanya dapat mengisi aktivitas harian saat melakukan Absen Pulang.',
                      confirmButtonColor: '#0A4A8E',
                    });
                  }}
                ></div>
              )}
              <label className="input-label">Aktivitas Hari Ini</label>
              <textarea
                value={formData.aktivitas}
                onChange={(e) => setFormData({ ...formData, aktivitas: e.target.value })}
                className={`w-full h-[118px] bg-[#FCFCFC] border border-[#D5D5D5] rounded-[5px] px-[11px] py-2 outline-none resize-none font-medium text-[12px] text-[#4D4D4D] transition-opacity ${formData.tipe !== 'Pulang' ? 'opacity-50' : ''}`}
                placeholder={formData.tipe === 'Pulang' ? "Ceritakan aktivitas anda hari ini selama bekerja" : "Aktivitas diisi saat absen pulang"}
                disabled={isSubmitLoading || formData.tipe !== 'Pulang'}
              />
            </div>
          </div>

          {/* Camera Box */}
          <div>
            {!foto ? (
              showWebcam ? (
                <div className="relative rounded-[8px] overflow-hidden bg-black text-center border border-white/50 h-[130px] flex items-center justify-center">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.8}
                    videoConstraints={{
                      facingMode: "user"
                    }}
                    className="w-full h-[130px] object-cover"
                  />
                  <button
                    type="button"
                    onClick={capture}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 text-k3-dark px-4 py-[6px] rounded-full font-semibold shadow-md hover:scale-105 active:scale-95 transition-all text-[12px]"
                  >
                    📸 Ambil Foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="camera-box"
                  disabled={isSubmitLoading}
                >
                  <FaCamera className="text-[#FFFFFF] text-[25px]" />
                  <div className="flex flex-col items-center">
                    <span className="camera-text-primary">Aktifkan Kamera</span>
                    <span className="camera-text-secondary">Ambil foto selfie di lokasi kerja</span>
                  </div>
                </button>
              )
            ) : (
              <div className="relative rounded-[8px] overflow-hidden shadow-sm border border-[#10B981] h-[130px] w-full flex justify-center bg-black">
                <img src={foto} alt="Bukti Absen" className="h-[130px] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg hover:bg-red-600 transition-colors text-xs"
                  disabled={isSubmitLoading}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
        {/* End of Unified Glass Container */}

        {/* Submit Button */}
        <div className="flex flex-col gap-4 items-center">
          <button
            type="submit"
            disabled={!foto || isSubmitLoading}
            className="submit-btn"
          >
            {isSubmitLoading ? 'Tunggu...' : 'Submit Absen'}
          </button>
          <p className="footer-text">
            Pencatatan Waktu Dilakukan Secara Otomatis
          </p>
          {/* Home Indicator */}
          <div className="home-indicator"></div>
        </div>

      </form>
    </motion.div>
  );
}
