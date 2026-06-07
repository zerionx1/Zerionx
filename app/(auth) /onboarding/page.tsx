'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import {
  TrendingUp,
  BarChart2,
  Globe,
  Shield,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────────
type Experience = 'beginner' | 'intermediate' | 'pro'
type Market     = 'stocks' | 'crypto' | 'forex' | 'commodities'
type Risk       = 'conservative' | 'moderate' | 'aggressive'

interface OnboardingData {
  experienceLevel: Experience
  markets:         Market[]
  riskProfile:     Risk
  maxRiskPerTrade: number
  dailyLossLimit:  number
}

// ── Step 1 Options ────────────────────────────────────────────────
const EXPERIENCE_OPTIONS = [
  {
    id:          'beginner' as Experience,
    label:       'Beginner',
    description: 'I am new to trading. Less than 1 year experience.',
    icon:        '🌱',
    color:       'border-bull/40 bg-bull/5',
    selected:    'border-bull bg-bull/15',
  },
  {
    id:          'intermediate' as Experience,
    label:       'Intermediate',
    description: 'I have been trading for 1–3 years. Know the basics.',
    icon:        '📈',
    color:       'border-brand-500/40 bg-brand-500/5',
    selected:    'border-brand-500 bg-brand-500/15',
  },
  {
    id:          'pro' as Experience,
    label:       'Professional',
    description: 'I have 3+ years experience. Use technical analysis.',
    icon:        '🎯',
    color:       'border-info/40 bg-info/5',
    selected:    'border-info bg-info/15',
  },
]

// ── Step 2 Options ────────────────────────────────────────────────
const MARKET_OPTIONS = [
  {
    id:          'stocks' as Market,
    label:       'India Stocks',
    description: 'NSE & BSE — Nifty, Sensex, F&O',
    icon:        '🇮🇳',
  },
  {
    id:          'crypto' as Market,
    label:       'Crypto',
    description: 'Bitcoin, Ethereum, Altcoins',
    icon:        '₿',
  },
  {
    id:          'forex' as Market,
    label:       'Forex',
    description: 'USD/INR, EUR/USD, 70+ pairs',
    icon:        '💱',
  },
  {
    id:          'commodities' as Market,
    label:       'Commodities',
    description: 'Gold, Silver, Crude Oil — MCX',
    icon:        '🥇',
  },
]

// ── Step 3 Options ────────────────────────────────────────────────
const RISK_OPTIONS = [
  {
    id:             'conservative' as Risk,
    label:          'Conservative',
    description:    'Max 1% risk per trade. Capital protection first.',
    maxRisk:        0.01,
    dailyLimit:     0.03,
    icon:           '🛡️',
    color:          'border-bull/40 bg-bull/5',
    selected:       'border-bull bg-bull/15',
    tag:            'Safest',
    tagColor:       'bg-bull/20 text-bull',
  },
  {
    id:             'moderate' as Risk,
    label:          'Moderate',
    description:    'Max 2% risk per trade. Balanced approach.',
    maxRisk:        0.02,
    dailyLimit:     0.05,
    icon:           '⚖️',
    color:          'border-brand-500/40 bg-brand-500/5',
    selected:       'border-brand-500 bg-brand-500/15',
    tag:            'Recommended',
    tagColor:       'bg-brand-500/20 text-brand-400',
  },
  {
    id:             'aggressive' as Risk,
    label:          'Aggressive',
    description:    'Max 5% risk per trade. Higher risk, higher reward.',
    maxRisk:        0.05,
    dailyLimit:     0.10,
    icon:           '⚡',
    color:          'border-bear/40 bg-bear/5',
    selected:       'border-bear bg-bear/15',
    tag:            'High Risk',
    tagColor:       'bg-bear/20 text-bear',
  },
]

