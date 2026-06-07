'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, DEFAULT_USER } from '@/lib/firebase'
import {
  Eye,
  EyeOff,
  TrendingUp,
  AlertCircle,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Password strength rules ────────────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',   label: 'At least 8 characters',       test: (p: string) => p.length >= 8 },
  { id: 'upper',    label: 'One uppercase letter',         test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',    label: 'One lowercase letter',         test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',   label: 'One number',                   test: (p: string) => /[0-9]/.test(p) },
]

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Singapore',
  'UAE', 'Canada', 'Australia', 'Germany', 'Other',
]

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName]           = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [country, setCountry]             = useState('India')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [showStrength, setShowStrength]   = useState(false)
  const [loading, setLoading]             = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]                 = useState('')
  const [checkingAuth, setCheckingAuth]   = useState(true)

  // ── Redirect if already logged in ────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard')
      } else {
        setCheckingAuth(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  // ── Password strength checks ──────────────────────────────────────
  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }))

  const passwordStrength = passwordChecks.filter((r) => r.passed).length
  const allRulesPassed   = passwordStrength === PASSWORD_RULES.length

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
  const strengthColor = [
    '',
    'text-bear',
    'text-warn',
    'text-info',
    'text-bull',
  ][passwordStrength]

  // ── Firebase error messages ───────────────────────────────────────
  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.'
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.'
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  // ── Save new user to Firestore ────────────────────────────────────
  const saveUserToFirestore = async (
    uid: string,
    displayName: string,
    email: string,
    photoURL: string,
  ) => {
    const now = Date.now()
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email,
        displayName,
        photoURL,
        country,
        createdAt:          now,
        lastLoginAt:        now,
        ...DEFAULT_USER,
      },
      { merge: true }, // merge so Google sign-up doesn't overwrite existing data
    )
  }

  // ── Form validation ───────────────────────────────────────────────
  const validate = (): string => {
    if (!fullName.trim() || fullName.trim().length < 2)
      return 'Please enter your full name (at least 2 characters).'
    if (!email.trim())
      return 'Please enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Please enter a valid email address.'
    if (!allRulesPassed)
      return 'Password does not meet all requirements.'
    if (password !== confirmPassword)
      return 'Passwords do not match.'
    if (!agreedToTerms)
      return 'Please agree to the Terms of Service to continue.'
    return ''
  }

  // ── Email / Password Signup ───────────────────────────────────────
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )

      // Update Firebase Auth profile
      await updateProfile(result.user, {
        displayName: fullName.trim(),
      })

      // Save to Firestore
      await saveUserToFirestore(
        result.user.uid,
        fullName.trim(),
        email.trim(),
        '',
      )

      toast.success('Account created! Let\'s set you up.')
      router.replace('/onboarding')
    } catch (err: any) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  // ── Google Signup ─────────────────────────────────────────────────
  const handleGoogleSignup = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service to continue.')
      return
    }

    setError('')
    setGoogleLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user   = result.user

      await saveUserToFirestore(
        user.uid,
        user.displayName ?? 'Trader',
        user.email ?? '',
        user.photoURL ?? '',
      )

      toast.success('Account created! Let\'s set you up.')
      router.replace('/onboarding')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getErrorMessage(err.code))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  // ── Auth check loading ────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* ── Logo & Header ── */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/25 mb-4">
            <TrendingUp className="w-6 h-6 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Create your account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Start trading smarter with AI — free forever
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-bear/10 border border-bear/25 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-bear shrink-0 mt-0.5" />
            <p className="text-sm text-bear">{error}</p>
          </div>
        )}

        {/* ── Google Sign Up ── */}
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
          className="btn-secondary w-full mb-4"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {googleLoading ? 'Creating account...' : 'Continue with Google'}
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-slate-600 font-medium">OR</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* ── Signup Form ── */}
        <form onSubmit={handleEmailSignup} className="space-y-4" noValidate>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-xs font-medium text-slate-400">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Arjun Sharma"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError('') }}
              className="input-field"
              disabled={loading || googleLoading}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-slate-400">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className="input-field"
              disabled={loading || googleLoading}
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label htmlFor="country" className="block text-xs font-medium text-slate-400">
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field appearance-none cursor-pointer"
              disabled={loading || googleLoading}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-surface-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setShowStrength(true)
                  setError('')
                }}
                onFocus={() => setShowStrength(true)}
                className="input-field pr-12"
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                           hover:text-slate-300 transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength meter */}
            {showStrength && password.length > 0 && (
              <div className="mt-2 space-y-2 animate-fade-in">
                {/* Strength bar */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= level
                          ? level === 1
                            ? 'bg-bear'
                            : level === 2
                            ? 'bg-warn'
                            : level === 3
                            ? 'bg-info'
                            : 'bg-bull'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                  {passwordStrength > 0 && (
                    <span className={`text-2xs font-medium ml-1 ${strengthColor}`}>
                      {strengthLabel}
                    </span>
                  )}
                </div>

                {/* Rule checklist */}
                <div className="grid grid-cols-2 gap-1">
                  {passwordChecks.map((rule) => (
                    <div key={rule.id} className="flex items-center gap-1.5">
                      {rule.passed ? (
                        <Check className="w-3 h-3 text-bull shrink-0" />
                      ) : (
                        <X className="w-3 h-3 text-slate-600 shrink-0" />
                      )}
                      <span
                        className={`text-2xs ${
                          rule.passed ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-400">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                className={`input-field pr-12 ${
                  confirmPassword.length > 0
                    ? confirmPassword === password
                      ? 'border-bull/40 focus:border-bull/60'
                      : 'border-bear/40 focus:border-bear/60'
                    : ''
                }`}
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                           hover:text-slate-300 transition-colors p-1"
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <p className="text-2xs text-bear mt-1">Passwords do not match.</p>
            )}
            {confirmPassword.length > 0 && confirmPassword === password && (
              <p className="text-2xs text-bull mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Terms of Service */}
          <div className="flex items-start gap-3 pt-1">
            <button
              type="button"
              onClick={() => setAgreedToTerms((p) => !p)}
              className={`shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center
                         transition-all duration-200 ${
                           agreedToTerms
                             ? 'bg-brand-500 border-brand-500'
                             : 'bg-transparent border-white/20 hover:border-white/40'
                         }`}
              aria-label="Agree to terms"
            >
              {agreedToTerms && <Check className="w-3 h-3 text-white" />}
            </button>
            <p className="text-xs text-slate-500 leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="text-brand-400 hover:text-brand-300 underline transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline transition-colors">
                Privacy Policy
              </Link>
              . I understand ZerionX1 provides educational analysis only — not financial advice.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary w-full mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create free account'
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
