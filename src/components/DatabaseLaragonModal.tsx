import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Table, 
  History, 
  Key, 
  FileText, 
  ExternalLink,
  Cpu,
  Layers,
  Terminal
} from 'lucide-react';
import { 
  getDatabaseStatus, 
  getDataChangeLogs, 
  testMySqlConnection, 
  DatabaseStatusResponse, 
  DataChangeLog 
} from '../utils/database';
import { apiUrl } from '../utils/apiConfig';

interface DatabaseLaragonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (title: string, message: string) => void;
}

export const DatabaseLaragonModal: React.FC<DatabaseLaragonModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'tables' | 'login_logs' | 'changes' | 'guide'>('status');
  const [status, setStatus] = useState<DatabaseStatusResponse | null>(null);
  const [changes, setChanges] = useState<DataChangeLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [rawSql, setRawSql] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadData();
      loadSql();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, changesRes, logsRes] = await Promise.all([
        getDatabaseStatus(),
        getDataChangeLogs(),
        fetch(apiUrl('/api/auth/login-logs')).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      setStatus(statusRes);
      setChanges(changesRes);
      setLoginLogs(logsRes);
    } catch (e) {
      console.warn('Error loading DB modal info:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadSql = async () => {
    try {
      const res = await fetch(apiUrl('/api/database/schema-sql'));
      if (res.ok) {
        const text = await res.text();
        setRawSql(text);
      }
    } catch (e) {
      console.warn('Failed to load SQL schema:', e);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    const result = await testMySqlConnection();
    setTestingConnection(false);
    await loadData();

    if (result.success) {
      onSuccessToast('Koneksi MySQL Berhasil', result.message);
    } else {
      onSuccessToast('Info Koneksi MySQL Laragon', result.message);
    }
  };

  const handleCopySql = () => {
    if (!rawSql) return;
    navigator.clipboard.writeText(rawSql);
    setCopiedSql(true);
    onSuccessToast('SQL Berhasil Disalin', 'Skrip SQL Laragon disalin ke clipboard.');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    if (!rawSql) return;
    const blob = new Blob([rawSql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sim_sop_gtk_laragon.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onSuccessToast('File SQL Diunduh', 'sim_sop_gtk_laragon.sql siap diimpor ke HeidiSQL / phpMyAdmin Laragon.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Database MySQL Laragon & Express.js
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Node.js / Tanpa PHP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Penyimpanan Data Login, Naskah POS AP, dan Catatan Riwayat Perubahan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Status & Konfigurasi</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'tables'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Struktur Tabel MySQL</span>
          </button>

          <button
            onClick={() => setActiveTab('login_logs')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'login_logs'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Log Login MySQL ({loginLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('changes')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'changes'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Perubahan Data ({changes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Panduan Laragon (Impor SQL)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50 space-y-6">

          {/* TAB 1: STATUS & CONFIG */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Connection Status Banner */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                status?.mysqlConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start space-x-3">
                  {status?.mysqlConnected ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">
                      {status?.mysqlConnected 
                        ? 'MySQL Laragon Berhasil Terhubung (Aktif)' 
                        : 'Siap Terhubung ke MySQL Laragon (Port 3306)'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90">
                      {status?.mysqlConnected
                        ? `Backend Express.js tersambung langsung ke database "${status.config.database}" di ${status.config.host}:${status.config.port}`
                        : 'Aplikasi berjalan dengan backend Express.js. Saat Anda menjalankan Laragon di PC lokal, database "sim_sop_gtk" langsung tersinkronisasi otomatis tanpa perubahan kode.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-blue-600' : ''}`} />
                    <span>{testingConnection ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </button>
                </div>
              </div>

              {/* Backend & Architecture Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-1">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>Framework Backend</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    Express.js (Node.js)
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    ✓ Murni JavaScript, Tanpa PHP
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-1">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span>Database Target</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    MySQL Laragon
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Database: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">sim_sop_gtk</code>
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-1">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>Driver Database</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    mysql2/promise
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Host: localhost:3306 (user: root)
                  </p>
                </div>
              </div>

              {/* Tables Overview */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                  <span>Daftar Tabel Terstruktur di MySQL Laragon</span>
                  <span className="text-[11px] font-normal text-slate-400">Total: 3 Tabel</span>
                </h4>
                
                <div className="divide-y divide-slate-100">
                  {status?.tables.map((t) => (
                    <div key={t.name} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <code className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {t.name}
                          </code>
                          <span className="text-slate-600 font-medium">{t.description}</span>
                        </div>
                      </div>
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {t.recordCount} Baris Data
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={handleDownloadSql}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh sim_sop_gtk_laragon.sql</span>
                </button>

                <button
                  onClick={handleCopySql}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TABLES STRUCTURE */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                <p className="font-semibold">
                  Skema Basis Data MySQL Laragon (<code className="font-mono">sim_sop_gtk</code>)
                </p>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Dikelola dan diakses sepenuhnya melalui framework JavaScript Express.js (Node.js) tanpa ketergantungan PHP.
                </p>
              </div>

              {/* Table 1: users */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-bold text-xs">Tabel 1: users</span>
                    <span className="text-[11px] text-slate-400">(Kredensial Login & Akun Pengguna)</span>
                  </div>
                </div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Kolom</th>
                        <th className="px-3 py-2">Tipe Data</th>
                        <th className="px-3 py-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">id</td>
                        <td className="px-3 py-1.5 font-mono">INT AUTO_INCREMENT PRIMARY KEY</td>
                        <td className="px-3 py-1.5">ID unik akun pengguna</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">email</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(191) UNIQUE NOT NULL</td>
                        <td className="px-3 py-1.5">Alamat email resmi GTK (kredensial login)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">password</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(255) NOT NULL</td>
                        <td className="px-3 py-1.5">Kata sandi akun pengguna</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">full_name</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(255) NOT NULL</td>
                        <td className="px-3 py-1.5">Nama lengkap beserta gelar kedinasan</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">nip</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(64) DEFAULT '-'</td>
                        <td className="px-3 py-1.5">Nomor Induk Pegawai (NIP 18 Digit)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">role_title</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(255)</td>
                        <td className="px-3 py-1.5">Jabatan / Peran hak akses SIM-SOP</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: sop_documents */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-bold text-xs">Tabel 2: sop_documents</span>
                    <span className="text-[11px] text-slate-400">(Naskah Resmi POS AP Format KemenPAN-RB No. 35/2012)</span>
                  </div>
                </div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Kolom</th>
                        <th className="px-3 py-2">Tipe Data</th>
                        <th className="px-3 py-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">id</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(100) PRIMARY KEY</td>
                        <td className="px-3 py-1.5">Identifier dokumen SOP</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">nomor_pos</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(100) NOT NULL</td>
                        <td className="px-3 py-1.5">Nomor Surat Keputusan POS AP resmi</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">nama_pos</td>
                        <td className="px-3 py-1.5 font-mono">TEXT NOT NULL</td>
                        <td className="px-3 py-1.5">Judul naskah POS AP</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">instansi, unit_kerja</td>
                        <td className="px-3 py-1.5 font-mono">TEXT, VARCHAR(255)</td>
                        <td className="px-3 py-1.5">Kementerian dan unit kerja GTK Gorontalo</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">disahkan_nama, disahkan_nip, disahkan_jabatan</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(255)</td>
                        <td className="px-3 py-1.5">Pejabat berwenang yang mengesahkan</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">dasar_hukum, kualifikasi_pelaksana, peralatan, dll</td>
                        <td className="px-3 py-1.5 font-mono">JSON NOT NULL</td>
                        <td className="px-3 py-1.5">Array butir-butir standar naskah dinas</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 3: data_changes */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold text-xs">Tabel 3: data_changes</span>
                    <span className="text-[11px] text-slate-400">(Audit Log Perubahan Data dalam Program)</span>
                  </div>
                </div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Kolom</th>
                        <th className="px-3 py-2">Tipe Data</th>
                        <th className="px-3 py-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">id</td>
                        <td className="px-3 py-1.5 font-mono">INT AUTO_INCREMENT PRIMARY KEY</td>
                        <td className="px-3 py-1.5">ID unik catatan riwayat</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">entity_type</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(50)</td>
                        <td className="px-3 py-1.5">Objek: 'AUTH', 'SOP_DOCUMENT', 'USER_ACCOUNT'</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">action_type</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(50)</td>
                        <td className="px-3 py-1.5">Aksi: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_SUCCESS'</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">user_email</td>
                        <td className="px-3 py-1.5 font-mono">VARCHAR(191)</td>
                        <td className="px-3 py-1.5">Operator yang melakukan perubahan data</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono text-blue-700">description</td>
                        <td className="px-3 py-1.5 font-mono">TEXT NOT NULL</td>
                        <td className="px-3 py-1.5">Rincian deskripsi perubahan</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LOGIN LOGS MYSQL */}
          {activeTab === 'login_logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800">Catatan Log Autentikasi & Akses Masuk MySQL</span>
                  <p className="text-[11px] text-slate-500">
                    Setiap aktivasi kata sandi, keberhasilan login, percobaan gagal, dan logout tersimpan persisten pada tabel <code className="font-mono text-blue-600">login_logs</code>.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Muat Ulang</span>
                </button>
              </div>

              {loginLogs.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                  Belum ada log aktivitas login di MySQL.
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {loginLogs.map((log) => {
                    const isSuccess = log.status === 'SUCCESS';
                    const isRegister = log.status === 'REGISTER_PASSWORD';
                    const isLogout = log.status === 'LOGOUT';
                    const isFailed = log.status.startsWith('FAILED') || log.status.includes('DENIED');

                    return (
                      <div 
                        key={log.id} 
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess ? 'bg-emerald-100 text-emerald-800' :
                              isRegister ? 'bg-teal-100 text-teal-800' :
                              isLogout ? 'bg-slate-100 text-slate-700' :
                              isFailed ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {log.status}
                            </span>
                            <span className="text-slate-800 font-medium">{log.message}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                            <span>Akun: <strong className="text-slate-700">{log.userEmail}</strong></span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">IP: {log.ipAddress || '127.0.0.1'}</span>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 self-end sm:self-center shrink-0">
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DATA CHANGES LOGS */}
          {activeTab === 'changes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800">Catatan Audit Log Perubahan Data</span>
                  <p className="text-[11px] text-slate-500">
                    Setiap penambahan, pengeditan, atau penghapusan naskah dan akun disimpan ke tabel <code className="font-mono text-blue-600">data_changes</code>.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Muat Ulang</span>
                </button>
              </div>

              {changes.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                  Belum ada log perubahan data yang tercatat.
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {changes.map((log) => {
                    const isCreate = log.actionType.includes('CREATE');
                    const isUpdate = log.actionType.includes('UPDATE');
                    const isDelete = log.actionType.includes('DELETE');
                    const isLogin = log.actionType.includes('LOGIN');

                    return (
                      <div 
                        key={log.id} 
                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCreate ? 'bg-emerald-100 text-emerald-800' :
                              isUpdate ? 'bg-blue-100 text-blue-800' :
                              isDelete ? 'bg-rose-100 text-rose-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {log.actionType}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">[{log.entityType}]</span>
                            <span className="text-slate-800 font-medium">{log.description}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Operator: <span className="font-semibold text-slate-700">{log.userEmail}</span>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 self-end sm:self-center shrink-0">
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LARAGON SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>Langkah Cepat Menghubungkan ke Laragon di PC Lokal</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Aplikasi ini menggunakan backend <strong className="text-white">JavaScript / Express.js</strong> dan tidak memerlukan PHP sama sekali. Ikuti langkah di bawah ini untuk koneksi langsung ke MySQL Laragon:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h5 className="font-bold text-slate-900">Nyalakan MySQL di Laragon</h5>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Buka aplikasi <strong>Laragon</strong> di komputer Anda, lalu klik tombol <strong>"Start All"</strong> (pastikan modul MySQL aktif pada port default 3306).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h5 className="font-bold text-slate-900">Impor Database sim_sop_gtk</h5>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Klik tombol <strong>"Database" (HeidiSQL)</strong> di Laragon, lalu buka file <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600">sim_sop_gtk_laragon.sql</code> atau jalankan skrip SQL yang telah disediakan.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <h5 className="font-bold text-slate-900">Jalankan Server Express.js</h5>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Buka terminal di folder proyek ini lalu ketik:
                    <br />
                    <code className="block bg-slate-900 text-emerald-400 p-2 rounded mt-1 font-mono text-[11px]">
                      npm run dev
                    </code>
                    Backend Express akan otomatis menghubungkan port 3000 ke MySQL Laragon port 3306.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <h5 className="font-bold text-slate-900">Data Tersimpan Otomatis</h5>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Setiap penambahan naskah POS AP, edit naskah, ganti kata sandi, maupun akun login baru langsung tercatat secara permanen di tabel MySQL Laragon.
                  </p>
                </div>
              </div>

              {/* SQL Viewer */}
              <div className="bg-slate-900 rounded-xl p-4 text-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">sim_sop_gtk_laragon.sql</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopySql}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {copiedSql ? 'Tersalin' : 'Salin Semua'}
                    </button>
                    <button
                      onClick={handleDownloadSql}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Unduh .SQL
                    </button>
                  </div>
                </div>
                <pre className="font-mono text-[11px] bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-48 text-emerald-400">
                  {rawSql || '-- Memuat skrip SQL...'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Express.js Backend REST API Aktif di Port 3000</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
