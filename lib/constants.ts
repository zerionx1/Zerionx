// ── App Info ──────────────────────────────────────────────────────
export const APP_NAME        = 'ZerionX1'
export const APP_URL         = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zerionx1.vercel.app'
export const BACKEND_URL     = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'

// ── Market Hours (IST) ────────────────────────────────────────────
export const MARKET_HOURS = {
  NSE: {
    open:     { hour: 9,  minute: 15 },
    close:    { hour: 15, minute: 30 },
    preOpen:  { hour: 9,  minute: 0  },
    timezone: 'Asia/Kolkata',
  },
  CRYPTO: {
    open:  true, // 24/7
    close: false,
  },
}

// ── Trading Constants ─────────────────────────────────────────────
export const PAPER_TRADING_BALANCE = 100000   // INR 1,00,000 virtual
export const MAX_ORDERS_PER_SECOND = 10       // SEBI limit
export const DEFAULT_RISK_PERCENT  = 0.02     // 2% per trade

// ── Upstox API ────────────────────────────────────────────────────
export const UPSTOX_BASE_URL      = 'https://api.upstox.com/v2'
export const UPSTOX_AUTH_URL      = 'https://api.upstox.com/v2/login/authorization/dialog'
export const UPSTOX_TOKEN_URL     = 'https://api.upstox.com/v2/login/authorization/token'
export const UPSTOX_REDIRECT_URI  = process.env.NEXT_PUBLIC_UPSTOX_REDIRECT_URI ?? ''
export const UPSTOX_CLIENT_ID     = process.env.NEXT_PUBLIC_UPSTOX_CLIENT_ID ?? ''

// ── Public APIs ───────────────────────────────────────────────────
export const BINANCE_WS_URL       = 'wss://stream.binance.com:9443/stream'
export const BINANCE_REST_URL     = 'https://api.binance.com/api/v3'
export const COINGECKO_URL        = 'https://api.coingecko.com/api/v3'
export const TWELVE_DATA_URL      = 'https://api.twelvedata.com'

// ── Firebase Collections ──────────────────────────────────────────
export const COLLECTIONS = {
  USERS:              'users',
  BROKER_CONNECTIONS: 'broker_connections',
  PAPER_TRADES:       'paper_trades',
  LIVE_ORDERS:        'live_orders',
  ALGO_STRATEGIES:    'algo_strategies',
  EMOTION_LOG:        'emotion_log',
  JOURNAL:            'journal',
  LEADERBOARD:        'leaderboard',
}

// ── Subscription Plans ────────────────────────────────────────────
export const PLANS = {
  FREE:        'free',
  STARTER:     'starter',
  PRO:         'pro',
  INSTITUTIONAL:'institutional',
}

// ── Instrument tokens for common symbols ─────────────────────────
export const INSTRUMENTS = {
  NIFTY50:   'NSE_INDEX|Nifty 50',
  BANKNIFTY: 'NSE_INDEX|Nifty Bank',
  RELIANCE:  'NSE_EQ|INE002A01018',
  TCS:       'NSE_EQ|INE467B01029',
  HDFCBANK:  'NSE_EQ|INE040A01034',
  INFY:      'NSE_EQ|INE009A01021',
  WIPRO:     'NSE_EQ|INE075A01022',
  TATASTEEL: 'NSE_EQ|INE081A01012',
}

// ── Emotion detection thresholds ──────────────────────────────────
export const EMOTION_THRESHOLDS = {
  FOMO_CANDLE_PERCENT:    3,    // 3% move triggers FOMO check
  REVENGE_TRADE_LOSSES:   3,    // 3 consecutive losses = revenge trade warning
  OVERTRADE_DAILY_LIMIT:  10,   // 10 trades in a day = overtrading warning
  BREAK_RECOMMENDED_MINS: 30,   // Suggest 30 min break
}

// ── Risk defaults ─────────────────────────────────────────────────
export const RISK_DEFAULTS = {
  conservative: { maxPerTrade: 0.01, dailyLimit: 0.03 },
  moderate:     { maxPerTrade: 0.02, dailyLimit: 0.05 },
  aggressive:   { maxPerTrade: 0.05, dailyLimit: 0.10 },
}

// ── AI Models ─────────────────────────────────────────────────────
export const AI_MODELS = {
  GEMINI_PRIMARY: 'gemini-1.5-flash',
  GEMINI_PRO:     'gemini-1.5-pro',
  GROQ_FAST:      'llama3-8b-8192',
}

// ── Error messages ────────────────────────────────────────────────
export const ERRORS = {
  NETWORK:          'Network error. Check your internet connection.',
  UNAUTHORIZED:     'Please login to continue.',
  BROKER_NOT_CONNECTED: 'Connect your Upstox account to trade.',
  RISK_EXCEEDED:    'Trade exceeds your risk limit. Blocked for your protection.',
  MARKET_CLOSED:    'Market is closed. Orders will be queued for next session.',
  RATE_LIMIT:       'Too many requests. Please wait a moment.',
}