export default function OnboardingPage() {
  const router = useRouter()

  const [step, setStep]       = useState(1)
  const [uid, setUid]         = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [data, setData] = useState<OnboardingData>({
    experienceLevel: 'beginner',
    markets:         ['stocks'],
    riskProfile:     'moderate',
    maxRiskPerTrade: 0.02,
    dailyLossLimit:  0.05,
  })

  // ── Check auth ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login')
      } else {
        setUid(user.uid)
        setCheckingAuth(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  // ── Handlers ────────────────────────────────────────────────────
  const selectExperience = (level: Experience) => {
    setData((prev) => ({ ...prev, experienceLevel: level }))
  }

  const toggleMarket = (market: Market) => {
    setData((prev) => {
      const exists = prev.markets.includes(market)
      if (exists && prev.markets.length === 1) return prev // keep at least 1
      return {
        ...prev,
        markets: exists
          ? prev.markets.filter((m) => m !== market)
          : [...prev.markets, market],
      }
    })
  }

  const selectRisk = (risk: Risk) => {
    const option = RISK_OPTIONS.find((r) => r.id === risk)!
    setData((prev) => ({
      ...prev,
      riskProfile:     risk,
      maxRiskPerTrade: option.maxRisk,
      dailyLossLimit:  option.dailyLimit,
    }))
  }

  // ── Save to Firestore and redirect ──────────────────────────────
  const handleFinish = async () => {
    if (!uid) return
    setLoading(true)

    try {
      await updateDoc(doc(db, 'users', uid), {
        experienceLevel:    data.experienceLevel,
        markets:            data.markets,
        riskProfile:        data.riskProfile,
        maxRiskPerTrade:    data.maxRiskPerTrade,
        dailyLossLimit:     data.dailyLossLimit,
        onboardingComplete: true,
      })

      toast.success('Profile set up! Welcome to ZerionX1.')
      router.replace('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading state ────────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="auth-wrapper min-h-screen py-12">
      <div className="w-full max-w-lg mx-auto px-4">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl
                          bg-brand-500/15 border border-brand-500/25">
            <TrendingUp className="w-5 h-5 text-brand-400" />
          </div>
          <span className="font-bold text-lg text-slate-100">ZerionX1</span>
        </div>

        {/* ── Progress Bar ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Step {step} of 3</span>
            <span className="text-xs text-slate-500">
              {step === 1 ? 'Experience' : step === 2 ? 'Markets' : 'Risk Profile'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-brand rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center justify-between mt-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-7 h-7 rounded-full
                            text-xs font-semibold border transition-all duration-300 ${
                  s < step
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : s === step
                    ? 'border-brand-500 text-brand-400 bg-brand-500/10'
                    : 'border-white/10 text-slate-600 bg-transparent'
                }`}
              >
                {s < step ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* ── Card ── */}
        <div className="glass-card p-6 animate-slide-up">

          {/* ════ STEP 1 — Experience ════ */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100">
                  What is your trading experience?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  We personalise your dashboard based on this.
                </p>
              </div>

              <div className="space-y-3">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => selectExperience(option.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2
                                transition-all duration-200 text-left ${
                      data.experienceLevel === option.id
                        ? option.selected
                        : `${option.color} hover:border-white/20`
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-100 text-sm">
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    {data.experienceLevel === option.id && (
                      <div className="w-5 h-5 rounded-full bg-brand-500
                                      flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════ STEP 2 — Markets ════ */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100">
                  Which markets do you trade?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select all that apply. You can change this later.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MARKET_OPTIONS.map((option) => {
                  const isSelected = data.markets.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleMarket(option.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl
                                  border-2 transition-all duration-200 text-center ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15'
                          : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className={`font-semibold text-sm ${
                          isSelected ? 'text-brand-300' : 'text-slate-300'
                        }`}>
                          {option.label}
                        </p>
                        <p className="text-2xs text-slate-500 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-500
                                        flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <p className="text-center text-2xs text-slate-600 mt-4">
                {data.markets.length} market{data.markets.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* ════ STEP 3 — Risk Profile ════ */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100">
                  What is your risk appetite?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  This sets your default risk limits. You can adjust anytime.
                </p>
              </div>

              <div className="space-y-3">
                {RISK_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => selectRisk(option.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border-2
                                transition-all duration-200 text-left ${
                      data.riskProfile === option.id
                        ? option.selected
                        : `${option.color} hover:border-white/20`
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{option.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-slate-100 text-sm">
                          {option.label}
                        </p>
                        <span className={`text-2xs px-2 py-0.5 rounded-full font-medium ${option.tagColor}`}>
                          {option.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {option.description}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-2xs text-slate-600">
                          Max/trade: <span className="text-slate-400 font-medium">
                            {(option.maxRisk * 100).toFixed(0)}%
                          </span>
                        </span>
                        <span className="text-2xs text-slate-600">
                          Daily limit: <span className="text-slate-400 font-medium">
                            {(option.dailyLimit * 100).toFixed(0)}%
                          </span>
                        </span>
                      </div>
                    </div>
                    {data.riskProfile === option.id && (
                      <div className="w-5 h-5 rounded-full bg-brand-500
                                      flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Risk disclaimer */}
              <div className="mt-4 p-3 rounded-xl bg-warn/5 border border-warn/20">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                  <p className="text-2xs text-slate-500 leading-relaxed">
                    ZerionX1 AI will warn you before any trade that exceeds these limits.
                    All limits are adjustable in Settings at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation Buttons ── */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn-primary flex-1"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Start Trading
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Bottom icons ── */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {[
            { icon: BarChart2, label: 'Paper Trading' },
            { icon: Globe,     label: 'Live Markets' },
            { icon: Shield,    label: 'Risk Protected' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="w-4 h-4 text-slate-600" />
              <span className="text-2xs text-slate-600">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
