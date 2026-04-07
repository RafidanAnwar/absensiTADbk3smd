export interface Pegawai {
  nama: string;
  nik: string;
  jabatan: string;
}

export const DATA_PEGAWAI: Pegawai[] = [
  { nama: "Devi Aprilianti, S.E", nik: "6472056704910001", jabatan: "Pramu Bakti" },
  { nama: "Hemrin,S.Pd", nik: "7404310104950001", jabatan: "Pramu Bakti" },
  { nama: "Nur Ratnadilla Suharto Putri,S.H", nik: "6472064311970002", jabatan: "Pramu Bakti" },
  { nama: "Siti Napsiah", nik: "6472054908700004", jabatan: "Petugas Kebersihan" },
  { nama: "Gina Sahiya", nik: "6472066307050005", jabatan: "Petugas Kebersihan" },
  { nama: "Muhammad Alif", nik: "6472080705000001", jabatan: "Petugas Kebersihan" },
  { nama: "Basuki Rahmat", nik: "6472050101740016", jabatan: "Petugas Kebersihan" },
  { nama: "Muhammad Husaini", nik: "6472020802870004", jabatan: "Petugas Keamanan" },
  { nama: "Suyanto", nik: "3522090110730031", jabatan: "Petugas Keamanan" },
  { nama: "Ihsan", nik: "6472042710920005", jabatan: "Petugas Keamanan" },
  { nama: "Muhammad Sofyan", nik: "6472022905880002", jabatan: "Petugas Keamanan" },
  { nama: "Dimas Adetya Saputra", nik: "6472021707000004", jabatan: "Petugas Keamanan" }
];

export const STATUS_KEHADIRAN = [
  "Hadir",
  "Izin", 
  "Tugas Belajar", 
  "Lembur", 
  "Tidak Presensi", 
  "Cuti", 
  "Upacara Bendera", 
  "Dinas Keluar", 
  "WFO", 
  "Diklat", 
  "WFA", 
  "WFH"
];
