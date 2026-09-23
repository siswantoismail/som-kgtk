import React from 'react';
import { 
  Shield, 
  Check, 
  X, 
  UserCheck, 
  Lock, 
  Key, 
  Users, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser
}) => {
  if (!isOpen) return null;

  const permissionsMatrix = [
    {
      feature: 'Melihat Dasbor & Visualisasi Kinerja',
      roles: ['kepala_kantor', 'super_admin', 'verifikator', 'operator', 'auditor']
    },
    {
      feature: 'Mencetak Naskah Resmi POS AP (PDF/Excel)',
      roles: ['kepala_kantor', 'super_admin', 'verifikator', 'operator', 'auditor']
    },
    {
      feature: 'Pengesahan & Tanda Tangan Elektronik POS AP',
      roles: ['kepala_kantor']
    },
    {
      feature: 'Tambah & Ubah Data Kinerja Pemetaan',
      roles: ['super_admin', 'verifikator', 'operator']
    },
    {
      feature: 'Hapus Entri Data Kegiatan (Permanen)',
      roles: ['super_admin']
    },
    {
      feature: 'Ubah Naskah Dasar Hukum & Peralatan POS',
      roles: ['kepala_kantor', 'super_admin']
    },
    {
      feature: 'Kirim Notifikasi Email & Atur Ambang Batas',
      roles: ['kepala_kantor', 'super_admin', 'verifikator']
    },
    {
      feature: 'Kelola Integrasi API & Regenerasi Token',
      roles: ['super_admin']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Manajemen Autentikasi & Hak Akses Berbasis Peran (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Keamanan akses data sistem SIM-SOP GTK Provinsi Gorontalo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl ${currentUser.avatarColor} text-white flex items-center justify-center text-lg font-bold shadow-xs`}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 uppercase">
                  Sesi Aktif
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{currentUser.roleTitle}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                NIP: {currentUser.nip} • {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-3 py-1 rounded-full flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Autentikasi Terverifikasi
            </span>
          </div>
        </div>

        {/* Role Switcher Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Simulasi Pilihan Akun / Ganti Pengguna :
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allUsers.map((u) => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`w-6 h-6 rounded-full ${u.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                      {u.name.charAt(0)}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {u.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {u.roleTitle.split('(')[0]}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                    {u.email}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions Matrix Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Matriks Hak Akses & Kewenangan (Role Permissions) :
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Fungsi / Modul Sistem</th>
                  <th className="py-2.5 px-2 text-center">Kepala Kantor</th>
                  <th className="py-2.5 px-2 text-center">Super Admin</th>
                  <th className="py-2.5 px-2 text-center">Verifikator</th>
                  <th className="py-2.5 px-2 text-center">Operator</th>
                  <th className="py-2.5 px-2 text-center">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {item.feature}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.roles.includes('kepala_kantor') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.roles.includes('super_admin') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.roles.includes('verifikator') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.roles.includes('operator') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.roles.includes('auditor') ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
