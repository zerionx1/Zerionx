'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Shield,
  Zap,
  Bot,
  BarChart2,
  FlaskConical,
  Trophy,
  BookOpen,
  ChevronRight,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface TickerItem {
  symbol:    string
  name:      string
  price:     number
  change:    number
  changePct: number
  up:        boolean
  source:    'crypto' | 'index'
}

interface CryptoPrice {
  symbol: string
  price:  string
  change: string
}

// ── Features list ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon:     Brain,
    title:    'Emotion AI Shield',
    desc:     'Detects FOMO, revenge trading and overtrading in real time before you lose money.',
    color:    'text-warn',
    bg:       'bg-warn/10 border-warn/20',
    tag:      'Most Unique',
  },
  {
    icon:     Bot,
    title:    'Natural Language Trading',
    desc:     'Type "Buy 10 Reliance if RSI drops below 30" — ZerionX1 executes it. No forms.',
    color:    'text-brand-400',
    bg:       'bg-brand-500/10 border-brand-500/20',
    tag:      'AI Powered',
  },
  {
    icon:     BarChart2,
    title:    'Chart AI Analysis',
    desc:     'Upload any chart screenshot. AI reads it and gives entry, exit and stop loss instantly.',
    color:    'text-info',
    bg:       'bg-info/10 border-info/20',
    tag:      'Gemini Vision',
  },
  {
    icon:     FlaskConical,
    title:    'Gamified Paper Trading',
    desc:     'Practice with ₹1,00,000 virtual money. Compete on leaderboards. Earn achievements.',
    color:    'text-bull',
    bg:       'bg-bull/10 border-bull/20',
    tag:      'Free Forever',
  },
  {
    icon:     Zap,
    title:    'No Code Algo Builder',
    desc:     'Build automated strategies by drag and drop. No Python. Backtest 10 years of data.',
    color:    'text-brand-400',
    bg:       'bg-brand-500/10 border-brand-500/20',
    tag:      'Zero Coding',
  },
  {
    icon:     Shield,
    title:    'AI Risk Guardian',
    desc:     'AI blocks any trade that exceeds your risk limit automatically. Capital always safe.',
    color:    'text-bear',
    bg:       'bg-bear/10 border-bear/20',
    tag:      'SEBI Compliant',
  },
]

// ── Pricing ───────────────────────────────────────────────────────
const PLANS = [
  {
    name:     'Free',
    price:    '₹0',
    period:   'forever',
    color:    'border-white/10',
    button:   'btn-secondary w-full',
    features: [
      'Paper trading ₹1,00,000 virtual',
      'AI chat 10 messages/day',
      'TradingView charts',
      'Basic emotion shield',
      'Leaderboard access',
    ],
  },
  {
    name:     'Starter',
    price:    '₹499',
    period:   'per month',
    popular:  true,
    color:    'border-brand-500',
    button:   'btn-primary w-full',
    features: [
      'Everything in Free',
      'Live trading via Upstox',
      'Unlimited AI chat',
      'Full emotion AI reports',
      'Risk guardian',
      'Priority support',
    ],
  },
  {
    name:     'Pro',
    price:    '₹1,999',
    period:   'per month',
    color:    'border-white/10',
    button:   'btn-secondary w-full',
    features: [
      'Everything in Starter',
      'No code algo builder',
      'All markets (crypto, forex)',
      'Strategy backtesting',
      'Strategy marketplace',
      'API access',
    ],
  },
]

