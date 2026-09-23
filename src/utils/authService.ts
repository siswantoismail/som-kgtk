import { AuthorizedEmail, WhitelistCheckResult } from '../types';
import { apiUrl } from './apiConfig';

export interface AuthLockState {
  failedAttempts: number;
  lockUntil: number; // timestamp in ms, 0 if not locked
  lockLevel: 0 | 1 | 2; // 0 = normal, 1 = 1-minute lock, 2 = permanent lock (cannot login anymore)
  hadOneMinLock: boolean; // flag if user already completed or triggered 1-minute lockout
}

export interface UserAccount {
  email: string;
  password: string;
  fullName: string;
  nip: string;
  roleTitle: string;
  updatedAt: string;
}

const STORAGE_ACCOUNT_KEY = 'sim_sop_email_account_v2';
const STORAGE_USERS_LIST_KEY = 'sim_sop_db_users';
const STORAGE_WHITELIST_KEY = 'sim_sop_authorized_emails_v2';
const STORAGE_LOCK_KEY = 'sim_sop_auth_lock_state_v3';
const STORAGE_SESSION_KEY = 'sim_sop_auth_session_active_v2';

// Layanan Pengaduan Developer Resmi
export const DEVELOPER_CONTACT = {
  name: 'Layanan Pengaduan & Bantuan Pengembang (Developer SIM-SOP)',
  phone: '+62 822-9118-2026',
  phoneRaw: '082291182026',
  whatsappUrl: 'https://wa.me/6282291182026?text=Halo%20Tim%20Pengembang%20SIM-SOP%20GTK,%20akun%20saya%20terkunci%20karena%20melebihi%20batas%20kesalahan%20login.%20Mohon%20bantuan%20pembukaan%20akses.',
  email: 'pengaduan.sopgtk@kemdikbud.go.id',
  operationalHours: 'Senin - Jumat, 08.00 - 17.00 WITA'
};

// Default Credentials with Email & Kata Sandi
export const DEFAULT_USER_ACCOUNT: UserAccount = {
  email: 'admin.gtk@kemdikbud.go.id',
  password: 'AdminGTK#2026',
  fullName: 'Administrator SIM-SOP GTK',
  nip: '198503152008011003',
  roleTitle: 'Administrator Sistem',
  updatedAt: new Date().toISOString()
};

// Pre-determined Authorized Emails (Whitelist Pembatasan Akses SIM-SOP GTK Provinsi Gorontalo)
// Hanya email ini yang diizinkan untuk mendaftarkan kata sandi dan login
export const DEFAULT_AUTHORIZED_EMAILS: AuthorizedEmail[] = [
  {
    email: 'siswantoismail173@gmail.com',
    fullName: 'Dr. H. Siswanto Ismail, M.Pd.',
    nip: '197405121998031002',
    roleTitle: 'Kepala Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo',
    isRegistered: false,
    registeredAt: null
  },
  {
    email: 'admin@kemdikbud.go.id',
    fullName: 'Administrator SIM-SOP GTK',
    nip: '198503152008011003',
    roleTitle: 'Administrator Sistem',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'admin.gtk@kemdikbud.go.id',
    fullName: 'Administrator SIM-SOP GTK',
    nip: '198503152008011003',
    roleTitle: 'Administrator Sistem',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'kepala.kantor@kemdikbud.go.id',
    fullName: 'Dr. H. Siswanto Ismail, M.Pd.',
    nip: '197405121998031002',
    roleTitle: 'Kepala Kantor GTK Gorontalo',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'pelaksana.gtk@kemdikbud.go.id',
    fullName: 'Pengelola Mutu GTK',
    nip: '198810202010012005',
    roleTitle: 'Pelaksana / Pengelola SOP AP',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'verifikator.gtk@kemdikbud.go.id',
    fullName: 'Verifikator Mutu & Tata Laksana GTK',
    nip: '198904122012032001',
    roleTitle: 'Verifikator Tata Kelola POS AP',
    isRegistered: false,
    registeredAt: null
  }
];

/**
 * Validate email format
 */
