import { auth } from '@/lib/firebase'
import { BACKEND_URL, ERRORS } from '@/lib/constants'

// ── Base fetch with Firebase auth token ───────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const user = auth.currentUser

  // Get Firebase ID token for auth
  const token = user ? await user.getIdToken() : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle non-OK responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? `HTTP ${response.status}`)
  }

  return response.json()
}

// ── Auth API ──────────────────────────────────────────────────────
export const authAPI = {
  exchangeUpstoxToken: (code: string) =>
    apiFetch('/auth/upstox-token', {
      method: 'POST',
      body:   JSON.stringify({ code }),
    }),
}

// ── Market API ────────────────────────────────────────────────────
export const marketAPI = {
  getQuote: (symbol: string) =>
    apiFetch<{ price: number; change: number; changePct: number }>(
      `/market/quote?symbol=${symbol}`
    ),

  getHistory: (symbol: string, interval: string, from: string, to: string) =>
    apiFetch(
      `/market/history?symbol=${symbol}&interval=${interval}&from=${from}&to=${to}`
    ),
}

// ── Orders API ────────────────────────────────────────────────────
export const ordersAPI = {
  placeOrder: (order: {
    symbol:          string
    transactionType: 'BUY' | 'SELL'
    quantity:        number
    orderType:       'MARKET' | 'LIMIT' | 'SL' | 'SL-M'
    price?:          number
    triggerPrice?:   number
    product:         'CNC' | 'MIS' | 'NRML'
  }) =>
    apiFetch('/orders/place', {
      method: 'POST',
      body:   JSON.stringify(order),
    }),

  cancelOrder: (orderId: string) =>
    apiFetch('/orders/cancel', {
      method: 'POST',
      body:   JSON.stringify({ orderId }),
    }),

  getOrders: () =>
    apiFetch('/orders/all'),
}

// ── Portfolio API ─────────────────────────────────────────────────
export const portfolioAPI = {
  getHoldings: () =>
    apiFetch('/portfolio/holdings'),

  getPositions: () =>
    apiFetch('/portfolio/positions'),
}

// ── Paper Trading API ─────────────────────────────────────────────
export const paperAPI = {
  placeOrder: (order: {
    symbol:          string
    symbolName:      string
    transactionType: 'BUY' | 'SELL'
    quantity:        number
    price:           number
  }) =>
    apiFetch('/paper/order', {
      method: 'POST',
      body:   JSON.stringify(order),
    }),

  getPortfolio: () =>
    apiFetch('/paper/portfolio'),
}

// ── AI API ────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (message: string, context?: object) =>
    apiFetch<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body:   JSON.stringify({ message, context }),
    }),

  analyzeChart: (imageBase64: string, mimeType: string) =>
    apiFetch<{ analysis: string }>('/ai/analyze-chart', {
      method: 'POST',
      body:   JSON.stringify({ imageBase64, mimeType }),
    }),
}

// ── Backtest API ──────────────────────────────────────────────────
export const backtestAPI = {
  run: (strategyId: string, symbol: string, from: string, to: string) =>
    apiFetch('/backtest/run', {
      method: 'POST',
      body:   JSON.stringify({ strategyId, symbol, from, to }),
    }),
}
