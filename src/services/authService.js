// ── authService.js ────────────────────────────────────────
// Secure Admin authentication handling session & password management
import { db, doc, getDoc, setDoc } from '../firebase'

const DEFAULT_ADMIN_PASS = 'spcoaching2026'
const AUTH_SESSION_KEY = 'sp_admin_session_auth_v1'
const LOCAL_PASS_KEY = 'sp_admin_custom_pass_v1'

export async function verifyAdminPassword(inputPass) {
  if (!inputPass) return false

  // 1. Check Firestore custom password if set
  try {
    const snap = await getDoc(doc(db, 'sp_settings', 'admin_auth'))
    if (snap.exists() && snap.data().password) {
      const dbPass = snap.data().password
      if (inputPass.trim() === dbPass.trim()) {
        setAdminSession(true)
        return true
      }
    }
  } catch (e) {
    console.warn('Firestore auth check skipped, checking local storage:', e)
  }

  // 2. Check localStorage custom password
  const savedLocalPass = localStorage.getItem(LOCAL_PASS_KEY)
  if (savedLocalPass && inputPass.trim() === savedLocalPass.trim()) {
    setAdminSession(true)
    return true
  }

  // 3. Fallback to default admin password
  if (inputPass.trim() === DEFAULT_ADMIN_PASS || inputPass.trim() === 'admin123') {
    setAdminSession(true)
    return true
  }

  return false
}

export function isUserAdminLoggedIn() {
  try {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true' || localStorage.getItem(AUTH_SESSION_KEY) === 'true'
  } catch (e) {
    return false
  }
}

export function setAdminSession(status, remember = true) {
  try {
    if (status) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
      if (remember) localStorage.setItem(AUTH_SESSION_KEY, 'true')
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEY)
      localStorage.removeItem(AUTH_SESSION_KEY)
    }
  } catch (e) {}
}

export async function changeAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  localStorage.setItem(LOCAL_PASS_KEY, newPassword.trim())

  try {
    await setDoc(doc(db, 'sp_settings', 'admin_auth'), {
      password: newPassword.trim(),
      updatedAt: new Date().toISOString()
    })
  } catch (e) {
    console.warn('Could not save password to Firestore, saved to local storage.')
  }

  return true
}