export const validateEmail = (emailStr: string): { isValid: boolean; errorMessage?: string } => {
  const trimmed = (emailStr || '').trim();
  if (!trimmed) {
    return { isValid: false, errorMessage: 'Email wajib diisi.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, errorMessage: 'Format alamat email tidak valid (contoh: nama@kemdikbud.go.id).' };
  }
  return { isValid: true };
};

/**
 * Validate password (min 6 characters)
 */
export const validatePassword = (passStr: string): { isValid: boolean; errorMessage?: string } => {
  const trimmed = passStr || '';
  if (!trimmed) {
    return { isValid: false, errorMessage: 'Kata sandi wajib diisi.' };
  }
  if (trimmed.length < 6) {
    return { isValid: false, errorMessage: 'Kata sandi minimal 6 karakter.' };
  }
  return { isValid: true };
};

export const getAllStoredAccounts = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_LIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored user accounts', e);
  }
  const defaultList = [DEFAULT_USER_ACCOUNT];
  localStorage.setItem(STORAGE_USERS_LIST_KEY, JSON.stringify(defaultList));
  return defaultList;
};

// -------------------------------------------------------------
// WHITELIST EMAIL TEROTORISASI & PEMBATASAN AKSES
// -------------------------------------------------------------

export const getStoredAuthorizedEmails = (): AuthorizedEmail[] => {
  try {
    const raw = localStorage.getItem(STORAGE_WHITELIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored authorized emails', e);
  }
  localStorage.setItem(STORAGE_WHITELIST_KEY, JSON.stringify(DEFAULT_AUTHORIZED_EMAILS));
  return DEFAULT_AUTHORIZED_EMAILS;
};

export const saveAuthorizedEmails = (list: AuthorizedEmail[]): void => {
  localStorage.setItem(STORAGE_WHITELIST_KEY, JSON.stringify(list));
};

export const fetchAuthorizedEmails = async (): Promise<AuthorizedEmail[]> => {
  try {
    const res = await fetch(apiUrl('/api/auth/authorized-emails'));
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveAuthorizedEmails(data);
        return data;
      }
    }
  } catch (e) {
    console.warn('API get authorized-emails error, using local:', e);
  }
  return getStoredAuthorizedEmails();
};

export const checkEmailWhitelist = async (email: string): Promise<WhitelistCheckResult> => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return {
      isAuthorized: false,
      isRegistered: false,
      message: 'Silakan masukkan alamat email resmi dinas.'
    };
  }

  // 1. Coba verifikasi langsung ke server Express / MySQL
  try {
    const res = await fetch(apiUrl(`/api/auth/check-whitelist/${encodeURIComponent(cleanEmail)}`));
    if (res.ok) {
      const data: WhitelistCheckResult = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('API check-whitelist error, using local whitelist:', e);
  }

  // 2. Fallback pemeriksaan ke whitelist penyimpanan lokal
  const list = getStoredAuthorizedEmails();
  const match = list.find(a => a.email.toLowerCase() === cleanEmail);

  if (match) {
    return {
      isAuthorized: true,
      isRegistered: Boolean(match.isRegistered),
      authorizedAccount: match,
      message: match.isRegistered
        ? 'Alamat email ini terdaftar dan sudah aktif. Anda dapat masuk atau memperbarui kata sandi baru Anda.'
        : 'Alamat email terdaftar dan terverifikasi dalam sistem izin. Silakan daftarkan kata sandi Anda.'
    };
  }

  return {
    isAuthorized: false,
    isRegistered: false,
    message: `Akses Ditolak: Alamat email "${cleanEmail}" tidak terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo. Pembatasan akses aktif.`
  };
};

export const registerPasswordForAuthorizedEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const passValidation = validatePassword(password);
  if (!passValidation.isValid) {
    return { success: false, message: passValidation.errorMessage || 'Kata sandi tidak valid.' };
  }

  // Panggil endpoint Cloud MySQL via Vercel Serverless / Backend
  try {
    const res = await fetch(apiUrl('/api/auth/register-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Pendaftaran kata sandi berhasil! Akun Anda kini aktif di database Cloud MySQL.'
      };
    } else {
      return {
        success: false,
        message: data.error || data.message || 'Gagal mendaftarkan kata sandi ke database Cloud MySQL.'
      };
    }
  } catch (err: any) {
    console.error('API register-password to Cloud MySQL failed:', err);
    return {
      success: false,
      message: 'Gagal menghubungi database Cloud MySQL. Pastikan koneksi internet aktif.'
    };
  }
};

export const getStoredAccount = (): UserAccount => {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.email && parsed.password) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored user account', e);
  }
  // Store default if not exists
  localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(DEFAULT_USER_ACCOUNT));
  return DEFAULT_USER_ACCOUNT;
};

export const getStoredActiveUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
};

export const saveUserAccount = (account: UserAccount): void => {
  const cleanEmail = account.email.trim().toLowerCase();
  const normalized: UserAccount = {
    ...account,
    email: cleanEmail,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(normalized));

  // Sync with users list database
  const list = getAllStoredAccounts();
  const idx = list.findIndex(u => u.email.trim().toLowerCase() === cleanEmail);
  if (idx >= 0) {
    list[idx] = normalized;
  } else {
    list.push(normalized);
  }
  localStorage.setItem(STORAGE_USERS_LIST_KEY, JSON.stringify(list));
};

