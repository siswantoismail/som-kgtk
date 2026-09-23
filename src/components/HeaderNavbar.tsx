import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Download, 
  Menu, 
  X,
  ChevronDown,
  Layers,
  GitCommit,
  LogOut,
  KeyRound
} from 'lucide-react';
import { UserProfile, SopDocument, BaganAlirStep } from '../types';
import { exportSopDocumentPdf, exportBaganAlirPdf } from '../utils/exportPdf';
import { INITIAL_BAGAN_ALIR_STEPS } from '../data/initialData';

interface HeaderNavbarProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  activeTab: 'sop' | 'bagan-alir';
  setActiveTab: (tab: 'sop' | 'bagan-alir') => void;
  sopDocument: SopDocument;
  baganAlirSteps?: BaganAlirStep[];
  onOpenRoleModal: () => void;
  onLogout?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  setActiveTab,
  sopDocument,
  baganAlirSteps = INITIAL_BAGAN_ALIR_STEPS,
  onOpenRoleModal,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleExportSopPdf = () => {
    exportSopDocumentPdf(sopDocument);
    setExportDropdownOpen(false);
  };

  const handleExportBaganAlirPdf = () => {
    exportBaganAlirPdf(baganAlirSteps, sopDocument);
    setExportDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      {/* Top Ministry Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            {/* Kemendikdasmen Emblem Badge */}
            <div className="w-6 h-6 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-[10px] shadow-xs">
              GTK
            </div>
            <div>
              <span className="font-bold tracking-wide uppercase text-amber-300">Kemendikdasmen</span>
              <span className="mx-2 text-blue-300 hidden sm:inline">|</span>
              <span className="text-slate-200 hidden md:inline">
                Ditjen GTK - Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="bg-blue-800/80 px-2 py-0.5 rounded text-blue-100 font-mono hidden sm:inline border border-blue-700/50">
              POS No: {sopDocument.nomorPos}
            </span>
            <div 
              className="flex items-center space-x-1.5 text-emerald-300 bg-blue-800/60 px-2 py-0.5 rounded border border-emerald-500/40 font-medium"
              title="Sistem Terhubung Aman ke Cloud MySQL Database"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px]">Cloud MySQL Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('sop')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  SIM-SOP GTK
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                  Gorontalo
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistem Informasi Manajemen Standar Operasional Prosedur AP
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              id="nav-tab-sop"
              onClick={() => setActiveTab('sop')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sop'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Naskah Resmi POS AP</span>
            </button>

            <button
              id="nav-tab-bagan-alir"
              onClick={() => setActiveTab('bagan-alir')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'bagan-alir'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Bagan Alir POS AP</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Export Dropdown (PDF Reports Only) */}
            <div className="relative">
              <button
                id="btn-export-dropdown"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
                title="Cetak Laporan Format PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak PDF</span>
                <span className="sm:hidden">PDF</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {exportDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800"
                  onMouseLeave={() => setExportDropdownOpen(false)}
                >
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Cetak Laporan Format PDF Resmi
                  </div>
                  
                  <button
                    id="btn-export-sop-pdf"
                    onClick={handleExportSopPdf}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Format POS AP Resmi (.PDF)</div>
                      <div className="text-[11px] text-slate-500">Persis naskah fisik lengkap logo & stempel</div>
                    </div>
                  </button>

                  <button
                    id="btn-export-bagan-alir-pdf"
                    onClick={handleExportBaganAlirPdf}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 border-t border-slate-100 cursor-pointer"
                  >
                    <GitCommit className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Bagan Alir POS AP (.PDF)</div>
                      <div className="text-[11px] text-slate-500">Langkah kegiatan, pelaksana &amp; mutu baku</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Logout button */}
            {onLogout && (
              <button
                id="btn-logout"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs sm:text-sm font-medium transition cursor-pointer"
                title="Keluar dari Aplikasi"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setActiveTab('sop');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'sop' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Naskah Resmi POS AP</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('bagan-alir');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'bagan-alir' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            <span>Bagan Alir POS AP</span>
          </button>

          {onLogout && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-2 pt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Aplikasi</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
