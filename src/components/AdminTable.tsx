import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaDownload, FaSyncAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { fetchPresensi, deletePresensi, updatePresensi } from '../utils/api';
import { STATUS_KEHADIRAN } from '../utils/data';

export default function AdminTable() {
  const formatTime = (timeStr: any) => {
    if (!timeStr) return '-';
    if (typeof timeStr === 'string' && timeStr.includes('T') && timeStr.startsWith('1899')) {
      try {
        const d = new Date(timeStr);
        return d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar' });
      } catch {
        return timeStr;
      }
    }
    return timeStr;
  };

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEdit = (item: any) => {
    setEditingRow(item.rowId);
    setEditForm({ ...item, jamMasuk: formatTime(item.jamMasuk), jamPulang: formatTime(item.jamPulang) });
  };

  const handleDelete = async (rowId: number) => {
    if (!window.confirm("Yakin ingin menghapus data presensi ini?")) return;
    try {
      await deletePresensi(rowId);
      loadData();
    } catch (e) {
      alert("Gagal menghapus data");
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await updatePresensi(editingRow!, editForm);
      setEditingRow(null);
      loadData();
    } catch (e) {
      alert("Gagal memperbarui data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    
    doc.text("Laporan Presensi TAD Balai K3 Samarinda", 14, 15);
    
    const tableColumn = ["Nama", "NIK", "Waktu Masuk", "Waktu Pulang", "Status"];
    const tableRows = data.map(item => [
      item.nama,
      item.nik,
      formatTime(item.jamMasuk),
      formatTime(item.jamPulang),
      item.status
    ]);

    autoTable(doc, {
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
              <th className="px-4 py-3 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Memuat data...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">Belum ada data presensi.</td>
              </tr>
            ) : data.map((item, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{item.nama}</div>
                  <div className="text-xs text-gray-500">{item.nik}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatTime(item.jamMasuk)}</td>
                <td className="px-4 py-3">
                  {item.fotoMasuk ? (
                    <a href={item.fotoMasuk} target="_blank" rel="noreferrer" className="text-k3-blue hover:underline text-xs">Lihat Foto</a>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-gray-600">{formatTime(item.jamPulang)}</td>
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
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(item.rowId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Data Presensi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama</label>
                <input 
                  type="text" 
                  value={editForm.nama || ''} 
                  onChange={e => setEditForm({...editForm, nama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-k3-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Waktu Masuk</label>
                  <input 
                    type="text" 
                    value={editForm.jamMasuk || ''} 
                    onChange={e => setEditForm({...editForm, jamMasuk: e.target.value})}
                    placeholder="Contoh: 08:00:00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-k3-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Waktu Pulang</label>
                  <input 
                    type="text" 
                    value={editForm.jamPulang || ''} 
                    onChange={e => setEditForm({...editForm, jamPulang: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-k3-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select 
                  value={editForm.status || ''} 
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-k3-blue"
                >
                  {STATUS_KEHADIRAN.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Aktivitas</label>
                <textarea 
                  value={editForm.aktivitas || ''} 
                  onChange={e => setEditForm({...editForm, aktivitas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-k3-blue resize-none h-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-k3-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