export const getLockState = (): AuthLockState => {
  try {
    const raw = localStorage.getItem(STORAGE_LOCK_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading lock state', e);
  }
  return {
    failedAttempts: 0,
    lockUntil: 0,
    lockLevel: 0,
    hadOneMinLock: false
  };
};

export const saveLockState = (state: AuthLockState): void => {
  localStorage.setItem(STORAGE_LOCK_KEY, JSON.stringify(state));
};

export const checkCurrentLock = (): {
  isLocked: boolean;
  isPermanentLock: boolean;
  remainingSeconds: number;
  lockLevel: 0 | 1 | 2;
  failedAttempts: number;
} => {
  const state = getLockState();
  const now = Date.now();

  // Level 2: Permanently locked, cannot login anymore
  if (state.lockLevel === 2) {
    return {
      isLocked: true,
      isPermanentLock: true,
      remainingSeconds: 0,
      lockLevel: 2,
      failedAttempts: state.failedAttempts
    };
  }

  // Level 1: 1-minute countdown lock
  if (state.lockUntil > now) {
    const remainingSeconds = Math.ceil((state.lockUntil - now) / 1000);
    return {
      isLocked: true,
      isPermanentLock: false,
      remainingSeconds,
      lockLevel: state.lockLevel,
      failedAttempts: state.failedAttempts
    };
  }

  return {
    isLocked: false,
    isPermanentLock: false,
    remainingSeconds: 0,
    lockLevel: state.lockLevel,
    failedAttempts: state.failedAttempts
  };
};

export interface LoginResult {
  success: boolean;
  error?: string;
  isLocked?: boolean;
  isPermanentLock?: boolean;
  remainingSeconds?: number;
  lockLevel?: 0 | 1 | 2;
  failedAttempts?: number;
  showDeveloperContact?: boolean;
  loggedInAccount?: UserAccount;
  isUnauthorizedEmail?: boolean;
  isPendingRegistration?: boolean;
}

/**
 * Handle Asynchronous Login Attempt with MySQL Backend & Whitelist Access Restriction
 */
export const performLoginAsync = async (emailInput: string, passwordInput: string): Promise<LoginResult> => {
  const currentLock = checkCurrentLock();
  
  if (currentLock.isPermanentLock) {
    return {
      success: false,
      isLocked: true,
      isPermanentLock: true,
      remainingSeconds: 0,
      lockLevel: 2,
      failedAttempts: currentLock.failedAttempts,
      error: 'Akses akun Anda telah dinonaktifkan sepenuhnya karena melebihi batas percobaan. Anda tidak dapat melakukan login lagi. Silakan hubungi Layanan Pengaduan Pengembang di bawah.',
      showDeveloperContact: true
    };
  }

  if (currentLock.isLocked) {
    return {
      success: false,
      isLocked: true,
      isPermanentLock: false,
      remainingSeconds: currentLock.remainingSeconds,
      lockLevel: 1,
      failedAttempts: currentLock.failedAttempts,
      error: 'Akses login Anda dibekukan selama 1 menit karena telah 3 kali salah memasukkan email/kata sandi.',
      showDeveloperContact: false
    };
  }

  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const cleanPassword = passwordInput || '';

  const emailValidation = validateEmail(cleanEmail);
  const passValidation = validatePassword(cleanPassword);

  if (!emailValidation.isValid || !passValidation.isValid) {
    return handleFailedAttempt(
      !emailValidation.isValid 
        ? emailValidation.errorMessage || 'Email tidak valid.' 
        : passValidation.errorMessage || 'Kata sandi tidak valid.'
    );
  }

  // 1. Coba login melalui API Backend Express & MySQL Laragon
  try {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
    });

    const data = await res.json();

    if (res.status === 403 || data.isUnauthorizedEmail) {
      // Email TIDAK terdaftar dalam whitelist pembatasan akses
      return {
        success: false,
        isUnauthorizedEmail: true,
        error: data.message || `Akses Ditolak: Alamat email "${cleanEmail}" tidak terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo. Pembatasan akses aktif.`
      };
    }

    if (res.status === 400 || data.isPendingRegistration) {
      // Email terdaftar di whitelist tapi belum mendaftarkan password
      return {
        success: false,
        isPendingRegistration: true,
        error: data.message || `Email Anda (${cleanEmail}) telah terdaftar, namun belum mendaftarkan kata sandi. Silakan daftarkan kata sandi Anda di tab "Daftar Akun / Aktivasi Kata Sandi".`
      };
    }

    if (res.ok && data.success && data.user) {
      // Login Sukses
      const loggedAccount: UserAccount = {
        email: data.user.email,
        password: cleanPassword,
        fullName: data.user.fullName || data.user.full_name || 'Pegawai GTK',
        nip: data.user.nip || '-',
        roleTitle: data.user.roleTitle || data.user.role_title || 'Pegawai GTK',
        updatedAt: new Date().toISOString()
      };

      saveLockState({
        failedAttempts: 0,
        lockUntil: 0,
        lockLevel: 0,
        hadOneMinLock: false
      });
      localStorage.setItem(STORAGE_SESSION_KEY, 'true');
      localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(loggedAccount));
      return { success: true, loggedInAccount: loggedAccount };
    }

    if (res.status === 401) {
      return handleFailedAttempt(data.message || 'Kata sandi tidak cocok!');
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Gagal login ke database Cloud MySQL.'
      };
    }
  } catch (err: any) {
    console.error('Backend Cloud MySQL login request failed:', err);
    return {
      success: false,
      error: 'Tidak dapat terhubung ke database Cloud MySQL. Pastikan koneksi internet aktif.'
    };
  }

  return {
    success: false,
    error: 'Gagal memverifikasi akun ke Cloud MySQL.'
  };
};

