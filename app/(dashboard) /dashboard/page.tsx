'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Zap,
  FlaskConical,
  Brain,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  IndianRupee,
  Activity,
  AlertTriangle,
  ChevronRight,
  Wallet,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface UserData {
  displayName:     string
  paperBalance:    number
  emotionScore:    number
  tradingIQ:       number
  experienceLevel: string
  subscriptionPlan: string
}

interface WatchlistItem {
  symbol:  string
  name:    string
  price:   number
  change:  number
  changePct: number
}

// ── Mock watchlist data (replaced by Upstox API later) ────────────
const MOCK_WATCHLIST: WatchlistItem[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2847.50, change: 32.40,  changePct: 1.15  },
  { symbol: 'TCS',      name: 'Tata Consultancy',    price: 3921.10, change: -18.60, changePct: -0.47 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank',           price: 1678.25, change: 12.75,  changePct: 0.77  },
  { symbol: 'INFY',     name: 'Infosys',             price: 1456.80, change: -8.20,  changePct: -0.56 },
  { symbol: 'NIFTY50',  name: 'Nifty 50 Index',      price: 24892.00,change: 187.30, changePct: 0.76  },
]

// ── Quick action cards ─────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    href:        '/paper-trading',
    label:       'Paper Trade',
    description: 'Practice with virtual money',
    icon:        FlaskConical,
    color:       'from-info/20 to-info/5 border-info/20',
    iconColor:   'text-info',
  },
  {
    href:        '/live-trading',
    label:       'Live Trade',
    description: 'Real money, real markets',
    icon:        Zap,
    color:       'from-bull/20 to-bull/5 border-bull/20',
    iconColor:   'text-bull',
    badge:       'LIVE',
  },
  {
    href:        '/algo-builder',
    label:       'Algo Builder',
    description: 'Build trading strategies',
    icon:        Bot,
    color:       'from-brand-500/20 to-brand-500/5 border-brand-500/20',
    iconColor:   'text-brand-400',
  },
  {
    href:        '/emotion-report',
    label:       'Emotion AI',
    description: 'Your trading psychology',
    icon:        Brain,
    color:       'from-warn/20 to-warn/5 border-warn/20',
    iconColor:   'text-warn',
  },
]

