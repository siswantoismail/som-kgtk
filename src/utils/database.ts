// Database Client Service for SIM-SOP GTK Gorontalo
// Backend: JavaScript / Express.js (Node.js) with MySQL Laragon Support
// Stores:
// 1. users / auth accounts (MySQL `users` table)
// 2. sop_documents (MySQL `sop_documents` table)
// 3. data_changes (MySQL `data_changes` audit logs table)
// With automatic offline/IndexedDB resilience

import { SopDocument } from '../types';
import { INITIAL_SOP_DOCUMENT } from '../data/initialData';
import { UserAccount, DEFAULT_USER_ACCOUNT } from './authService';
import { apiUrl } from './apiConfig';

const DB_NAME = 'SIM_SOP_DATABASE_V1';
const DB_VERSION = 1;
const STORE_SOP = 'sop_documents';
const STORE_USERS = 'users';

const LS_SOP_KEY = 'sim_sop_db_documents';
const LS_USERS_KEY = 'sim_sop_db_users';
const LS_ACTIVE_SOP_ID = 'sim_sop_db_active_id';

let dbPromise: Promise<IDBDatabase> | null = null;

function getIndexedDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SOP)) {
        db.createObjectStore(STORE_SOP, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'email' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// -------------------------------------------------------------
// 1. SOP DOCUMENTS OPERATIONS (MySQL via Express API + Local Cache)
// -------------------------------------------------------------

export async function getAllSopDocuments(): Promise<SopDocument[]> {
  try {
    const res = await fetch(apiUrl('/api/sop'), {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Update local cache
        saveToLocalCache(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[DB Client] Menggunakan cache lokal untuk naskah SOP:', err);
  }

  // Fallback to IndexedDB / localStorage
  return getLocalSopDocuments();
}

async function getLocalSopDocuments(): Promise<SopDocument[]> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SOP, 'readonly');
      const store = tx.objectStore(STORE_SOP);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as SopDocument[];
        if (results && results.length > 0) {
          resolve(results);
        } else {
          resolve(getFallbackSopDocuments());
        }
      };
      req.onerror = () => resolve(getFallbackSopDocuments());
    });
  } catch {
    return getFallbackSopDocuments();
  }
}