/**
 * Handle Login Attempt against database of registered user accounts with Whitelist Check
 */
export const performLogin = (emailInput: string, passwordInput: string): LoginResult => {
  const currentLock = checkCurrentLock();
  
  if (currentLock.isPermanentLock) {
    return {
      success: false,
      isLocked: true,
      isPermanentLock: true,
      remainingSeconds: 0,
      lockLevel: 2,
      failedAttempts: currentLock.failedAttempts,
      error: 'Akses akun Anda telah dinonaktifkan sepenuhnya karena melebihi batas percobaan. Anda tidak dapat melakukan login lagi. Silakan hubungi Layanan Pengaduan Pengembang di bawah.',
      showDeveloperContact: true
    };
  }

  if (currentLock.isLocked) {
    return {
      success: false,
      isLocked: true,
      isPermanentLock: false,
      remainingSeconds: currentLock.remainingSeconds,
      lockLevel: 1,
      failedAttempts: currentLock.failedAttempts,
      error: 'Akses login Anda dibekukan selama 1 menit karena telah 3 kali salah memasukkan email/kata sandi.',
      showDeveloperContact: false
    };
  }

  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const cleanPassword = passwordInput || '';

  // Pre-validate format of inputs
  const emailValidation = validateEmail(cleanEmail);
  const passValidation = validatePassword(cleanPassword);

  if (!emailValidation.isValid || !passValidation.isValid) {
    return handleFailedAttempt(
      !emailValidation.isValid 
        ? emailValidation.errorMessage || 'Email tidak valid.' 
        : passValidation.errorMessage || 'Kata sandi tidak valid.'
    );
  }

  // 1. Periksa Pembatasan Akses (Whitelist)
  const authList = getStoredAuthorizedEmails();
  const authRecord = authList.find(a => a.email.toLowerCase() === cleanEmail);

  if (!authRecord) {
    return {
      success: false,
      isUnauthorizedEmail: true,
      error: `Akses Ditolak: Alamat email "${cleanEmail}" tidak terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo. Pembatasan akses aktif.`
    };
  }

  // 2. Periksa apakah user sudah mendaftarkan kata sandi
  const accounts = getAllStoredAccounts();
  const matchUser = accounts.find(a => a.email.trim().toLowerCase() === cleanEmail);

  if (!authRecord.isRegistered && !matchUser) {
    return {
      success: false,
      isPendingRegistration: true,
      error: `Email Anda (${cleanEmail}) terdaftar dalam sistem izin, namun Anda belum mendaftarkan kata sandi. Silakan daftarkan kata sandi Anda di tab "Daftar Akun / Aktivasi Kata Sandi".`
    };
  }

  // 3. Verifikasi kata sandi
  if (matchUser && matchUser.password === cleanPassword) {
    // Success: Clear lock state and set session
    saveLockState({
      failedAttempts: 0,
      lockUntil: 0,
      lockLevel: 0,
      hadOneMinLock: false
    });
    localStorage.setItem(STORAGE_SESSION_KEY, 'true');
    localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(matchUser));
    return { success: true, loggedInAccount: matchUser };
  } else {
    return handleFailedAttempt('Kata sandi tidak cocok!');
  }
};