export default function DashboardPage() {
  const [userData, setUserData]   = useState<UserData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [greeting, setGreeting]   = useState('Good morning')
  const [refreshing, setRefreshing] = useState(false)

  // ── Greeting based on IST time ────────────────────────────────
  useEffect(() => {
    const ist  = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    const hour = new Date(ist).getHours()
    if (hour < 12)      setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else                setGreeting('Good evening')
  }, [])

  // ── Load user data from Firestore ─────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          setUserData(snap.data() as UserData)
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // ── Simulate refresh ──────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1000))
    setRefreshing(false)
  }

  // ── Emotion score color ───────────────────────────────────────
  const getEmotionColor = (score: number) => {
    if (score >= 80) return 'text-bull'
    if (score >= 50) return 'text-warn'
    return 'text-bear'
  }

  const getEmotionLabel = (score: number) => {
    if (score >= 80) return 'Disciplined'
    if (score >= 50) return 'Moderate'
    return 'High Risk'
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-white/[0.05] rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-28 bg-white/[0.05] rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white/[0.05] rounded-2xl" />
      </div>
    )
  }

  const firstName = userData?.displayName?.split(' ')[0] ?? 'Trader'

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is your trading overview for today.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 btn-secondary py-2 px-3"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:block text-xs">Refresh</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Paper Balance */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Paper Balance</span>
            <Wallet className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-slate-400" />
            <span className="stat-value text-xl">
              {(userData?.paperBalance ?? 100000).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-2xs text-slate-600 mt-1">Virtual trading balance</p>
        </div>

        {/* Today P&L — placeholder */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Today P&L</span>
            <Activity className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-1">
            <span className="stat-value text-xl text-bull">+₹0</span>
          </div>
          <div className="stat-change-up mt-1">
            <ArrowUpRight className="w-3 h-3" />
            0.00% today
          </div>
        </div>

        {/* Emotion Score */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Emotion Score</span>
            <Brain className="w-4 h-4 text-slate-600" />
          </div>
          <span className={`stat-value text-xl ${
            getEmotionColor(userData?.emotionScore ?? 100)
          }`}>
            {userData?.emotionScore ?? 100}/100
          </span>
          <p className={`text-2xs mt-1 font-medium ${
            getEmotionColor(userData?.emotionScore ?? 100)
          }`}>
            {getEmotionLabel(userData?.emotionScore ?? 100)}
          </p>
        </div>

        {/* Trading IQ */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Trading IQ</span>
            <TrendingUp className="w-4 h-4 text-slate-600" />
          </div>
          <span className="stat-value text-xl text-brand-400">
            {userData?.tradingIQ ?? 0}
          </span>
          <p className="text-2xs text-slate-600 mt-1">
            Complete lessons to improve
          </p>
        </div>

      </div>

      {/* ── AI Market Summary Banner ── */}
      <div className="glass-card p-4 border-l-4 border-l-brand-500">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg
                          bg-brand-500/20 shrink-0">
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-200">
                ZerionX1 AI
              </span>
              <span className="badge-live">LIVE</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Markets opened positive today. Nifty 50 is up 0.76% at 24,892.
              Banking and IT sectors showing strength. Connect your Upstox
              account to get personalised AI trade signals for your portfolio.
            </p>
            <p className="text-2xs text-slate-600 mt-2 italic">
              This is educational analysis, not financial advice.
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`glass-card p-4 bg-gradient-to-br ${action.color}
                          hover:scale-[1.02] transition-all duration-200
                          flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center justify-center w-9 h-9
                                 rounded-xl bg-white/5`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                {action.badge && (
                  <span className="badge-buy text-2xs">{action.badge}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {action.label}
                </p>
                <p className="text-2xs text-slate-500 mt-0.5">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Watchlist ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Watchlist</h2>
          <Link
            href="/chart"
            className="flex items-center gap-1 text-xs text-brand-400
                       hover:text-brand-300 transition-colors"
          >
            View chart
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="glass-card overflow-hidden">
          {MOCK_WATCHLIST.map((item, index) => (
            <Link
              key={item.symbol}
              href={`/chart?symbol=${item.symbol}`}
              className={`flex items-center gap-3 px-4 py-3.5
                          hover:bg-white/[0.03] transition-colors
                          ${index !== MOCK_WATCHLIST.length - 1
                            ? 'border-b border-white/[0.05]'
                            : ''
                          }`}
            >
              {/* Symbol */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border
                              border-white/[0.08] flex items-center justify-center shrink-0">
                <span className="text-2xs font-bold text-slate-400">
                  {item.symbol.slice(0, 2)}
                </span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {item.symbol}
                </p>
                <p className="text-2xs text-slate-500 truncate">{item.name}</p>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular text-slate-200">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
                <div className={`flex items-center justify-end gap-0.5 text-2xs
                                 font-medium ${
                  item.change >= 0 ? 'text-bull' : 'text-bear'
                }`}>
                  {item.change >= 0
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />
                  }
                  {item.change >= 0 ? '+' : ''}
                  {item.changePct.toFixed(2)}%
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-2xs text-slate-600 text-center mt-2">
          Connect Upstox to see live prices
        </p>
      </div>

      {/* ── Connect Broker Banner ── */}
      <div className="glass-card p-5 border border-warn/20
                      bg-gradient-to-br from-warn/5 to-transparent">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-warn shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Connect your Upstox account
            </h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Connect your Upstox broker account to enable live trading,
              real portfolio data, and personalised AI signals.
            </p>
            <Link href="/connect-broker" className="btn-primary py-2 px-4 text-xs">
              Connect Upstox
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