export default function LandingPage() {
  const [ticker, setTicker]       = useState<TickerItem[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading]     = useState(true)
  const wsRef                     = useRef<WebSocket | null>(null)
  const tickerRef                 = useRef<HTMLDivElement>(null)

  // ── Fetch real crypto prices from Binance WebSocket ───────────
  useEffect(() => {
    // Initial crypto prices via REST
    const fetchInitialPrices = async () => {
      try {
        const symbols = [
          'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
          'SOLUSDT', 'ADAUSDT', 'XRPUSDT',
        ]
        const res  = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`
        )
        const data = await res.json()

        const items: TickerItem[] = data.map((d: any) => ({
          symbol:    d.symbol.replace('USDT', '/USDT'),
          name:      getCryptoName(d.symbol),
          price:     parseFloat(d.lastPrice),
          change:    parseFloat(d.priceChange),
          changePct: parseFloat(d.priceChangePercent),
          up:        parseFloat(d.priceChangePercent) >= 0,
          source:    'crypto' as const,
        }))

        setTicker(items)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    fetchInitialPrices()

    // Live WebSocket stream from Binance
    const streams = [
      'btcusdt', 'ethusdt', 'bnbusdt',
      'solusdt', 'adausdt', 'xrpusdt',
    ].map((s) => `${s}@ticker`).join('/')

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streams}`
    )

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (event) => {
      const msg  = JSON.parse(event.data)
      const data = msg.data
      if (!data) return

      const symbol    = data.s.replace('USDT', '/USDT')
      const price     = parseFloat(data.c)
      const change    = parseFloat(data.P)
      const priceChg  = parseFloat(data.p)

      setTicker((prev) =>
        prev.map((item) =>
          item.symbol === symbol
            ? {
                ...item,
                price,
                change:    priceChg,
                changePct: change,
                up:        change >= 0,
              }
            : item
        )
      )
    }

    ws.onerror = () => setConnected(false)
    ws.onclose = () => setConnected(false)

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [])

  // ── Also fetch CoinGecko for more coins ───────────────────────
  useEffect(() => {
    const fetchCoinGecko = async () => {
      try {
        const res  = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple,binancecoin&vs_currencies=usd&include_24hr_change=true'
        )
        const data = await res.json()
        // Data available for fallback use
      } catch {
        // Silent fail — Binance WebSocket is primary
      }
    }
    fetchCoinGecko()
  }, [])

  const getCryptoName = (symbol: string): string => {
    const names: Record<string, string> = {
      BTCUSDT: 'Bitcoin',
      ETHUSDT: 'Ethereum',
      BNBUSDT: 'BNB',
      SOLUSDT: 'Solana',
      ADAUSDT: 'Cardano',
      XRPUSDT: 'XRP',
    }
    return names[symbol] ?? symbol
  }

  const formatPrice = (price: number, symbol: string): string => {
    if (price > 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    if (price > 1)    return `$${price.toFixed(2)}`
    return `$${price.toFixed(4)}`
  }

  return (
    <div className="min-h-screen bg-dark-500">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]
                      bg-dark-500/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg
                            bg-brand-500/20 border border-brand-500/30">
              <TrendingUp className="w-4 h-4 text-brand-400" />
            </div>
            <span className="font-bold text-slate-100 text-lg">ZerionX1</span>
          </div>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Pricing', 'Learn'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-secondary py-2 px-4 text-sm">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary py-2 px-4 text-sm">
              Start Free
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </nav>

      {/* ── Live Ticker Bar ── */}
      <div className="fixed top-16 left-0 right-0 z-40 border-b border-white/[0.06]
                      bg-dark-400/90 backdrop-blur-sm overflow-hidden h-9
                      flex items-center">

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-3 border-r border-white/[0.06]
                        shrink-0 h-full">
          {connected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
              <span className="text-2xs font-semibold text-bull">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-slate-600" />
              <span className="text-2xs text-slate-600">
                {loading ? 'Loading...' : 'Connecting'}
              </span>
            </>
          )}
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div
            ref={tickerRef}
            className="flex items-center gap-6 animate-ticker whitespace-nowrap px-4"
            style={{ width: 'max-content' }}
          >
            {/* Duplicate for seamless loop */}
            {[...ticker, ...ticker].map((item, index) => (
              <div key={index} className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-300">
                  {item.symbol}
                </span>
                <span className="text-xs tabular text-slate-400">
                  {formatPrice(item.price, item.symbol)}
                </span>
                <span className={`text-2xs font-medium flex items-center gap-0.5 ${
                  item.up ? 'text-bull' : 'text-bear'
                }`}>
                  {item.up
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />
                  }
                  {item.up ? '+' : ''}{item.changePct.toFixed(2)}%
                </span>
                <span className="text-slate-700">·</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Hero Section ── */}
      <section className="pt-40 pb-20 px-4 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute top-20 left-1/4 w-96 h-96
                        bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80
                        bg-indigo-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-brand-500/10 border border-brand-500/25 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs font-semibold text-brand-400">
              India's First AI Trading Platform with Emotion Shield
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold
                         text-slate-100 leading-tight mb-6">
            Trade Without{' '}
            <span className="gradient-text">Fear, Greed</span>
            <br />
            or FOMO
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            ZerionX1 is India's next generation AI trading platform.
            Paper trade, live trade, build algos, analyse charts with AI —
            all in one dashboard. Powered by Upstox and Gemini AI.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center
                          justify-center gap-3 mb-12">
            <Link href="/signup" className="btn-primary px-8 py-4 text-base">
              Start Trading Free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-4 text-base">
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center
                          justify-center gap-6 text-sm text-slate-500">
            {[
              { icon: Check, text: 'Free to start — no credit card' },
              { icon: Check, text: 'SEBI compliant architecture'    },
              { icon: Check, text: 'Real money trading via Upstox'  },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-bull" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Market Stats ── */}
      <section className="py-12 px-4 border-y border-white/[0.06] bg-dark-300/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-200">
                Live Crypto Markets
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real time data via Binance WebSocket
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {connected ? (
                <>
                  <Activity className="w-4 h-4 text-bull" />
                  <span className="text-xs font-semibold text-bull">
                    Live
                  </span>
                </>
              ) : (
                <RefreshCw className="w-4 h-4 text-slate-600 animate-spin" />
              )}
            </div>
          </div>

          {/* Price cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card p-4 animate-pulse">
                    <div className="h-3 w-16 bg-white/[0.05] rounded mb-3" />
                    <div className="h-5 w-24 bg-white/[0.05] rounded mb-2" />
                    <div className="h-3 w-12 bg-white/[0.05] rounded" />
                  </div>
                ))
              : ticker.map((item) => (
                  <div
                    key={item.symbol}
                    className={`glass-card p-4 border transition-all duration-300 ${
                      item.up
                        ? 'hover:border-bull/30'
                        : 'hover:border-bear/30'
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      {item.symbol}
                    </p>
                    <p className="text-sm font-bold tabular text-slate-200 mb-1">
                      {formatPrice(item.price, item.symbol)}
                    </p>
                    <div className={`flex items-center gap-0.5 text-2xs font-semibold ${
                      item.up ? 'text-bull' : 'text-bear'
                    }`}>
                      {item.up
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownRight className="w-3 h-3" />
                      }
                      {item.up ? '+' : ''}
                      {item.changePct.toFixed(2)}%
                    </div>
                  </div>
                ))
            }
          </div>

          <p className="text-center text-2xs text-slate-600 mt-4">
            India stock market data (NSE/BSE) available after connecting Upstox account.
            Crypto data is live via Binance public API.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Everything you need to trade{' '}
              <span className="gradient-text">intelligently</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              ZerionX1 combines AI, real time data and gamification
              to make professional trading accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`glass-card p-6 border ${feature.bg}
                            hover:scale-[1.02] transition-all duration-200`}
              >
                <div className={`inline-flex items-center justify-center
                                 w-10 h-10 rounded-xl bg-white/5 mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-200">
                    {feature.title}
                  </h3>
                  <span className={`text-2xs px-2 py-0.5 rounded-full
                                   font-semibold bg-white/5 ${feature.color}`}>
                    {feature.tag}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-4 bg-dark-300/50
                                        border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500">
              Start free. Upgrade when you are ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card p-6 border-2 relative ${plan.color}
                            ${plan.popular ? 'scale-[1.03]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-xs font-bold
                                     px-4 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-200 mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-100">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-500">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-bull shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className={plan.button}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
            Ready to trade without fear?
          </h2>
          <p className="text-slate-500 mb-8">
            Join thousands of traders using ZerionX1 to trade smarter.
            Start free, no credit card required.
          </p>
          <Link href="/signup" className="btn-primary px-10 py-4 text-base">
            Create Free Account
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg
                            bg-brand-500/20 border border-brand-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <span className="font-bold text-slate-400 text-sm">ZerionX1</span>
          </div>

          <div className="flex items-center gap-4">
            {['Terms', 'Privacy', 'Risk Disclaimer'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <p className="text-xs text-slate-600 text-center">
            © 2026 ZerionX1. Educational analysis only — not financial advice.
          </p>
        </div>
      </footer>

    </div>
  )
}

// ── Pricing plans data ─────────────────────────────────────────────
const PLANS = [
  {
    name:     'Free',
    price:    '₹0',
    period:   'forever',
    popular:  false,
    color:    'border-white/10',
    button:   'btn-secondary w-full',
    features: [
      'Paper trading ₹1,00,000 virtual',
      'AI chat 10 messages per day',
      'TradingView charts',
      'Basic emotion shield',
      'Leaderboard access',
    ],
  },
  {
    name:     'Starter',
    price:    '₹499',
    period:   'per month',
    popular:  true,
    color:    'border-brand-500',
    button:   'btn-primary w-full',
    features: [
      'Everything in Free',
      'Live trading via Upstox',
      'Unlimited AI chat',
      'Full emotion AI reports',
      'AI risk guardian',
      'Priority support',
    ],
  },
  {
    name:     'Pro',
    price:    '₹1,999',
    period:   'per month',
    popular:  false,
    color:    'border-white/10',
    button:   'btn-secondary w-full',
    features: [
      'Everything in Starter',
      'No code algo builder',
      'All markets crypto forex',
      'Strategy backtesting',
      'Strategy marketplace',
      'API access',
    ],
  },
]
