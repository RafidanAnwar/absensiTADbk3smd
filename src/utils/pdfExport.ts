import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipe data rekapitulasi per pegawai
interface RekapPresensi {
  nama: string;
  nik: string;
  wfo: number;
  wfh: number;
  dinasKeluar: number;
  upacaraBendera: number;
  total: number;
}

/**
 * Utility function untuk mengekspor rekapan presensi ke file PDF.
 * @param rawData Array of objects dari API (log presensi harian)
 * @param periodeStr String sub-judul periode (opsional)
 */
export const generateRekapPDF = (rawData: any[], periodeStr: string = 'Periode: Keseluruhan (Real-time)') => {
  // 1. Grouping dan Kalkulasi Data
  const rekapMap = new Map<string, RekapPresensi>();

  rawData.forEach(item => {
    // Gunakan nik sebagai key, fallback ke nama jika tidak memiliki NIK
    const key = item.nik || item.nama;
    if (!key) return;

    if (!rekapMap.has(key)) {
      rekapMap.set(key, {
        nama: item.nama || '-',
        nik: item.nik || '-',
        wfo: 0,
        wfh: 0,
        dinasKeluar: 0,
        upacaraBendera: 0,
        total: 0
      });
    }

    const rekap = rekapMap.get(key)!;
    
    // Normalisasi string status (huruf kecil) untuk pengecekan aman
    const status = (item.status || '').toLowerCase();

    // Hitung kemunculan masing-masing status
    if (status.includes('wfo') || status.includes('hadir')) {
      rekap.wfo += 1;
    } else if (status.includes('wfh')) {
      rekap.wfh += 1;
    } else if (status.includes('dinas keluar')) {
      rekap.dinasKeluar += 1;
    } else if (status.includes('upacara bendera')) {
      rekap.upacaraBendera += 1;
    }
    // Jika ada tipe lain yang tidak dihitung sebagai "Hadir", bisa diabaikan atau disesuaikan
  });

  // Konversi Map ke Array dan hitung Total Kehadiran
  const rekapArray: RekapPresensi[] = Array.from(rekapMap.values()).map(r => ({
    ...r,
    total: r.wfo + r.wfh + r.dinasKeluar + r.upacaraBendera
  }));

  // Urutkan alfabetis berdasarkan Nama Pegawai
  rekapArray.sort((a, b) => a.nama.localeCompare(b.nama));

  // 2. Setup jsPDF Document (Portrait, A4)
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Header Dokumen
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 30, 40); // Dark grayish blue
  doc.text('LAPORAN REKAPITULASI PRESENSI PEGAWAI', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // Sub-judul / Periode
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(periodeStr, doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });

  // Waktu Cetak
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const printTimeStr = `Waktu Cetak: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`;
  doc.text(printTimeStr, 14, 34);

  // 3. Mapping struktur data array-of-arrays untuk AutoTable
  const tableData = rekapArray.map((item, index) => [
    index + 1,
    `${item.nama}\nNIK: ${item.nik}`, // NIK akan langsung tercetak di bawah Nama
    item.wfo,
    item.wfh,
    item.dinasKeluar,
    item.upacaraBendera,
    item.total
  ]);

  // 4. Render Table dengan AutoTable
  autoTable(doc, {
    startY: 38,
    head: [['No', 'Nama Pegawai', 'WFO', 'WFH', 'Dinas\nKeluar', 'Upacara\nBendera', 'Total\nHadir']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [10, 50, 100], // Biru solid profesional (Navy/K3-Blue tone)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 }, // Kolom No
      1: { cellWidth: 60, fontStyle: 'bold' }, // Kolom Nama (Nama bold opsional, by default regular bila string newline jalan)
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 25 },
      6: { halign: 'center', cellWidth: 25, fontStyle: 'bold', textColor: [10, 50, 100] } // Total dengan warna bold
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    // Margin yang baik untuk auto-pagination
    margin: { top: 38, bottom: 25 },
    // Menambahkan penomoran halaman di bawah (didDrawPage dipanggil setiap ada rendering page baru)
    didDrawPage: function (data) {
      const pageCount = (doc.internal as any).getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });

  // 5. Export / Simpan File PDF
  const cleanPeriode = periodeStr.replace('Periode: ', '').replace(/\s+/g, '_');
  const filename = `Rekap_Presensi_${cleanPeriode}.pdf`;
  doc.save(filename);
};