const handleFailedAttempt = (errorMessage: string): LoginResult => {
  const state = getLockState();
  const now = Date.now();
  const newFailedAttempts = state.failedAttempts + 1;

  if (state.hadOneMinLock) {
    const updatedState: AuthLockState = {
      failedAttempts: newFailedAttempts,
      lockUntil: 0,
      lockLevel: 2, // Permanent lockout
      hadOneMinLock: true
    };
    saveLockState(updatedState);

    return {
      success: false,
      isLocked: true,
      isPermanentLock: true,
      remainingSeconds: 0,
      lockLevel: 2,
      failedAttempts: newFailedAttempts,
      error: 'Anda telah melakukan kesalahan login kembali setelah masa penangguhan! Akun Anda diblokir dan tidak dapat lagi melakukan login. Silakan sampaikan melalui Layanan Pengaduan di bawah.',
      showDeveloperContact: true
    };
  } 
  
  if (newFailedAttempts >= 3) {
    const lockDuration = 60 * 1000; // 1 MENIT (60 Detik)
    const updatedState: AuthLockState = {
      failedAttempts: newFailedAttempts,
      lockUntil: now + lockDuration,
      lockLevel: 1,
      hadOneMinLock: true
    };
    saveLockState(updatedState);

    return {
      success: false,
      isLocked: true,
      isPermanentLock: false,
      remainingSeconds: 60,
      lockLevel: 1,
      failedAttempts: newFailedAttempts,
      error: 'Anda telah salah memasukkan email atau kata sandi sebanyak 3 kali! Akses login dibekukan selama 1 menit.',
      showDeveloperContact: false
    };
  }

  const updatedState: AuthLockState = {
    ...state,
    failedAttempts: newFailedAttempts
  };
  saveLockState(updatedState);

  const sisaKesempatan = 3 - newFailedAttempts;
  return {
    success: false,
    isLocked: false,
    isPermanentLock: false,
    failedAttempts: newFailedAttempts,
    error: `${errorMessage} Peringatan: Sisa kesempatan login adalah ${sisaKesempatan} kali sebelum akun dibekukan 1 menit.`,
    showDeveloperContact: false
  };
};

export const checkIsAuthenticated = (): boolean => {
  return localStorage.getItem(STORAGE_SESSION_KEY) === 'true';
};

export const getCurrentSessionFromBackend = async (): Promise<{ isAuthenticated: boolean; user?: UserAccount | null }> => {
  try {
    const res = await fetch(apiUrl('/api/auth/current-session'));
    if (res.ok) {
      const data = await res.json();
      if (data.isAuthenticated && data.user) {
        const userAccount: UserAccount = {
          email: data.user.email,
          password: '',
          fullName: data.user.fullName,
          nip: data.user.nip || '-',
          roleTitle: data.user.roleTitle || 'Pegawai GTK',
          updatedAt: data.user.loginTime || new Date().toISOString()
        };
        localStorage.setItem(STORAGE_SESSION_KEY, 'true');
        localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(userAccount));
        return { isAuthenticated: true, user: userAccount };
      }
    }
  } catch (err) {
    console.warn('Gagal memverifikasi sesi backend MySQL:', err);
  }
  return { isAuthenticated: checkIsAuthenticated(), user: getStoredActiveUser() };
};

export const logoutSession = (): void => {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_ACCOUNT_KEY);
  // Call MySQL logout API
  fetch(apiUrl('/api/auth/logout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: getStoredActiveUser()?.email || 'unknown' })
  }).catch(() => {});
};

export const logoutSessionAsync = async (): Promise<void> => {
  const activeUser = getStoredActiveUser();
  try {
    await fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: activeUser?.email || 'unknown' })
    });
  } catch (e) {
    console.warn('Gagal memanggil endpoint logout MySQL:', e);
  }
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_ACCOUNT_KEY);
};

export const recordSystemChangeAsync = async (
  entityType: string,
  entityId: string,
  actionType: string,
  userEmail: string,
  description: string,
  changesJson?: any
): Promise<void> => {
  try {
    await fetch(apiUrl('/api/changes/record'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType,
        entityId,
        actionType,
        userEmail,
        description,
        changesJson
      })
    });
  } catch (err) {
    console.warn('Gagal mencatat perubahan ke MySQL data_changes:', err);
  }
};

export const resetLockState = (): void => {
  saveLockState({
    failedAttempts: 0,
    lockUntil: 0,
    lockLevel: 0,
    hadOneMinLock: false
  });
};