function getFallbackSopDocuments(): SopDocument[] {
  try {
    const raw = localStorage.getItem(LS_SOP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage SOP documents', e);
  }
  const defaultList = [INITIAL_SOP_DOCUMENT];
  localStorage.setItem(LS_SOP_KEY, JSON.stringify(defaultList));
  return defaultList;
}

function saveToLocalCache(docs: SopDocument[]) {
  try {
    localStorage.setItem(LS_SOP_KEY, JSON.stringify(docs));
    getIndexDBStore(STORE_SOP, 'readwrite').then(store => {
      for (const doc of docs) {
        store.put(doc);
      }
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

async function getIndexDBStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
  const db = await getIndexedDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

export async function getActiveSopDocument(): Promise<SopDocument> {
  const allDocs = await getAllSopDocuments();
  const activeId = localStorage.getItem(LS_ACTIVE_SOP_ID);
  if (activeId) {
    const found = allDocs.find(d => d.id === activeId);
    if (found) return found;
  }
  return allDocs[0] || INITIAL_SOP_DOCUMENT;
}

export async function saveSopDocument(doc: SopDocument): Promise<void> {
  // Send update directly to Cloud MySQL (writes to `sop_documents` & `data_changes`)
  const activeAccount = getStoredActiveUser();
  const res = await fetch(apiUrl(`/api/sop/${encodeURIComponent(doc.id)}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': activeAccount?.email || 'operator@kemdikbud.go.id'
    },
    body: JSON.stringify(doc)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal menyimpan naskah ke database Cloud MySQL.');
  }
}

export async function createNewSopDocument(newDoc: Partial<SopDocument>): Promise<SopDocument> {
  const id = `sop-${Date.now()}`;
  const completeDoc: SopDocument = {
    id,
    nomorPos: newDoc.nomorPos || `${String(Date.now()).slice(-4)}/T/B7.33/OT.02.00/2026`,
    namaPos: newDoc.namaPos || 'Naskah Prosedur Operasional Standar Baru',
    instansi: newDoc.instansi || INITIAL_SOP_DOCUMENT.instansi,
    unitKerja: newDoc.unitKerja || INITIAL_SOP_DOCUMENT.unitKerja,
    tanggalPembuatan: newDoc.tanggalPembuatan || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    tanggalRevisi: newDoc.tanggalRevisi || '',
    tanggalEfektif: newDoc.tanggalEfektif || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    disahkanOleh: newDoc.disahkanOleh || { ...INITIAL_SOP_DOCUMENT.disahkanOleh },
    dasarHukum: newDoc.dasarHukum || [...INITIAL_SOP_DOCUMENT.dasarHukum],
    kualifikasiPelaksana: newDoc.kualifikasiPelaksana || [...INITIAL_SOP_DOCUMENT.kualifikasiPelaksana],
    keterkaitan: newDoc.keterkaitan || [...INITIAL_SOP_DOCUMENT.keterkaitan],
    peralatan: newDoc.peralatan || [...INITIAL_SOP_DOCUMENT.peralatan],
    peringatan: newDoc.peringatan || [...INITIAL_SOP_DOCUMENT.peringatan],
    pencatatan: newDoc.pencatatan || [...INITIAL_SOP_DOCUMENT.pencatatan],
    status: newDoc.status || 'Aktif'
  };

  // POST to Express / MySQL
  try {
    const activeAccount = getStoredActiveUser();
    await fetch(apiUrl('/api/sop'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': activeAccount?.email || 'admin@kemdikbud.go.id'
      },
      body: JSON.stringify(completeDoc)
    });
  } catch (err) {
    console.warn('API POST SOP failed, cached locally:', err);
  }

  // Update local cache
  await saveSopDocument(completeDoc);
  return completeDoc;
}

export async function deleteSopDocument(id: string): Promise<boolean> {
  const current = await getAllSopDocuments();
  if (current.length <= 1) {
    return false;
  }

  // DELETE from Express / MySQL
  try {
    const activeAccount = getStoredActiveUser();
    await fetch(apiUrl(`/api/sop/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: {
        'x-user-email': activeAccount?.email || 'admin@kemdikbud.go.id'
      }
    });
  } catch (err) {
    console.warn('API DELETE SOP failed:', err);
  }

  // Remove from localStorage & IndexedDB
  const filtered = current.filter(d => d.id !== id);
  localStorage.setItem(LS_SOP_KEY, JSON.stringify(filtered));
  if (localStorage.getItem(LS_ACTIVE_SOP_ID) === id) {
    localStorage.setItem(LS_ACTIVE_SOP_ID, filtered[0].id);
  }

  try {
    const store = await getIndexDBStore(STORE_SOP, 'readwrite');
    store.delete(id);
  } catch (e) {
    console.warn('IndexedDB delete failed', e);
  }

  return true;
}

export async function resetSopDocumentToDefault(id: string): Promise<SopDocument> {
  const resetDoc: SopDocument = {
    ...INITIAL_SOP_DOCUMENT,
    id
  };
  await saveSopDocument(resetDoc);
  return resetDoc;
}

// -------------------------------------------------------------
// 2. USERS / LOGIN ACCOUNTS (MySQL `users` table via Express API)
// -------------------------------------------------------------

export async function getAllUserAccounts(): Promise<UserAccount[]> {
  try {
    const res = await fetch('/api/auth/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('[DB Client] Memuat akun dari penyimpanan lokal:', err);
  }

  return getFallbackUsers();
}

function getFallbackUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(LS_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage users', e);
  }
  const defaultList = [DEFAULT_USER_ACCOUNT];
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(defaultList));
  return defaultList;
}

export async function saveUserAccountToDb(account: UserAccount): Promise<void> {
  const cleanEmail = account.email.trim().toLowerCase();
  const normalizedAccount: UserAccount = {
    ...account,
    email: cleanEmail,
    updatedAt: new Date().toISOString()
  };

  // Sync with Express / MySQL backend
  try {
    const activeAccount = getStoredActiveUser();
    await fetch(apiUrl(`/api/auth/users/${encodeURIComponent(cleanEmail)}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: normalizedAccount.password,
        fullName: normalizedAccount.fullName,
        nip: normalizedAccount.nip,
        roleTitle: normalizedAccount.roleTitle,
        currentActorEmail: activeAccount?.email || cleanEmail
      })
    });
  } catch (e) {
    console.warn('API save user account error, saving locally:', e);
  }

  // Local sync
  try {
    const current = getFallbackUsers();
    const idx = current.findIndex(u => u.email.trim().toLowerCase() === cleanEmail);
    if (idx >= 0) {
      current[idx] = normalizedAccount;
    } else {
      current.push(normalizedAccount);
    }
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(current));
    localStorage.setItem('sim_sop_email_account_v2', JSON.stringify(normalizedAccount));

    const store = await getIndexDBStore(STORE_USERS, 'readwrite');
    store.put(normalizedAccount);
  } catch (e) {
    console.warn('LocalStorage save failed for user', e);
  }
}

export async function addUserAccountToDb(account: UserAccount): Promise<boolean> {
  const cleanEmail = account.email.trim().toLowerCase();

  try {
    const activeAccount = getStoredActiveUser();
    const res = await fetch(apiUrl('/api/auth/users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: account.password,
        fullName: account.fullName,
        nip: account.nip,
        roleTitle: account.roleTitle,
        currentActorEmail: activeAccount?.email || cleanEmail
      })
    });
    if (!res.ok) {
      const err = await res.json();
      console.warn('Server error on add user:', err);
    }
  } catch (e) {
    console.warn('Add user API error, cached locally:', e);
  }

  await saveUserAccountToDb(account);
  return true;
}

export async function deleteUserAccountFromDb(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const current = await getAllUserAccounts();
  if (current.length <= 1) {
    return false;
  }

  try {
    const activeAccount = getStoredActiveUser();
    await fetch(apiUrl(`/api/auth/users/${encodeURIComponent(cleanEmail)}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentActorEmail: activeAccount?.email || 'admin' })
    });
  } catch (e) {
    console.warn('API delete user error:', e);
  }

  const filtered = current.filter(u => u.email.trim().toLowerCase() !== cleanEmail);
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(filtered));

  try {
    const store = await getIndexDBStore(STORE_USERS, 'readwrite');
    store.delete(cleanEmail);
  } catch (e) {
    console.warn('IndexedDB delete user failed', e);
  }

  return true;
}

