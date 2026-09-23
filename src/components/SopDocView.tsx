import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  Trash2,
  Undo,
  Database,
  Layers,
  Save,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { SopDocument, UserProfile } from '../types';
import { exportSopDocumentPdf } from '../utils/exportPdf';
import { getKemendikbudLogoDataUrl } from '../utils/documentAssets';
import { INITIAL_SOP_DOCUMENT } from '../data/initialData';
import { 
  getAllSopDocuments, 
  saveSopDocument, 
  createNewSopDocument, 
  deleteSopDocument, 
  resetSopDocumentToDefault 
} from '../utils/database';

interface SopDocViewProps {
  sop: SopDocument;
  onUpdateSop: (updatedSop: SopDocument) => void;
  currentUser: UserProfile;
}

export const SopDocView: React.FC<SopDocViewProps> = ({
  sop,
  onUpdateSop,
  currentUser
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSop, setEditedSop] = useState<SopDocument>(sop);
  const [allSopDocs, setAllSopDocs] = useState<SopDocument[]>([sop]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form input states for adding list items
  const [newDasarHukum, setNewDasarHukum] = useState('');
  const [newKualifikasi, setNewKualifikasi] = useState('');
  const [newKeterkaitan, setNewKeterkaitan] = useState('');
  const [newPeralatan, setNewPeralatan] = useState('');
  const [newPeringatan, setNewPeringatan] = useState('');
  const [newPencatatan, setNewPencatatan] = useState('');

  // Modal create new document
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newDocNomor, setNewDocNomor] = useState('');
  const [newDocNama, setNewDocNama] = useState('');

  useEffect(() => {
    loadDatabaseDocs();
  }, []);

  const loadDatabaseDocs = async () => {
    const docs = await getAllSopDocuments();
    setAllSopDocs(docs);
  };

  // Keep editedSop updated if outer sop updates
  useEffect(() => {
    setEditedSop(sop);
  }, [sop]);

  // Allow all logged-in roles to edit when needed
  const canEdit = true;

  const logoUrl = getKemendikbudLogoDataUrl();

  const handleSave = async () => {
    await saveSopDocument(editedSop);
    onUpdateSop(editedSop);
    setIsEditing(false);
    await loadDatabaseDocs();
    setSaveStatus('Data naskah tersimpan ke database!');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleCancel = () => {
    setEditedSop(sop);
    setIsEditing(false);
  };

  const handleResetToStandard = async () => {
    if (!window.confirm('Kembalikan naskah ini ke standar baku resmi awal?')) return;
    const restored = await resetSopDocumentToDefault(sop.id);
    setEditedSop(restored);
    onUpdateSop(restored);
    setIsEditing(false);
    await loadDatabaseDocs();
    setSaveStatus('Naskah berhasil di-reset ke standar baku.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleSwitchDocument = (docId: string) => {
    const selected = allSopDocs.find(d => d.id === docId);
    if (selected) {
      onUpdateSop(selected);
      setEditedSop(selected);
      setIsEditing(false);
    }
  };

  const handleCreateNewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocNama.trim()) return;

    const created = await createNewSopDocument({
      nomorPos: newDocNomor.trim() || undefined,
      namaPos: newDocNama.trim()
    });

    await loadDatabaseDocs();
    onUpdateSop(created);
    setEditedSop(created);
    setIsNewDocModalOpen(false);
    setNewDocNomor('');
    setNewDocNama('');
    setSaveStatus('Naskah POS AP baru berhasil ditambahkan ke database!');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleDeleteCurrentDocument = async () => {
    if (allSopDocs.length <= 1) {
      alert('Tidak dapat menghapus naskah satu-satunya dalam database.');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus naskah POS AP "${sop.namaPos}" (${sop.nomorPos}) dari database?`)) {
      return;
    }

    const success = await deleteSopDocument(sop.id);
    if (success) {
      const remaining = await getAllSopDocuments();
      setAllSopDocs(remaining);
      onUpdateSop(remaining[0]);
      setEditedSop(remaining[0]);
      setSaveStatus('Naskah berhasil dihapus dari database.');
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  // --- Dasar Hukum Handlers ---
  const handleAddDasarHukum = () => {
    if (!newDasarHukum.trim()) return;
    setEditedSop({
      ...editedSop,
      dasarHukum: [...editedSop.dasarHukum, newDasarHukum.trim()]
    });
    setNewDasarHukum('');
  };

  const handleRemoveDasarHukum = (index: number) => {
    setEditedSop({
      ...editedSop,
      dasarHukum: editedSop.dasarHukum.filter((_, i) => i !== index)
    });
  };

  // --- Kualifikasi Pelaksana Handlers ---
  const handleAddKualifikasi = () => {
    if (!newKualifikasi.trim()) return;
    setEditedSop({
      ...editedSop,
      kualifikasiPelaksana: [...editedSop.kualifikasiPelaksana, newKualifikasi.trim()]
    });
    setNewKualifikasi('');
  };

  const handleRemoveKualifikasi = (index: number) => {
    setEditedSop({
      ...editedSop,
      kualifikasiPelaksana: editedSop.kualifikasiPelaksana.filter((_, i) => i !== index)
    });
  };

  // --- Keterkaitan Handlers ---
  const handleAddKeterkaitan = () => {
    if (!newKeterkaitan.trim()) return;
    setEditedSop({
      ...editedSop,
      keterkaitan: [...editedSop.keterkaitan, newKeterkaitan.trim()]
    });
    setNewKeterkaitan('');
  };

  const handleRemoveKeterkaitan = (index: number) => {
    setEditedSop({
      ...editedSop,
      keterkaitan: editedSop.keterkaitan.filter((_, i) => i !== index)
    });
  };

  // --- Peralatan Handlers ---
  const handleAddPeralatan = () => {
    if (!newPeralatan.trim()) return;
    setEditedSop({
      ...editedSop,
      peralatan: [...editedSop.peralatan, newPeralatan.trim()]
    });
    setNewPeralatan('');
  };

  const handleRemovePeralatan = (index: number) => {
    setEditedSop({
      ...editedSop,
      peralatan: editedSop.peralatan.filter((_, i) => i !== index)
    });
  };

  // --- Peringatan Handlers ---
  const handleAddPeringatan = () => {
    if (!newPeringatan.trim()) return;
    setEditedSop({
      ...editedSop,
      peringatan: [...editedSop.peringatan, newPeringatan.trim()]
    });
    setNewPeringatan('');
  };

  const handleRemovePeringatan = (index: number) => {
    setEditedSop({
      ...editedSop,
      peringatan: editedSop.peringatan.filter((_, i) => i !== index)
    });
  };

  // --- Pencatatan dan Pendataan Handlers ---
  const handleAddPencatatan = () => {
    if (!newPencatatan.trim()) return;
    setEditedSop({
      ...editedSop,
      pencatatan: [...editedSop.pencatatan, newPencatatan.trim()]
    });
    setNewPencatatan('');
  };

  const handleRemovePencatatan = (index: number) => {
    setEditedSop({
      ...editedSop,
      pencatatan: editedSop.pencatatan.filter((_, i) => i !== index)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDoc = isEditing ? editedSop : sop;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Database Naskah POS AP</span>
              </span>
              <span className="text-xs font-medium text-slate-500">
                Format PermenPAN-RB No. 35/2012
              </span>
              {isEditing && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                  Mode Edit Aktif
                </span>
              )}
              {saveStatus && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{saveStatus}</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Naskah Resmi POS AP Pemetaan Kompetensi GTK
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing 
                ? 'Semua data yang ditambah, diedit, atau dihapus langsung disimpan ke database lokal yang persisten.'
                : 'Data naskah tersimpan di database. Anda dapat menambah, mengedit butir naskah, atau menghapus naskah.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && !isEditing && (
              <button
                id="btn-edit-sop"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Naskah</span>
              </button>
            )}

            {isEditing && (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-save-sop"
                  onClick={handleSave}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan ke Database</span>
                </button>
                <button
                  id="btn-cancel-sop"
                  onClick={handleCancel}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
                <button
                  id="btn-reset-sop"
                  onClick={handleResetToStandard}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  title="Kembalikan naskah ini ke standar baku resmi"
                >
                  <Undo className="w-3.5 h-3.5" />
                  <span>Reset Baku</span>
                </button>
              </div>
            )}

            <button
              id="btn-print-browser"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-colors cursor-pointer"
              title="Cetak langsung melalui dialog cetak browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Langsung</span>
            </button>

            <button
              id="btn-export-sop-pdf-page"
              onClick={() => exportSopDocumentPdf(currentDoc)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File PDF</span>
            </button>
          </div>
        </div>

        {/* Database Document Selector Bar (Tambah, Ganti, Hapus Naskah) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Pilih Naskah Database:</span>
            </span>
            <select
              value={sop.id}
              onChange={(e) => handleSwitchDocument(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {allSopDocs.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nomorPos} - {d.namaPos.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsNewDocModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Naskah Baru</span>
            </button>

            {allSopDocs.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteCurrentDocument}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                title="Hapus naskah ini dari database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Naskah Ini</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official POS AP Master Sheet */}
      <div className="overflow-x-auto pb-4">
        <div 
          id="printable-sop-document"
          className="bg-white border-2 border-black min-w-[960px] max-w-6xl mx-auto text-black font-sans shadow-sm print:border-black print:shadow-none print:m-0 print:w-full print:max-w-none print:min-w-0"
          style={{ fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif' }}
        >
          {/* HEADER SECTION: Exactly 2 Equal Columns (Left: Kop, Right: Table 6 Rows) */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            {/* Left Header Cell: Logo, Wordmark, and Hierarchy text */}
            <div className="p-3 sm:p-4 flex flex-col items-center justify-center text-center border-r-2 border-black bg-white">
              {/* Logo Tut Wuri Handayani & Wordmark Kemendikdasmen */}
              <div className="flex flex-col items-center justify-center mb-1">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Lambang Kemendikdasmen Tut Wuri Handayani" 
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-blue-900 bg-blue-50 flex items-center justify-center">
                    <span className="font-extrabold text-blue-950 text-[10px]">TUT WURI</span>
                  </div>
                )}
                
                {/* Official Kemendikdasmen Wordmark */}
                <div className="mt-1 flex items-baseline tracking-tight font-extrabold text-lg sm:text-xl">
                  <span className="text-[#0284c7]">Kemen</span>
                  <span className="text-[#f59e0b]">dikdasmen</span>
                </div>
              </div>

              {isEditing ? (
                <div className="w-full space-y-1.5 mt-1">
                  <textarea
                    rows={2}
                    value={editedSop.instansi}
                    onChange={(e) => setEditedSop({ ...editedSop, instansi: e.target.value })}
                    className="w-full text-center bg-blue-50/70 border border-blue-400 rounded p-1 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Instansi..."
                  />
                  <input
                    type="text"
                    value={editedSop.unitKerja}
                    onChange={(e) => setEditedSop({ ...editedSop, unitKerja: e.target.value })}
                    className="w-full text-center bg-blue-50/70 border border-blue-400 rounded p-1 text-[11px] font-bold text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Unit Kerja..."
                  />
                </div>
              ) : (
                <>
                  <div className="font-bold text-xs sm:text-[13px] tracking-tight text-black uppercase leading-tight whitespace-pre-line">
                    {currentDoc.instansi}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-black uppercase mt-1 leading-snug">
                    {currentDoc.unitKerja}
                  </div>
                </>
              )}
            </div>

            {/* Right Header Cell: Standard POS Metadata Table (6 Rows) */}
            <div className="flex flex-col bg-white">
              {/* Row 1: Nomor POS */}
              <div className="flex border-b border-black">
                <div className="w-36 sm:w-40 font-bold p-1 sm:p-1.5 border-r border-black text-[11px] flex items-center">
                  Nomor POS
                </div>
                <div className="flex-1 p-1 sm:p-1.5 text-[11px] font-bold flex items-center">
                  {isEditing ? (
                    <div className="flex items-center w-full space-x-1">
                      <span>:</span>
                      <input
                        type="text"
                        value={editedSop.nomorPos}
                        onChange={(e) => setEditedSop({ ...editedSop, nomorPos: e.target.value })}
                        className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] font-bold text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="0029/T/B7.33/OT.02.00/2026"
                      />
                    </div>
                  ) : (
                    <span>: {currentDoc.nomorPos}</span>
                  )}
                </div>
              </div>

              {/* Row 2: Tanggal Pembuatan */}
              <div className="flex border-b border-black">
                <div className="w-36 sm:w-40 font-bold p-1 sm:p-1.5 border-r border-black text-[11px] flex items-center">
                  Tanggal Pembuatan
                </div>
                <div className="flex-1 p-1 sm:p-1.5 text-[11px] flex items-center">
                  {isEditing ? (
                    <div className="flex items-center w-full space-x-1">
                      <span>:</span>
                      <input
                        type="text"
                        value={editedSop.tanggalPembuatan}
                        onChange={(e) => setEditedSop({ ...editedSop, tanggalPembuatan: e.target.value })}
                        className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="08 Februari 2026"
                      />
                    </div>
                  ) : (
                    <span>: {currentDoc.tanggalPembuatan}</span>
                  )}
                </div>
              </div>

              {/* Row 3: Tanggal Revisi */}
              <div className="flex border-b border-black">
                <div className="w-36 sm:w-40 font-bold p-1 sm:p-1.5 border-r border-black text-[11px] flex items-center">
                  Tanggal Revisi
                </div>
                <div className="flex-1 p-1 sm:p-1.5 text-[11px] flex items-center">
                  {isEditing ? (
                    <div className="flex items-center w-full space-x-1">
                      <span>:</span>
                      <input
                        type="text"
                        value={editedSop.tanggalRevisi}
                        onChange={(e) => setEditedSop({ ...editedSop, tanggalRevisi: e.target.value })}
                        className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="Kosongkan jika belum ada revisi"
                      />
                    </div>
                  ) : (
                    <span>: {currentDoc.tanggalRevisi || ''}</span>
                  )}
                </div>
              </div>

              {/* Row 4: Tanggal Efektif */}
              <div className="flex border-b border-black">
                <div className="w-36 sm:w-40 font-bold p-1 sm:p-1.5 border-r border-black text-[11px] flex items-center">
                  Tanggal Efektif
                </div>
                <div className="flex-1 p-1 sm:p-1.5 text-[11px] flex items-center">
                  {isEditing ? (
                    <div className="flex items-center w-full space-x-1">
                      <span>:</span>
                      <input
                        type="text"
                        value={editedSop.tanggalEfektif}
                        onChange={(e) => setEditedSop({ ...editedSop, tanggalEfektif: e.target.value })}
                        className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="08 Februari 2026"
                      />
                    </div>
                  ) : (
                    <span>: {currentDoc.tanggalEfektif}</span>
                  )}
                </div>
              </div>

              {/* Row 5: Disahkan Oleh */}
              <div className="flex border-b border-black flex-1 min-h-[92px]">
                <div className="w-36 sm:w-40 font-bold p-1 sm:p-1.5 border-r border-black text-[11px]">
                  Disahkan Oleh
                </div>
                <div className="flex-1 p-1 sm:p-1.5 text-[11px] flex flex-col justify-between relative">
                  <div>
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <span className="font-bold">:</span>
                        <input
                          type="text"
                          value={editedSop.disahkanOleh.jabatan}
                          onChange={(e) => setEditedSop({
                            ...editedSop,
                            disahkanOleh: { ...editedSop.disahkanOleh, jabatan: e.target.value }
                          })}
                          className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] font-bold text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                          placeholder="Jabatan Pengesah..."
                        />
                      </div>
                    ) : (
                      <span>: {currentDoc.disahkanOleh.jabatan}</span>
                    )}
                  </div>

                  {/* Spasi Tanda Tangan */}
                  <div className="h-10 my-1"></div>

                  {/* Nama & NIP */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-16 font-bold">Nama</span>
                      {isEditing ? (
                        <div className="flex items-center flex-1 space-x-1">
                          <span>:</span>
                          <input
                            type="text"
                            value={editedSop.disahkanOleh.nama}
                            onChange={(e) => setEditedSop({
                              ...editedSop,
                              disahkanOleh: { ...editedSop.disahkanOleh, nama: e.target.value }
                            })}
                            className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] font-bold text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                            placeholder="Nama Pejabat..."
                          />
                        </div>
                      ) : (
                        <span className="font-bold">: {currentDoc.disahkanOleh.nama}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 font-bold">NIP</span>
                      {isEditing ? (
                        <div className="flex items-center flex-1 space-x-1">
                          <span>:</span>
                          <input
                            type="text"
                            value={editedSop.disahkanOleh.nip}
                            onChange={(e) => setEditedSop({
                              ...editedSop,
                              disahkanOleh: { ...editedSop.disahkanOleh, nip: e.target.value }
                            })}
                            className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                            placeholder="NIP Pejabat..."
                          />
                        </div>
                      ) : (
                        <span>: {currentDoc.disahkanOleh.nip}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: Nama POS */}
              <div className="flex min-h-[50px]">
                <div className="w-36 sm:w-40 font-bold p-1 sm:p-1.5 border-r border-black text-[11px] flex items-center">
                  Nama POS
                </div>
                <div className="flex-1 p-1 sm:p-1.5 text-[11px] font-bold flex items-center">
                  {isEditing ? (
                    <div className="flex items-center w-full space-x-1">
                      <span>:</span>
                      <textarea
                        rows={2}
                        value={editedSop.namaPos}
                        onChange={(e) => setEditedSop({ ...editedSop, namaPos: e.target.value })}
                        className="flex-1 bg-blue-50/70 border border-blue-400 rounded px-1.5 py-0.5 text-[11px] font-bold text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
                        placeholder="Nama POS..."
                      />
                    </div>
                  ) : (
                    <span>: {currentDoc.namaPos}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BODY ROW 1: Dasar Hukum (Kiri) & Kualifikasi Pelaksana (Kanan) */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            {/* Dasar Hukum : */}
            <div className="p-2 sm:p-3 border-r-2 border-black bg-white flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs sm:text-[13px] text-black mb-1.5">
                  Dasar Hukum :
                </div>
                <ol className="text-[10px] sm:text-[11px] space-y-1 list-decimal list-outside pl-4 text-black leading-snug">
                  {currentDoc.dasarHukum.map((item, index) => (
                    <li key={index} className="group">
                      <div className="flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDasarHukum(index)}
                            className="text-rose-500 hover:text-rose-700 opacity-80 hover:opacity-100 shrink-0 ml-1 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus butir dasar hukum"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {isEditing && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newDasarHukum}
                    onChange={(e) => setNewDasarHukum(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDasarHukum()}
                    placeholder="Tambah butir dasar hukum..."
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDasarHukum}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              )}
            </div>

            {/* Kualifikasi Pelaksana : */}
            <div className="p-2 sm:p-3 bg-white flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs sm:text-[13px] text-black mb-1.5">
                  Kualifikasi Pelaksana :
                </div>
                <ol className="text-[10px] sm:text-[11px] space-y-1.5 list-decimal list-outside pl-4 text-black leading-snug">
                  {currentDoc.kualifikasiPelaksana.map((item, index) => (
                    <li key={index} className="group">
                      <div className="flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKualifikasi(index)}
                            className="text-rose-500 hover:text-rose-700 opacity-80 hover:opacity-100 shrink-0 ml-1 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus butir kualifikasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {isEditing && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newKualifikasi}
                    onChange={(e) => setNewKualifikasi(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKualifikasi()}
                    placeholder="Tambah butir kualifikasi pelaksana..."
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddKualifikasi}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BODY ROW 2: Keterkaitan (Kiri) & Peralatan/Perlengkapan (Kanan) */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            {/* Keterkaitan : */}
            <div className="p-2 sm:p-3 border-r-2 border-black bg-white flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs sm:text-[13px] text-black mb-1.5">
                  Keterkaitan :
                </div>
                <ol className="text-[10px] sm:text-[11px] space-y-1 list-decimal list-outside pl-4 text-black leading-snug">
                  {currentDoc.keterkaitan.map((item, index) => (
                    <li key={index} className="group">
                      <div className="flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKeterkaitan(index)}
                            className="text-rose-500 hover:text-rose-700 opacity-80 hover:opacity-100 shrink-0 ml-1 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus butir keterkaitan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {isEditing && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newKeterkaitan}
                    onChange={(e) => setNewKeterkaitan(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeterkaitan()}
                    placeholder="Tambah butir POS keterkaitan..."
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeterkaitan}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              )}
            </div>

            {/* Peralatan/Perlengkapan : */}
            <div className="p-2 sm:p-3 bg-white flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs sm:text-[13px] text-black mb-1.5">
                  Peralatan/Perlengkapan :
                </div>
                <ol className="text-[10px] sm:text-[11px] space-y-1 list-decimal list-outside pl-4 text-black leading-snug">
                  {currentDoc.peralatan.map((item, index) => (
                    <li key={index} className="group">
                      <div className="flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemovePeralatan(index)}
                            className="text-rose-500 hover:text-rose-700 opacity-80 hover:opacity-100 shrink-0 ml-1 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus peralatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {isEditing && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newPeralatan}
                    onChange={(e) => setNewPeralatan(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPeralatan()}
                    placeholder="Tambah peralatan/perlengkapan..."
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPeralatan}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BODY ROW 3: Peringatan (Kiri) & Pencatatan dan Pendataan (Kanan) */}
          <div className="grid grid-cols-2">
            {/* Peringatan : */}
            <div className="p-2 sm:p-3 border-r-2 border-black bg-white flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs sm:text-[13px] text-black mb-1.5">
                  Peringatan :
                </div>
                <ol className="text-[10px] sm:text-[11px] space-y-1 list-decimal list-outside pl-4 text-black leading-snug">
                  {currentDoc.peringatan.map((item, index) => (
                    <li key={index} className="group">
                      <div className="flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemovePeringatan(index)}
                            className="text-rose-500 hover:text-rose-700 opacity-80 hover:opacity-100 shrink-0 ml-1 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus butir peringatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {isEditing && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newPeringatan}
                    onChange={(e) => setNewPeringatan(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPeringatan()}
                    placeholder="Tambah butir peringatan..."
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPeringatan}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pencatatan dan Pendataan : */}
            <div className="p-2 sm:p-3 bg-white flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs sm:text-[13px] text-black mb-1.5">
                  Pencatatan dan Pendataan :
                </div>
                <ol className="text-[10px] sm:text-[11px] space-y-1 list-decimal list-outside pl-4 text-black leading-snug">
                  {currentDoc.pencatatan.map((item, index) => (
                    <li key={index} className="group">
                      <div className="flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemovePencatatan(index)}
                            className="text-rose-500 hover:text-rose-700 opacity-80 hover:opacity-100 shrink-0 ml-1 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus butir pencatatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {isEditing && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newPencatatan}
                    onChange={(e) => setNewPencatatan(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPencatatan()}
                    placeholder="Tambah butir pencatatan dan pendataan..."
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPencatatan}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Naskah POS Baru */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Tambah Naskah POS AP Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDocModalOpen(false)}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDocument} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor POS AP
                </label>
                <input
                  type="text"
                  value={newDocNomor}
                  onChange={(e) => setNewDocNomor(e.target.value)}
                  placeholder="Contoh: 0030/T/B7.33/OT.02.00/2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Kosongkan jika ingin nomor otomatis digenerate.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama / Judul POS AP
                </label>
                <textarea
                  rows={2}
                  value={newDocNama}
                  onChange={(e) => setNewDocNama(e.target.value)}
                  placeholder="Contoh: Pelaksanaan Pendampingan dan Advokasi GTK..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat &amp; Simpan ke Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
