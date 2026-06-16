import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ── Get current logged in user ────────────────────────────────────
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// ── Sign out user ─────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  try {
    // Clear session cookie
    document.cookie =
      'zerionx1-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('[ZerionX1] Sign out error:', error)
    throw error
  }
}

// ── Check if user completed onboarding ───────────────────────────
export async function checkOnboardingComplete(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return false
    return snap.data()?.onboardingComplete === true
  } catch {
    return false
  }
}

// ── Set session cookie after login ────────────────────────────────
export async function setSessionCookie(user: User): Promise<void> {
  try {
    const token = await user.getIdToken()
    // Set cookie that expires in 7 days
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    document.cookie =
      `zerionx1-session=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`
  } catch (error) {
    console.error('[ZerionX1] Session cookie error:', error)
  }
}

// ── Refresh session cookie ────────────────────────────────────────
export async function refreshSession(): Promise<void> {
  const user = auth.currentUser
  if (!user) return
  await setSessionCookie(user)
}

// ── Subscribe to auth state changes ──────────────────────────────
export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await setSessionCookie(user)
    } else {
      document.cookie =
        'zerionx1-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
    callback(user)
  })
}