export async function initDatabase(): Promise<void> {
  try {
    await getIndexedDB();
    await getAllSopDocuments();
    await getAllUserAccounts();
  } catch (err) {
    console.warn('initDatabase fallback to localStorage', err);
  }
}

export async function findUserByCredentials(email: string, password: string): Promise<UserAccount | null> {
  // First attempt verify through Express API (which checks MySQL Laragon `users`)
  try {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        return {
          email: data.user.email,
          password: password,
          fullName: data.user.fullName,
          nip: data.user.nip,
          roleTitle: data.user.roleTitle,
          updatedAt: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('[DB Client] API login check error, checking local store:', err);
  }

  // Fallback to local accounts
  const users = await getAllUserAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const match = users.find(u => u.email.trim().toLowerCase() === cleanEmail && u.password === password);
  return match || null;
}

// -------------------------------------------------------------
// 3. MYSQL LARAGON STATUS & AUDIT LOG SERVICES
// -------------------------------------------------------------

export interface DatabaseStatusResponse {
  mysqlConnected: boolean;
  lastError: string | null;
  config: {
    host: string;
    port: number;
    user: string;
    database: string;
  };
  tables: Array<{
    name: string;
    description: string;
    recordCount: number;
  }>;
  backendInfo: {
    framework: string;
    runtime: string;
    driver: string;
    isPHP: boolean;
  };
}

export interface DataChangeLog {
  id: number;
  entityType: string;
  entityId: string;
  actionType: string;
  userEmail: string;
  description: string;
  changesJson?: any;
  createdAt: string;
}

export async function getDatabaseStatus(): Promise<DatabaseStatusResponse | null> {
  try {
    const res = await fetch(apiUrl('/api/database/status'));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch database status:', err);
  }
  return null;
}

export async function getDataChangeLogs(): Promise<DataChangeLog[]> {
  try {
    const res = await fetch(apiUrl('/api/changes'));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch change logs:', err);
  }
  return [];
}

export async function testMySqlConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(apiUrl('/api/database/test-connection'), { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menghubungi server' };
  }
  return { success: false, message: 'Server tidak merespons' };
}

function getStoredActiveUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem('sim_sop_email_account_v2');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}
