import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import {
  getFirestore,
  Firestore,
} from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// ─── Your Real Firebase Config ─────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBtxK0_2DXUPxzagX8MiOBHdX8jjZyPT_U",
  authDomain:        "zerionx1-2b905.firebaseapp.com",
  projectId:         "zerionx1-2b905",
  storageBucket:     "zerionx1-2b905.firebasestorage.app",
  messagingSenderId: "502699356269",
  appId:             "1:502699356269:web:20beac5ecd8a209cff4f64"
}

// ─── Initialize Firebase App (singleton) ──────────────────────────
let app: FirebaseApp

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApp()
}

// ─── Initialize Firestore ──────────────────────────────────────────
const db: Firestore = getFirestore(app)

// ─── Initialize Auth ───────────────────────────────────────────────
const auth: Auth = getAuth(app)

// Set auth persistence to LOCAL (survives browser refresh)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('[ZerionX1] Auth persistence error:', error)
  })
}

// ─── Initialize Storage ────────────────────────────────────────────
const storage: FirebaseStorage = getStorage(app)

// ─── Google Auth Provider ──────────────────────────────────────────
const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

googleProvider.addScope('email')
googleProvider.addScope('profile')

// ─── Exports ───────────────────────────────────────────────────────
export { app, auth, db, storage, googleProvider }

// ─── Collection path helpers ───────────────────────────────────────
export const COLLECTIONS = {
  users:             'users',
  brokerConnections: (uid: string) => `users/${uid}/broker_connections`,
  paperTrades:       (uid: string) => `users/${uid}/paper_trades`,
  liveOrders:        (uid: string) => `users/${uid}/live_orders`,
  algoStrategies:    (uid: string) => `users/${uid}/algo_strategies`,
  emotionLog:        (uid: string) => `users/${uid}/emotion_log`,
  journal:           (uid: string) => `users/${uid}/journal`,
  leaderboard:       'leaderboard',
} as const

// ─── Type: Firebase User Profile ──────────────────────────────────
export interface FirestoreUser {
  uid:                string
  email:              string
  displayName:        string
  photoURL:           string
  experienceLevel:    'beginner' | 'intermediate' | 'pro'
  markets:            string[]
  riskProfile:        'conservative' | 'moderate' | 'aggressive'
  maxRiskPerTrade:    number
  dailyLossLimit:     number
  subscriptionPlan:   'free' | 'starter' | 'pro' | 'institutional'
  createdAt:          number
  lastLoginAt:        number
  paperBalance:       number
  tradingIQ:          number
  emotionScore:       number
  onboardingComplete: boolean
}

// ─── Default values for new users ─────────────────────────────────
export const DEFAULT_USER: Omit<
  FirestoreUser,
  'uid' | 'email' | 'displayName' | 'photoURL' | 'createdAt' | 'lastLoginAt'
> = {
  experienceLevel:    'beginner',
  markets:            ['stocks'],
  riskProfile:        'moderate',
  maxRiskPerTrade:    0.02,
  dailyLossLimit:     0.05,
  subscriptionPlan:   'free',
  paperBalance:       100000,
  tradingIQ:          0,
  emotionScore:       100,
  onboardingComplete: false,
}
