import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle, 
  Save, 
  UserPlus, 
  Trash2, 
  Users, 
  Database,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { 
  getAllStoredAccounts, 
  saveUserAccount, 
  validateEmail,
  validatePassword,
  UserAccount 
} from '../utils/authService';
import { 
  getAllUserAccounts, 
  saveUserAccountToDb, 
  deleteUserAccountFromDb 
} from '../utils/database';

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (title: string, message: string) => void;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const [activeTab, setActiveTab] = useState<'my-account' | 'all-accounts' | 'add-account'>('my-account');
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  
  // Edit Current Account state
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Account state
  const [newFullName, setNewFullName] = useState('');
  const [newNip, setNewNip] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('Pelaksana / Pengelola SOP AP');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    const list = await getAllUserAccounts();
    setAccounts(list);
    if (list.length > 0) {
      setEmail(list[0].email);
    }
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  // Real-time validations
  const emailValidation = validateEmail(email);
  const passValidation = newPassword ? validatePassword(newPassword) : { isValid: true };

  const handleSaveCurrentAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const currentAcc = accounts.find(a => a.email.toLowerCase() === email.toLowerCase()) || accounts[0];

    // Verify current password first
    if (currentPassword !== currentAcc.password) {
      setErrorMessage('Kata sandi saat ini tidak sesuai!');
      return;
    }

    // Validate email
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.errorMessage || 'Email tidak valid.');
      return;
    }

    // If changing password
    if (newPassword) {
      if (!passValidation.isValid) {
        setErrorMessage(passValidation.errorMessage || 'Kata sandi baru tidak memenuhi syarat.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi baru tidak cocok!');
        return;
      }
    }

    const updatedAccount: UserAccount = {
      ...currentAcc,
      email: email.trim().toLowerCase(),
      password: newPassword ? newPassword : currentAcc.password,
      updatedAt: new Date().toISOString()
    };

    await saveUserAccountToDb(updatedAccount);
    saveUserAccount(updatedAccount);
    await loadAccounts();

    onSuccessToast(
      'Kredensial Akun Diperbarui di Database', 
      'Email dan kata sandi login berhasil disimpan ke database lokal yang persisten.'
    );
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailVal = validateEmail(newEmail);
    if (!emailVal.isValid) {
      setErrorMessage(emailVal.errorMessage || 'Email pengguna baru tidak valid.');
      return;
    }

    const passVal = validatePassword(newPass);
    if (!passVal.isValid) {
      setErrorMessage(passVal.errorMessage || 'Kata sandi pengguna baru minimal 6 karakter.');
      return;
    }

    if (accounts.some(a => a.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setErrorMessage('Alamat email sudah terdaftar di database!');
      return;
    }

    const newAcc: UserAccount = {
      email: newEmail.trim().toLowerCase(),
      password: newPass,
      fullName: newFullName.trim() || 'Pegawai / Operator GTK',
      nip: newNip.trim() || '-',
      roleTitle: newRoleTitle.trim(),
      updatedAt: new Date().toISOString()
    };

    await saveUserAccountToDb(newAcc);
    await loadAccounts();
    onSuccessToast('Akun Pengguna Ditambahkan', `Akun ${newAcc.email} berhasil tersimpan di database.`);

    setNewFullName('');
    setNewNip('');
    setNewEmail('');
    setNewPass('');
    setActiveTab('all-accounts');
  };

  const handleDeleteAccount = async (targetEmail: string) => {
    if (accounts.length <= 1) {
      setErrorMessage('Tidak dapat menghapus akun satu-satunya yang tersisa di database!');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus akun ${targetEmail} dari database sistem?`)) {
      return;
    }

    const success = await deleteUserAccountFromDb(targetEmail);
    if (success) {
      await loadAccounts();
      onSuccessToast('Akun Dihapus', `Akun ${targetEmail} berhasil dihapus dari database.`);
    } else {
      setErrorMessage('Gagal menghapus akun pengguna.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-800/80 border border-blue-700">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Database Kredensial &amp; Akun Login
              </h3>
              <p className="text-xs text-blue-200">
                Kelola akun terdaftar (Tambah, Edit kata sandi, dan Hapus)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-3 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('my-account'); setErrorMessage(null); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'my-account' 
                ? 'border-blue-600 text-blue-700 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ubah Sandi Saya</span>
          </button>

          <button
            onClick={() => { setActiveTab('all-accounts'); setErrorMessage(null); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'all-accounts' 
                ? 'border-blue-600 text-blue-700 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Akun Database ({accounts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('add-account'); setErrorMessage(null); }}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'add-account' 
                ? 'border-blue-600 text-blue-700 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: UBAH SANDI / EDIT AKUN */}
          {activeTab === 'my-account' && (
            <form onSubmit={handleSaveCurrentAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Akun yang Diedit
                </label>
                <select
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.email} value={acc.email}>
                      {acc.fullName} ({acc.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Saat Ini (Verifikasi Keamanan)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Baru
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ulangi Kata Sandi Baru
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan ke Database</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DAFTAR AKUN DATABASE (BISA HAPUS & LIHAT) */}
          {activeTab === 'all-accounts' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Data seluruh akun pengguna yang tersimpan di dalam database sistem:
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {accounts.map((acc, index) => (
                  <div 
                    key={acc.email}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>{acc.fullName}</span>
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {acc.email} &bull; NIP: {acc.nip}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Jabatan: {acc.roleTitle}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {accounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc.email)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Hapus akun dari database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TAMBAH AKUN BARU KE DATABASE */}
          {activeTab === 'add-account' && (
            <form onSubmit={handleAddNewAccount} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Contoh: Drs. H. Ahmad, M.Pd."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Pegawai
                  </label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="198001012005011001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Peran
                </label>
                <input
                  type="text"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="Contoh: Pengelola Pemetaan Mutu GTK"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email Resmi (Untuk Login)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="pegawai.gtk@kemdikbud.go.id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambahkan Akun ke Database</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
