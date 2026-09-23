import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Clock, 
  Phone, 
  MessageSquare, 
  Copy, 
  Check, 
  KeyRound, 
  ShieldAlert, 
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Ban,
  LifeBuoy,
  UserPlus,
  LogIn,
  BadgeCheck,
  UserCheck,
  Building,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { 
  performLoginAsync, 
  performLogin,
  checkCurrentLock, 
  validateEmail,
  validatePassword,
  DEVELOPER_CONTACT, 
  getStoredAccount, 
  resetLockState,
  DEFAULT_USER_ACCOUNT,
  checkEmailWhitelist,
  registerPasswordForAuthorizedEmail,
  getStoredAuthorizedEmails,
  fetchAuthorizedEmails,
  DEFAULT_AUTHORIZED_EMAILS
} from '../utils/authService';
import { AuthorizedEmail, WhitelistCheckResult } from '../types';
import { getKemendikbudLogoDataUrl } from '../utils/documentAssets';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Mode: 'login' (Masuk) atau 'register' (Daftar Kata Sandi)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form Fields - Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Form Fields - Pendaftaran Kata Sandi (Register)
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState<WhitelistCheckResult | null>(null);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);
  const [registerErrorMessage, setRegisterErrorMessage] = useState<string | null>(null);

  // Daftar email terotorisasi untuk referensi
  const [authorizedList, setAuthorizedList] = useState<AuthorizedEmail[]>([]);
  const [showWhitelistReference, setShowWhitelistReference] = useState(false);
  
  // State for errors & lockout
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isPermanentLock, setIsPermanentLock] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lockLevel, setLockLevel] = useState<0 | 1 | 2>(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const logoUrl = getKemendikbudLogoDataUrl();
  const currentAccount = getStoredAccount();

  // Load whitelist list on mount
  useEffect(() => {
    fetchAuthorizedEmails().then(data => {
      setAuthorizedList(data);
    }).catch(() => {
      setAuthorizedList(getStoredAuthorizedEmails());
    });
  }, []);

  // Check lock on initial mount and tick countdown
  useEffect(() => {
    const updateLock = () => {
      const lock = checkCurrentLock();
      setIsLocked(lock.isLocked);
      setIsPermanentLock(lock.isPermanentLock);
      setRemainingSeconds(lock.remainingSeconds);
      setLockLevel(lock.lockLevel);
      setFailedAttempts(lock.failedAttempts);

      if (!lock.isLocked && isLocked) {
        setErrorMessage(null);
      }
    };

    updateLock();
    const interval = setInterval(updateLock, 1000);
    return () => clearInterval(interval);
  }, [isLocked]);

  // Debounced auto-check whitelist when user enters email in registration tab
  useEffect(() => {
    if (activeTab !== 'register') return;
    const clean = regEmail.trim();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setWhitelistStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingWhitelist(true);
      const res = await checkEmailWhitelist(clean);
      setWhitelistStatus(res);
      setIsCheckingWhitelist(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [regEmail, activeTab]);

  // Validations
  const emailValidation = validateEmail(email);
  const passValidation = validatePassword(password);
  const regEmailValidation = validateEmail(regEmail);
  const regPassValidation = validatePassword(regPassword);
  const isPasswordsMatch = regPassword === regConfirmPassword && regPassword.length >= 6;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isPermanentLock || isSubmittingLogin) return;

    setErrorMessage(null);
    setIsSubmittingLogin(true);

    try {
      const result = await performLoginAsync(email, password);

      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.error || 'Terjadi kesalahan saat masuk.');
        if (result.isPermanentLock) {
          setIsPermanentLock(true);
          setIsLocked(true);
          setLockLevel(2);
        } else if (result.isLocked) {
          setIsLocked(true);
          setRemainingSeconds(result.remainingSeconds || 60);
          setLockLevel(1);
        }
        setFailedAttempts(result.failedAttempts || 0);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Tidak dapat terhubung ke database Cloud MySQL. Silakan coba lagi.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle Register Password Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterErrorMessage(null);
    setRegisterSuccessMessage(null);

    if (!whitelistStatus?.isAuthorized) {
      setRegisterErrorMessage('Akses Ditolak: Alamat email tidak memiliki izin akses dalam daftar whitelist SIM-SOP GTK Provinsi Gorontalo.');
      return;
    }

    if (!isPasswordsMatch) {
      setRegisterErrorMessage('Konfirmasi kata sandi tidak cocok atau panjang kurang dari 6 karakter.');
      return;
    }

    setIsSubmittingRegister(true);
    try {
      const result = await registerPasswordForAuthorizedEmail(regEmail, regPassword);
      if (result.success) {
        setRegisterSuccessMessage(result.message);
        // Update whitelist table status
        const updatedList = await fetchAuthorizedEmails();
        setAuthorizedList(updatedList);

        // Tunggu sejenak lalu alihkan langsung ke tab Login dengan kredensial terisi otomatis
        setTimeout(() => {
          setEmail(regEmail.trim().toLowerCase());
          setPassword(regPassword);
          setActiveTab('login');
          setRegisterSuccessMessage(null);
          setErrorMessage(null);
        }, 1600);
      } else {
        setRegisterErrorMessage(result.message || 'Gagal mendaftarkan kata sandi.');
      }
    } catch (err: any) {
      setRegisterErrorMessage(err.message || 'Terjadi kesalahan server saat mendaftarkan kata sandi.');
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  const handleSelectAuthorizedEmail = (selectedEmail: string) => {
    if (activeTab === 'register') {
      setRegEmail(selectedEmail);
    } else {
      setEmail(selectedEmail);
    }
  };

  const handleAutofillDefault = () => {
    setEmail(currentAccount.email);
    setPassword(currentAccount.password);
    setErrorMessage(null);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(DEVELOPER_CONTACT.phoneRaw);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 3000);
  };

  const handleResetLockEmergency = () => {
    resetLockState();
    setIsLocked(false);
    setIsPermanentLock(false);
    setRemainingSeconds(0);
    setLockLevel(0);
    setFailedAttempts(0);
    setErrorMessage(null);
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Layanan pengaduan developer HANYA tampil jika lockLevel === 2 / isPermanentLock
  const shouldShowHelpdesk = isPermanentLock || lockLevel === 2;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl z-10">
        {/* Header Branding Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Lambang Kemendikdasmen Tut Wuri Handayani" 
                className="w-16 h-16 object-contain drop-shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-800 border-2 border-amber-400 flex items-center justify-center text-white font-extrabold text-sm">
                GTK
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-center tracking-tight font-extrabold text-xl sm:text-2xl">
            <span className="text-[#38bdf8]">Kemen</span>
            <span className="text-[#f59e0b]">dikdasmen</span>
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1 tracking-tight">
            SIM-SOP GTK PROVINSI GORONTALO
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-0.5">
            Sistem Informasi Manajemen Standar Operasional Prosedur Administrasi Pemerintahan
          </p>

          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-600/50 text-[11px] text-blue-200 font-semibold shadow-inner">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistem Terproteksi Penuh &bull; Pembatasan Akses Email Terotorisasi</span>
          </div>
        </div>

        {/* Main Card with Tabs */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
          {/* Navigation Tabs: Masuk vs Daftar Akun */}
          <div className="flex border-b border-slate-200 bg-slate-100/80 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-blue-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>1. Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-blue-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>2. Daftar Akun (Aktivasi Sandi)</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* TAB 1: FORM LOGIN */}
            {activeTab === 'login' && (
              <>
                <div className="border-b border-slate-100 pb-3 mb-5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-blue-600" />
                    <span>Masuk ke Akun Terdaftar</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hanya email yang telah diizinkan dan telah mendaftarkan kata sandi yang dapat membuka sistem.
                  </p>
                </div>

                {/* Banner 1: Kunci Permanen */}
                {isPermanentLock && (
                  <div className="mb-5 p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-900 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0">
                        <Ban className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black uppercase tracking-wider text-rose-800">
                          Akses Ditolak &bull; Tidak Bisa Login Lagi
                        </div>
                        <div className="text-sm font-bold text-rose-950 mt-0.5 leading-snug">
                          Akun diblokir karena masih melakukan kesalahan setelah masa pembekuan 1 menit.
                        </div>
                        <p className="text-xs text-rose-700 mt-1.5 leading-relaxed">
                          Sistem telah menonaktifkan formulir login. Silakan gunakan <strong>Layanan Pengaduan Pengembang</strong> di bawah ini untuk pembukaan blokir akses.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner 2: Pembekuan Sementara 1 Menit */}
                {isLocked && !isPermanentLock && (
                  <div className="mb-5 p-4 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-sm animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                        <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                          Pembekuan Login Sementara (1 Menit)
                        </div>
                        <div className="text-sm font-bold text-amber-900 mt-0.5">
                          Salah memasukkan email/kata sandi sebanyak 3 kali!
                        </div>
                        <div className="text-xs text-amber-700 mt-1">
                          Silakan tunggu hingga hitung mundur berakhir:
                        </div>
                        <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-900 text-white font-mono text-base font-bold tracking-widest shadow-inner">
                          <span>{formatTime(remainingSeconds)}</span>
                        </div>
                        <div className="mt-2 text-[11px] font-semibold text-rose-700">
                          Peringatan: Jika masih salah 1 kali lagi setelah waktu ini, akun akan diblokir total dan tidak bisa lagi login.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner 3: Error Message Normal */}
                {errorMessage && !isLocked && !isPermanentLock && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start space-x-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold">Gagal Melakukan Login</div>
                      <div className="mt-0.5 leading-relaxed">{errorMessage}</div>
                      {errorMessage.includes('belum mendaftarkan kata sandi') && (
                        <button
                          type="button"
                          onClick={() => {
                            setRegEmail(email);
                            setActiveTab('register');
                            setErrorMessage(null);
                          }}
                          className="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-700 text-white font-bold text-[11px] hover:bg-blue-800 transition"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Daftarkan Kata Sandi Sekarang &rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Alamat Email Resmi Terdaftar
                      </label>
                      {email && emailValidation.isValid && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Email valid</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        disabled={isLocked || isPermanentLock || isSubmittingLogin}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="siswantoismail173@gmail.com / admin.gtk@kemdikbud.go.id"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Kata Sandi Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Kata Sandi
                      </label>
                      {password && passValidation.isValid && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sandi valid</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        disabled={isLocked || isPermanentLock || isSubmittingLogin}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi..."
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 tracking-wide"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Rules Brief */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                      <span>Aturan Keamanan Pembatasan Akses:</span>
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-0.5 leading-snug">
                      <li>Hanya alamat email yang telah ditentukan Administrator yang memiliki izin login.</li>
                      <li>Pengguna baru wajib mendaftarkan kata sandi terlebih dahulu di tab <strong>Daftar Akun</strong>.</li>
                      <li>Salah 3 kali berturut-turut &rarr; Dibekukan <strong>1 menit</strong>. Jika masih salah &rarr; <strong>Blokir Permanen</strong>.</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLocked || isPermanentLock || !email || !password || isSubmittingLogin}
                    className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2 ${
                      isPermanentLock
                        ? 'bg-rose-600 cursor-not-allowed opacity-70'
                        : isLocked
                        ? 'bg-amber-600 cursor-not-allowed opacity-75'
                        : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 shadow-blue-500/20 cursor-pointer disabled:opacity-50'
                    }`}
                  >
                    {isSubmittingLogin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Akun MySQL...</span>
                      </>
                    ) : isPermanentLock ? (
                      <>
                        <Ban className="w-4 h-4" />
                        <span>Akses Login Diblokir Total</span>
                      </>
                    ) : isLocked ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Dibekukan ({formatTime(remainingSeconds)})</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Masuk ke Aplikasi SIM-SOP</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Switch to Register tab prompt */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRegEmail(email);
                      setActiveTab('register');
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Belum mendaftarkan kata sandi?</span>
                    <span className="text-emerald-700 underline">Daftar / Aktivasi Sandi di sini &rarr;</span>
                  </button>
                </div>

                {/* Helper Card for Default Credentials */}
                {!isPermanentLock && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kredensial Bawaan Teruji</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAutofillDefault}
                        disabled={isLocked}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        Isi Otomatis
                      </button>
                    </div>
                    <div className="mt-2 bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 text-[11px] text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div>Email: <strong className="text-blue-900">{currentAccount.email}</strong></div>
                        <div>Kata Sandi: <strong className="text-blue-900">{currentAccount.password}</strong></div>
                      </div>
                      <span className="text-[10px] text-slate-500 italic">
                        (Tersimpan di MySQL users)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: PENDAFTARAN AKUN (AKTIVASI KATA SANDI UNTUK EMAIL TEROTORISASI) */}
            {activeTab === 'register' && (
              <>
                <div className="border-b border-slate-100 pb-3 mb-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <UserPlus className="w-5 h-5 text-emerald-600" />
                      <span>Pendaftaran Kata Sandi Pegawai</span>
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                      Whitelist Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Sistem dibatasi secara ketat. Masukkan email resmi yang telah ditentukan untuk mendaftarkan/memperbarui kata sandi akun Anda.
                  </p>
                </div>

                {/* Success Banner */}
                {registerSuccessMessage && (
                  <div className="mb-5 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex items-start space-x-3 text-xs animate-in fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-emerald-900">Pendaftaran Kata Sandi Berhasil!</div>
                      <div className="mt-1 leading-relaxed text-emerald-800">{registerSuccessMessage}</div>
                      <div className="mt-2 text-[11px] font-semibold text-emerald-700">
                        Mengalihkan ke formulir login dalam beberapa detik...
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {registerErrorMessage && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start space-x-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold">Pendaftaran Ditolak</div>
                      <div className="mt-0.5 leading-relaxed">{registerErrorMessage}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Input Email yang Ingin Didaftarkan */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Alamat Email Dinas Pegawai
                      </label>
                      {isCheckingWhitelist && (
                        <span className="text-[10px] text-blue-600 flex items-center space-x-1 font-semibold">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Memeriksa izin...</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        disabled={isSubmittingRegister}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setRegisterErrorMessage(null);
                        }}
                        placeholder="contoh: siswantoismail173@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Sistem akan memverifikasi apakah email ini tercantum dalam SK/Daftar Pegawai GTK yang disetujui.
                    </p>
                  </div>

                  {/* Hasil Pemeriksaan Whitelist Status */}
                  {whitelistStatus && (
                    <div className="transition-all">
                      {whitelistStatus.isAuthorized ? (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-1.5 shadow-xs">
                          <div className="flex items-center space-x-2 font-bold text-emerald-900">
                            <BadgeCheck className="w-4 h-4 text-emerald-600" />
                            <span>Email Terverifikasi &amp; Memiliki Izin Akses</span>
                          </div>
                          <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-200 text-[11px] text-slate-700 space-y-0.5">
                            <div>Nama Pegawai: <strong className="text-slate-900">{whitelistStatus.authorizedAccount?.fullName}</strong></div>
                            <div>NIP: <span className="font-mono text-slate-900 font-semibold">{whitelistStatus.authorizedAccount?.nip || '-'}</span></div>
                            <div>Jabatan: <span className="text-slate-900 font-medium">{whitelistStatus.authorizedAccount?.roleTitle}</span></div>
                            <div className="pt-1 text-[10px] text-emerald-700 font-semibold">
                              {whitelistStatus.isRegistered 
                                ? 'Status: Akun pernah mendaftarkan kata sandi sebelumnya (dapat melakukan pembaruan kata sandi).'
                                : 'Status: Akun baru siap aktivasi kata sandi pertama kali.'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start space-x-2.5 shadow-xs">
                          <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-rose-900">Akses Ditolak &bull; Email Tidak Terotorisasi</div>
                            <div className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                              {whitelistStatus.message}
                            </div>
                            <div className="text-[10px] text-rose-700 mt-1">
                              Silakan gunakan alamat email dinas yang telah didaftarkan Administrator (lihat daftar di bawah).
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input Kata Sandi Baru */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Buat Kata Sandi Baru
                      </label>
                      {regPassword && regPassValidation.isValid && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Minimal 6 karakter</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        disabled={isSubmittingRegister}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tentukan kata sandi baru (min 6 karakter)..."
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900 tracking-wide"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Ulangi / Konfirmasi Kata Sandi
                      </label>
                      {regConfirmPassword && (
                        <span className={`text-[10px] font-bold flex items-center space-x-0.5 ${
                          isPasswordsMatch ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPasswordsMatch ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Kata sandi cocok</span>
                            </>
                          ) : (
                            <span>Belum cocok</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        disabled={isSubmittingRegister}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-900 tracking-wide"
                        required
                      />
                    </div>
                  </div>

                  {/* Tombol Simpan / Daftarkan Kata Sandi */}
                  <button
                    type="submit"
                    disabled={
                      Boolean(
                        isSubmittingRegister || 
                        !regEmail || 
                        !regPassword || 
                        !isPasswordsMatch || 
                        (whitelistStatus && !whitelistStatus.isAuthorized)
                      )
                    }
                    className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingRegister ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan ke MySQL Laragon...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Daftarkan Kata Sandi &amp; Aktifkan Akun</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Back to Login link */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(regEmail);
                      setActiveTab('login');
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-blue-700 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Sudah pernah mendaftarkan kata sandi?</span>
                    <span className="text-blue-700 underline">Kembali ke Form Login &rarr;</span>
                  </button>
                </div>
              </>
            )}

            {/* COLLAPSIBLE WHITELIST PREVIEW:
                Menampilkan daftar email yang telah ditentukan untuk memudahkan pengguna menguji & melihat pembatasan akses */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowWhitelistReference(!showWhitelistReference)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200/80"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Daftar Email yang Diizinkan (Whitelist Akses Terdaftar)</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800 font-black">
                    {authorizedList.length || DEFAULT_AUTHORIZED_EMAILS.length} Akun
                  </span>
                </div>
                {showWhitelistReference ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showWhitelistReference && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in duration-200">
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    Hanya email dinas di bawah ini yang disetujui untuk mendaftarkan kata sandi dan mengakses sistem SIM-SOP GTK Provinsi Gorontalo:
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(authorizedList.length > 0 ? authorizedList : DEFAULT_AUTHORIZED_EMAILS).map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span className="text-blue-900">{item.email}</span>
                            {item.isRegistered ? (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                Aktif
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                Siap Aktivasi
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {item.fullName} &bull; <span className="text-slate-500">{item.roleTitle}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIP: {item.nip}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectAuthorizedEmail(item.email)}
                          className="self-start sm:self-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-[11px] font-bold transition border border-blue-200 cursor-pointer"
                        >
                          Gunakan Email
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-500 italic pt-1">
                    Catatan: Pembatasan akses tersimpan di tabel MySQL <code>authorized_emails</code> dan dieksekusi secara ketat oleh backend Express.js.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LAYANAN PENGADUAN DEVELOPER DI BAWAH:
            Hanya ditampilkan jika sudah terjadi kesalahan sampai melebihi batas level yang ditentukan
            (isPermanentLock / lockLevel 2). */}
        {shouldShowHelpdesk && (
          <div className="mt-6 rounded-2xl border p-4 sm:p-5 transition-all shadow-xl bg-rose-950/90 border-rose-500 text-white ring-2 ring-rose-400/50 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white border border-rose-400/30">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-rose-300 uppercase tracking-wide">
                    Layanan Pengaduan Pengembang (Developer)
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    {DEVELOPER_CONTACT.name}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-rose-100 mt-2.5 leading-relaxed">
              Anda tidak dapat melakukan login lagi karena telah melebihi batas maksimal percobaan. Silakan hubungi layanan pengaduan pengembang untuk memverifikasi identitas dan membuka kembali akun Anda:
            </p>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 rounded-xl p-3 border border-rose-800">
              <div className="font-mono text-sm sm:text-base font-bold text-amber-300 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{DEVELOPER_CONTACT.phone}</span>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={DEVELOPER_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim Pengaduan via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition cursor-pointer"
                  title="Salin nomor telepon"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhone ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-rose-200 flex items-center justify-between">
              <span>Jam Layanan: {DEVELOPER_CONTACT.operationalHours}</span>
              <span>Email: {DEVELOPER_CONTACT.email}</span>
            </div>

            {/* Tombol penyetelan ulang untuk keperluan pengujian / demo */}
            <div className="mt-3 pt-2.5 border-t border-rose-800/60 flex items-center justify-between">
              <span className="text-[10px] text-rose-200/80">
                Penyetelan Ulang Pengujian Sistem:
              </span>
              <button
                type="button"
                onClick={handleResetLockEmergency}
                className="text-[10px] text-amber-300 hover:text-white flex items-center space-x-1 underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Pemblokiran Akun (Uji Coba)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center mt-6 text-slate-400 text-xs">
          <div>Hak Cipta &copy; 2026 Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kementerian Pendidikan Dasar dan Menengah Republik Indonesia</div>
        </div>
      </div>
    </div>
  );
};
