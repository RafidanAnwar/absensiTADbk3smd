import { useState, useEffect } from 'react';
import { FaDownload, FaSyncAlt, FaEdit, FaTrash, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  
  // Monthly Filter States
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Generate years (current year down to 2024 or -5 years)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
    import('../utils/pdfExport').then(({ generateRekapPDF }) => {
      // Panggil utility logikanya dengan data yang sudah di-filter (kecuali status & search jika ingin rekap murni bulanan)
      // Namun biasanya rekap bulanan berarti semua data di bulan tersebut
      
      // Kita gunakan data yang sudah di-filter berdasarkan bulan & tahun saja untuk rekap murni
      const monthlyData = data.filter(item => {
        if (!item.tanggal || typeof item.tanggal !== 'string') return false;
        const [y, m] = item.tanggal.split('-').map(Number);
        return (m - 1) === selectedMonth && y === selectedYear;
      });

      const periodStr = `Periode: ${months[selectedMonth]} ${selectedYear}`;
      generateRekapPDF(monthlyData, periodStr);
    });
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage, selectedMonth, selectedYear]);

  // Derived state for filtering and pagination
  const filteredData = data.filter(item => {
    const matchesSearch = item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.nik?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;
    
    // Monthly Filter Logic
    let matchesDate = true;
    if (item.tanggal && typeof item.tanggal === 'string') {
      const [y, m] = item.tanggal.split('-').map(Number);
      matchesDate = (m - 1) === selectedMonth && y === selectedYear;
    } else {
      matchesDate = false; // Hide if no date
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="font-bold text-gray-700">Data Presensi</h2>
          <p className="text-xs text-gray-500">{months[selectedMonth]} {selectedYear}</p>
        </div>
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

      {/* Filter and Control Bar */}
      <div className="p-4 border-b border-gray-100 bg-white flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          {/* Monthly Filter Area */}
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="flex-1 md:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-k3-blue focus:border-k3-blue outline-none text-sm bg-white text-gray-700 cursor-pointer"
            >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-k3-blue focus:border-k3-blue outline-none text-sm bg-white text-gray-700 cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="h-4 md:h-8 w-[1px] bg-gray-200 hidden md:block"></div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-k3-blue focus:border-k3-blue outline-none text-sm transition-all text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-k3-blue focus:border-k3-blue outline-none text-sm appearance-none bg-white text-gray-700 cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              {STATUS_KEHADIRAN.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Tampilkan:</span>
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-k3-blue focus:ring-2 focus:ring-k3-blue/20 bg-white cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
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
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">Data tidak ditemukan dengan filter tersebut.</td>
              </tr>
            ) : paginatedData.map((item, i) => (
              <tr key={item.rowId || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
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

      {/* Pagination Footer */}
      {!loading && filteredData.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Menampilkan data <span className="font-medium text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium text-gray-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari total <span className="font-medium text-gray-700">{filteredData.length}</span> entri
          </div>
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <FaChevronLeft size={14} />
            </button>
            
            {/* Simplified Page numbers untuk UI ringkas */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Menampilkan halaman dengan format 1 2 3 ... 10 untuk UX optimal jika halaman banyak
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page 
                        ? 'bg-k3-blue text-white border border-k3-blue shadow-sm' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 py-1.5 text-gray-400">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

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
