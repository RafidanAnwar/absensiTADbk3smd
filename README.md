# 🏢 Aplikasi Absensi TAD - Balai K3 Samarinda

Aplikasi sistem presensi Tenaga Ahli Daya (TAD) modern untuk Balai Keselamatan dan Kesehatan Kerja (K3) Samarinda. Dibangun menggunakan teknologi Web Modern (*Vite + React + TypeScript*) di sisi frontend dan skalabilitas *Google Apps Script* terhubung langsung ke Google Sheets (sebagai Database) di sisi backend.

Aplikasi ini mengusung antarmuka yang sangat responsif, dilengkapi desain **3D Glassmorphism** dan **Dynamic Animated Colors**.

---

## ✨ Fitur Utama

- **📸 Authenticate using Face (Webcam Integration)**: Pegawai diwajibkan untuk memotret diri mereka saat presensi. Secara otomatis foto disimpan rapi ke folder terdedikasi di Google Drive dan aman dari publik, namun mudah ditinjau oleh Admin.
- **📍 Geolokasi & Peta Mini-Map**: Fitur tracking Latitude dan Longitude secara real-time yang memampang miniatur "Google Maps" di formulir agar user secara presisi mengetahui koordinat pelaporan mereka.
- **⏱️ Time-Gated Submission**: Sistem ini membatasi "Jam Masuk" (07:00 - 10:00 WITA) dan "Jam Pulang" (16:00 - 23:59 WITA).
- **💡 Smart Auto-Fill**: Master Data yang disematkan akan langsung mengisi NIK dan Jabatan saat user mulai mengetik nama mereka. 
- **👥 Single Form - Dual Entry**: Tidak peduli apakah pegawai absen masuk atau absen pulang, record tabel backend akan tersaji secara elegan dalam **satu baris** per orang per hari tanpa repot, di mana data absen "Pulang" menimpa (*update*) tabel yang telah dibentuk sebelumnya.
- **📊 Admin Dashboard (Login Protected)**: Hanya Admin (`adminbk3smd`) yang dapat masuk untuk mengakses kontrol CRUD, dan melakukan ekspor laporan ke dalam format **PDF** melalui generator (*jsPDF*).

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework:** React 18 (dengan TypeScript & Vite)
- **Styling:** Tailwind CSS v4 (*Native CSS Theming & PostCSS Integration*)
- **Animations:** Framer Motion (untuk modal login dan transisi form kaca/*frosted glass*)
- **Camera/Maps**: `react-webcam` dan Iframe Google Maps terdedikasi
- **PDF Exporter:** `jspdf` & `jspdf-autotable`

### Backend (Serverless)
- **Engine:** Google Apps Script (`Code.js`)
- **Database:** Google Sheets
- **Storage File:** Google Drive
- **Deployment Tracker:** Clasp (*Command Line Apps Script Projects*)

## 🚀 Cara Menjalankan Secara Lokal (Development)

Jika Anda ingin berkontribusi atau memodifikasi secara langsung tampilan dari aplikasi ini, Anda dapat menjalankan *development server* di komputer Anda.

1. **Clone repository ini**
   ```bash
   git clone https://github.com/USERNAME_ANDA/absensi-tad.git
   cd "absensi-tad"
   ```

2. **Install Dependensi**
   Pastikan Anda sudah menginstal Node.js versi 18+.
   ```bash
   npm install
   ```

3. **Jalankan Vite Development Server**
   ```bash
   npm run dev
   ```
   *Buka URL tautan `Localhost` pada browser Anda (biasanya di port 5173).*

---

## ☁️ Deployment Backend (Apps Script)

Proyek ini telah dikonfigurasikan agar secara ajaib (lewat Continuous Integration) mendeploy seluruh struktur `gas/Code.js` kepada proyek Google Sheet Anda setiap kali Anda melakukan **`git push origin main`**.

Langkah Awal Setup agar Clasp terotomatisasi secara lancar dengan Action Workflow:

1. Pastikan Anda telah menautkan proyek Clasp menggunakan perintah:
   ```bash
   cd gas
   npx clasp create --type standalone
   ```
2. Pastikan file `gas/Code.js` bagian `SPREADSHEET_ID` merujuk tepat pada ID Spreadsheet milik Anda.
3. Login Clasp dari komputer Anda agar token *auth* tersimpan:
   ```bash
   npx clasp login
   ```
4. Copy/salin seluruh kode/JSON rahasia yang tercetak otomatis di file log in `~/.clasprc.json` (atau lokasi lain yang ada di OS sistem Anda).
5. Pada panel pengaturan rahasia Github Anda: **Repository Settings** > **Secrets and variables** > **Actions** > **New repository secret**. Namakan secara pasti menjadi variabel:
   `CLASP_TOKEN` dan paster isian tadi.

Setelah kunci (*Secret*) tersebut didaratkan, *Github Action* (`.github/workflows/deploy.yml`) akan siap mengambil alih estafet CI/CD sehingga setiap Anda ketik `git push`, script `gas` beserta manifest Web App di Cloud Google selalu up-to-date.

---

> Didesain dan dikembangkan sebagai bagian dari inisiatif peningkatan sistem informasi presensi TAD area K3 - Samarinda.
