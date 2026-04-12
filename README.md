<div align="center">
  <h1>🏢 SI-TAD Balai K3 Samarinda</h1>
  <p><strong>Sistem Informasi Presensi & Rekapitulasi Tenaga Ahli Daya (TAD) Interaktif</strong></p>
  
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite_8-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![TailwindCSS v4](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  [![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white)](https://developers.google.com/apps-script)
</div>

---

## 📖 Ringkasan Proyek
Aplikasi sistem presensi Tenaga Ahli Daya (TAD) modern berbasis *Single Page Application* (SPA) yang dikhususkan untuk **Balai Keselamatan dan Kesehatan Kerja (K3) Samarinda**. Sistem ini memadukan kemampuan antarmuka modern yang dinamis di sisi klien dengan Serverless API *Google Apps Script* (GAS) + Google Sheets sebagai basis data yang tangguh dan tanpa biaya komputasi server.

Dibangun dengan desain **Glassmorphism**, antarmuka ini memberikan kesan *premium* serta pengalaman *seamless* bagi penggunanya di berbagai resolusi layar.

---

## ✨ Fitur Unggulan

### 👤 Portal Pegawai
- **📸 Laporan Foto (Webcam Integration):** Fitur jepretan kamera langsung yang tersinkronisasi. Foto dikirim dan diamankan ke dalam Google Drive.
- **📍 Live Geolocation Tracking:** Identifikasi garis lintang dan bujur pegawai secara presisi, divisualisasikan melalui *mini-map* pada form absensi.
- **⏱️ Time-Gated Policy:** Sistem cerdas yang mengunci validitas submit presensi (*Masuk*: 07:00 - 10:00 WITA | *Pulang*: 16:00 - 23:59 WITA).
- **💡 Smart Auto-Fill Pegawai:** Integrasi *Master Data* NIK dan Jabatan yang akan terisi otomatis saat pengguna mulai mengetikkan nama masing-masing.

### 🛡️ Dashboard Admin
- **🔐 Secure Login:** Portal admin terproteksi rahasia kredensial (mendukung fitur penglihatan *View Password*).
- **🔄 Smart Filtering & Pagination:** Pengelola dapat menyortir data harian dengan mulus. Dilengkapi filter status (*WFO, WFH, Dinas Keluar, dll*), kolom pencarian pintar, serta pembagian rentang *pagination* yang optimal untuk menangani data besar.
- **📝 Live CRUD Operations:** Admin berhak mengubah atau menghapus data-data presensi abal-abal atau keliru langsung di dashboard tanpa harus membuka Spreadsheet.
- **📊 Rekapitulasi PDF Engine:** Fungsi generator dokumen mandiri (*Client-side PDF Exporter*) yang memetakan, mengelompokkan keseluruhan status presensi pegawai menjadi dokumen berdesain rapi (*Navy Striped Theme*).

---

## 🛠️ Stack Teknologi Terkini

Aplikasi ini dipelihara menggunakan ekosistem terbaru guna memaksimalkan performa:

**Frontend Ecosystem:**
- **Core Lib:** React `v19` + TypeScript
- **Bundler:** Vite `v8`
- **Styling:** Tailwind CSS `v4` (*Native CSS PostCSS Workflow*)
- **Routing:** React Router DOM `v7`
- **Animation:** Framer Motion
- **Report Engine:** jsPDF & jsPDF-AutoTable
- **Icons:** React Icons

**Backend API (Serverless):**
- **Hosting Engine:** Google Apps Script (`Code.js`)
- **Database Storage:** Google Sheets via *REST-like App execution*
- **File Asset Management:** Google Drive API

---

## 🚀 Panduan Pengembangan Lokal (Local Dev)

Jika Anda ingin ikut serta memodifikasi fungsionalitas UI/UX atau menambahkan fitur baru:

1. **Clone repositori ini**
   ```bash
   git clone https://github.com/USERNAME_ANDA/absensi-tad.git
   cd absensi-tad
   ```

2. **Pasang Dependencies Klien**
   Aplikasi dirakit di bundler Vite.
   ```bash
   npm install
   ```

3. **Jalankan Vite Server**
   ```bash
   npm run dev
   ```
   > Akses langsung di `http://localhost:5173` lewat peramban (*browser*) Anda.

---

## ☁️ Deployment Otomatis (CI/CD)

Proyek ini telah dikonfigurasi sepenuhnya agar berjalan mulus dalam integrasi yang berkelanjutan (*Continuous Integration*).

### 1. Frontend (Vercel Integration)
Aplikasi frontend akan secara otomatis di-*deploy* ke **Vercel** setiap kali Anda melakukan perintah `git push origin main`.
- Konfigurasi *client-side routing* sudah tertempel permanen pada berkas `vercel.json` (menghindari error rute `404 Not Found`).
- Pengalamatan (*Base URL*) pada berkas `vite.config.ts` sudah dipusatkan ke akar standar web (`/`).

### 2. Backend (Google Clasp GitHub Actions)
Logika backend di folder `gas/` (seperti *Code.js* dan *appsscript.json*) akan dikerahkan otomatis ke *Google Apps Script* via **GitHub Actions** jika terdeteksi ada perubahan. Syarat utamanya:
- Pastikan variabel rahasia (`CLASP_TOKEN`) sudah tercatat apik di sistem navigasi **GitHub Secrets & variables**.
- *Spreadsheet ID* serta URL Endpoint harus disematkan secara manual / *hardcode* jika terjadi pergeseran endpoint berkas API (cth: `src/utils/api.ts`).

---
<div align="center">
  <p>Didesain untuk mengoptimalkan penatausahaan rekam jejak Tenaga Ahli Daya, memastikan kelancaran operasional Balai K3 di zona yang dinamis.</p>
</div>
