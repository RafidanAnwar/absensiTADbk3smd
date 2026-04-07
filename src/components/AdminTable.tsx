import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FaDownload, FaSyncAlt } from 'react-icons/fa';
import { fetchPresensi } from '../utils/api';

export default function AdminTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPresensi();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    
    doc.text("Laporan Presensi TAD Balai K3 Samarinda", 14, 15);
    
    const tableColumn = ["Nama", "NIK", "Waktu Masuk", "Waktu Pulang", "Status"];
    const tableRows = data.map(item => [
      item.nama,
      item.nik,
      item.jamMasuk || '-',
      item.jamPulang || '-',
      item.status
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`Laporan_Presensi_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-bold text-gray-700">Data Presensi Hari Ini</h2>
        <div className="flex gap-2">
          <button 
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-k3-blue text-white rounded-lg hover:bg-blue-800 text-sm transition-colors"
          >
            <FaDownload /> Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Nama Pegawai</th>
              <th className="px-4 py-3 font-medium">Jam Masuk</th>
              <th className="px-4 py-3 font-medium">Foto Masuk</th>
              <th className="px-4 py-3 font-medium">Jam Pulang</th>
              <th className="px-4 py-3 font-medium">Foto Pulang</th>
              <th className="px-4 py-3 font-medium">Status / Aktivitas</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Memuat data...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Belum ada data presensi.</td>
              </tr>
            ) : data.map((item, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{item.nama}</div>
                  <div className="text-xs text-gray-500">{item.nik}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{item.jamMasuk || '-'}</td>
                <td className="px-4 py-3">
                  {item.fotoMasuk ? (
                    <a href={item.fotoMasuk} target="_blank" rel="noreferrer" className="text-k3-blue hover:underline text-xs">Lihat Foto</a>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.jamPulang || '-'}</td>
                <td className="px-4 py-3">
                  {item.fotoPulang ? (
                    <a href={item.fotoPulang} target="_blank" rel="noreferrer" className="text-k3-blue hover:underline text-xs">Lihat Foto</a>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium mb-1">
                    {item.status}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]" title={item.aktivitas}>{item.aktivitas || '-'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
