import React, { useState } from 'react';
import { 
  Share2, 
  RefreshCw, 
  Database, 
  Key, 
  Code, 
  Check, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRightLeft, 
  ShieldCheck,
  Server,
  Zap
} from 'lucide-react';
import { ApiSyncLog, KinerjaPemetaanItem, SopDocument } from '../types';

interface ApiSyncModalProps {
  apiLogs: ApiSyncLog[];
  onTriggerSync: (sumber: ApiSyncLog['sumber'], arah: ApiSyncLog['arah']) => void;
  kinerjaItems: KinerjaPemetaanItem[];
  sopDocument: SopDocument;
}

export const ApiSyncModal: React.FC<ApiSyncModalProps> = ({
  apiLogs,
  onTriggerSync,
  kinerjaItems,
  sopDocument
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'pos' | 'kinerja' | 'sync' | 'webhook'>('kinerja');
  const [apiToken, setApiToken] = useState('simsop_gtk_gorontalo_live_93c68996e5924177');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewToken = () => {
    const randomHash = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 10);
    setApiToken(`simsop_gtk_gorontalo_${randomHash}`);
  };

  const handleRunSync = (sumber: ApiSyncLog['sumber'], arah: ApiSyncLog['arah']) => {
    setIsSyncing(sumber);
    setTimeout(() => {
      onTriggerSync(sumber, arah);
      setIsSyncing(null);
    }, 1200);
  };

  // Sample JSON payload for viewer
  const sampleJson = selectedEndpoint === 'pos' 
    ? {
        status: 'success',
        code: 200,
        data: {
          nomorPos: sopDocument.nomorPos,
          namaPos: sopDocument.namaPos,
          unitKerja: sopDocument.unitKerja,
          tanggalEfektif: sopDocument.tanggalEfektif,
          pengesah: sopDocument.disahkanOleh,
          totalDasarHukum: sopDocument.dasarHukum.length,
          kualifikasiPelaksana: sopDocument.kualifikasiPelaksana
        }
      }
    : selectedEndpoint === 'kinerja'
      ? {
          status: 'success',
          code: 200,
          totalRecords: kinerjaItems.length,
          timestamp: new Date().toISOString(),
          wilayah: 'Provinsi Gorontalo',
          items: kinerjaItems.slice(0, 3)
        }
      : selectedEndpoint === 'sync'
        ? {
            action: 'bi_directional_sync',
            targetServices: ['Dapodik Kemendikdasmen', 'SIMPKB GTK', 'PMM'],
            auth: 'Bearer simsop_gtk_gorontalo_...',
            status: 'synced_ok',
            lastBatchId: 'batch-gorontalo-2026-09-20'
          }
        : {
            event: 'TARGET_DEFICIT_TRIGGERED',
            severity: 'CRITICAL',
            threshold: '80%',
            wilayah: 'Kab. Pohuwato & Kab. Bone Bolango',
            webhookUrl: 'https://api.kemendikdasmen.go.id/v1/alerts/inbound',
            notifiedEmails: ['siswantoismail173@gmail.com']
          };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              REST API & Webhook Service
            </span>
            <span className="text-xs text-slate-500">
              Protokol Interoperabilitas Kemendikdasmen
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Integrasi API & Sinkronisasi Sistem Pihak Ketiga
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pertukaran data dua arah dengan Dapodik, SIMPKB, Platform Merdeka Mengajar (PMM), dan BKD Gorontalo.
          </p>
        </div>

        {/* Token Management Pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-3 text-xs">
          <Key className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="overflow-hidden">
            <span className="text-slate-400 block text-[10px]">API Bearer Token Aktif:</span>
            <span className="font-mono font-bold text-slate-800 truncate block max-w-[190px]">
              {apiToken}
            </span>
          </div>
          <button
            onClick={handleCopyToken}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors shrink-0"
            title="Salin Token"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4 Connected Third-Party Systems Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Service 1: Dapodik */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase">Dapodik Pusat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-1">
              Data Pokok GTK
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Sinkronisasi master data guru, NUPTK, dan kepegawaian sekolah.
            </p>
          </div>
          <button
            disabled={isSyncing === 'Dapodik Kemendikdasmen'}
            onClick={() => handleRunSync('Dapodik Kemendikdasmen', 'Tarik Data (Inbound)')}
            className="mt-4 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'Dapodik Kemendikdasmen' ? 'animate-spin' : ''}`} />
            <span>{isSyncing === 'Dapodik Kemendikdasmen' ? 'Menyinkronkan...' : 'Sinkronkan Dapodik'}</span>
          </button>
        </div>

        {/* Service 2: SIMPKB GTK */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase">SIMPKB GTK</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-1">
              Asesmen & Pelatihan
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Tarik data hasil tes pemetaan kompetensi pedagogik & profesional.
            </p>
          </div>
          <button
            disabled={isSyncing === 'SIMPKB GTK'}
            onClick={() => handleRunSync('SIMPKB GTK', 'Tarik Data (Inbound)')}
            className="mt-4 w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'SIMPKB GTK' ? 'animate-spin' : ''}`} />
            <span>{isSyncing === 'SIMPKB GTK' ? 'Menyinkronkan...' : 'Sinkronkan SIMPKB'}</span>
          </button>
        </div>

        {/* Service 3: PMM */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase">PMM Merdeka</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-1">
              Platform Merdeka Mengajar
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Kirim laporan rekapitulasi capaian pemetaan ke dashboard PMM nasional.
            </p>
          </div>
          <button
            disabled={isSyncing === 'Platform Merdeka Mengajar (PMM)'}
            onClick={() => handleRunSync('Platform Merdeka Mengajar (PMM)', 'Kirim Laporan (Outbound)')}
            className="mt-4 w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'Platform Merdeka Mengajar (PMM)' ? 'animate-spin' : ''}`} />
            <span>{isSyncing === 'Platform Merdeka Mengajar (PMM)' ? 'Mengirim Data...' : 'Kirim Laporan PMM'}</span>
          </button>
        </div>

        {/* Service 4: BKD Gorontalo */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase">Pemprov Gorontalo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-1">
              BKD / SIMPEG Daerah
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Penyelarasan data ASN guru & kepala sekolah dengan database daerah.
            </p>
          </div>
          <button
            disabled={isSyncing === 'BKD Gorontalo'}
            onClick={() => handleRunSync('BKD Gorontalo', 'Kirim Laporan (Outbound)')}
            className="mt-4 w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'BKD Gorontalo' ? 'animate-spin' : ''}`} />
            <span>{isSyncing === 'BKD Gorontalo' ? 'Menyinkronkan...' : 'Sinkronkan BKD'}</span>
          </button>
        </div>
      </div>

      {/* Interactive API Explorer & Payload Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints List */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Endpoint REST API Publik
          </h3>
          <p className="text-xs text-slate-500">
            Pilih endpoint untuk melihat spesifikasi format JSON response.
          </p>

          <div className="space-y-2 pt-2">
            {[
              { id: 'kinerja', method: 'GET', path: '/api/v1/kinerja/pemetaan', desc: 'Data realisasi capaian per wilayah' },
              { id: 'pos', method: 'GET', path: '/api/v1/sop/pos-ap', desc: 'Naskah resmi SOP & aturan mutu' },
              { id: 'sync', method: 'POST', path: '/api/v1/kinerja/sync', desc: 'Inisiasi sinkronisasi dua arah' },
              { id: 'webhook', method: 'POST', path: '/api/v1/webhook/target-alert', desc: 'Webhook peringatan defisit capaian' },
            ].map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep.id as any)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedEndpoint === ep.id
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                    ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 text-[11px] truncate">
                    {ep.path}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{ep.desc}</p>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs">
            <button
              onClick={handleGenerateNewToken}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Regenerasi Token Akses Baru</span>
            </button>
          </div>
        </div>

        {/* Right Column: Code Payload Viewer */}
        <div className="lg:col-span-8 bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="font-mono text-slate-400 text-[11px] ml-2">Response JSON (HTTP 200 OK)</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-mono">application/json</span>
            </div>

            <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[340px] leading-relaxed mt-2">
              {JSON.stringify(sampleJson, null, 2)}
            </pre>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Authentication: Bearer {apiToken.slice(0, 16)}...</span>
            </span>
            <span>Latency: ~320ms</span>
          </div>
        </div>
      </div>

      {/* Sync Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
          Log Aktivitas Sinkronisasi Sistem Pihak Ketiga
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Waktu Eksekusi</th>
                <th className="py-2.5 px-3">Sistem Pihak Ketiga</th>
                <th className="py-2.5 px-3">Arah Aliran Data</th>
                <th className="py-2.5 px-3 text-right">Volume Data</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {log.sumber}
                  </td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1">
                      <ArrowRightLeft className="w-3 h-3 text-indigo-500 mr-1" />
                      <span>{log.arah}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    {log.jumlahData.toLocaleString('id-ID')} Berkas
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Sukses' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-[280px] truncate" title={log.keterangan}>
                    {log.keterangan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
