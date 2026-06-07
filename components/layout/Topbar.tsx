'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  TrendingUp,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TopbarProps {
  user: {
    displayName: string | null
    email:       string | null
    photoURL:    string | null
  } | null
}

// ── Market hours helper ───────────────────────────────────────────
function getMarketStatus() {
  const now  = new Date()
  const ist  = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const hour = ist.getHours()
  const min  = ist.getMinutes()
  const day  = ist.getDay() // 0=Sun, 6=Sat
  const time = hour * 60 + min

  if (day === 0 || day === 6) return { open: false, label: 'Market Closed', color: 'text-slate-500' }
  if (time >= 555 && time < 915) return { open: true,  label: 'Pre-Market',  color: 'text-warn'      }
  if (time >= 915 && time < 930) return { open: true,  label: 'Market Open', color: 'text-bull'      }
  if (time >= 930 && time < 930) return { open: true,  label: 'Market Open', color: 'text-bull'      }
  if (time >= 570 && time < 930) return { open: true,  label: 'Market Open', color: 'text-bull'      }
  return { open: false, label: 'Market Closed', color: 'text-slate-500' }
}

export default function Topbar({ user }: TopbarProps) {
  const router                          = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const dropdownRef                     = useRef<HTMLDivElement>(null)
  const marketStatus                    = getMarketStatus()

  // ── Close dropdown on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Sign out ──────────────────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast.success('Signed out successfully.')
      router.replace('/login')
    } catch {
      toast.error('Sign out failed. Try again.')
    }
  }

  // ── Avatar fallback ───────────────────────────────────────────────
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[220px] h-16 z-30
                       border-b border-white/[0.06] bg-dark-300/95 backdrop-blur-xl
                       flex items-center px-4 gap-3 transition-all duration-300">

      {/* ── Mobile Logo ── */}
      <div className="flex lg:hidden items-center gap-2 mr-auto">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg
                        bg-brand-500/20 border border-brand-500/30">
          <TrendingUp className="w-4 h-4 text-brand-400" />
        </div>
        <span className="font-bold text-slate-100">ZerionX1</span>
      </div>

      {/* ── Market Status ── */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      bg-white/[0.03] border border-white/[0.06]">
        <span className={`w-1.5 h-1.5 rounded-full ${
          marketStatus.open ? 'bg-bull animate-pulse' : 'bg-slate-600'
        }`} />
        <span className={`text-xs font-medium ${marketStatus.color}`}>
          {marketStatus.label}
        </span>
        <Clock className="w-3 h-3 text-slate-600 ml-1" />
        <span className="text-xs text-slate-600">
          {new Date().toLocaleTimeString('en-IN', {
            timeZone:     'Asia/Kolkata',
            hour:         '2-digit',
            minute:       '2-digit',
          })} IST
        </span>
      </div>

      <div className="flex-1" />

      {/* ── Search ── */}
      <div className="relative">
        {searchOpen ? (
          <input
            autoFocus
            type="text"
            placeholder="Search symbol... e.g. RELIANCE"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => { setSearchOpen(false); setSearchQuery('') }}
            className="w-48 sm:w-64 input-field py-2 text-xs"
          />
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500
                       hover:text-slate-300 hover:bg-white/[0.05] transition-all duration-150"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:block text-xs">Search symbol</span>
          </button>
        )}
      </div>

      {/* ── Notifications ── */}
      <button className="relative flex items-center justify-center w-9 h-9 rounded-lg
                         text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]
                         transition-all duration-150">
        <Bell className="w-4 h-4" />
        {/* Unread dot */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                         bg-brand-500 border-2 border-dark-300" />
      </button>

      {/* ── User Dropdown ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                     hover:bg-white/[0.05] transition-all duration-150"
        >
          {/* Avatar */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? 'User'}
              className="w-7 h-7 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30
                            flex items-center justify-center">
              <span className="text-xs font-bold text-brand-400">{initials}</span>
            </div>
          )}
          <span className="hidden sm:block text-xs font-medium text-slate-300 max-w-[100px] truncate">
            {user?.displayName ?? user?.email ?? 'Trader'}
          </span>
          <ChevronDown className={`hidden sm:block w-3 h-3 text-slate-500
                                   transition-transform duration-200 ${
                                     dropdownOpen ? 'rotate-180' : ''
                                   }`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 glass-card
                          border border-white/[0.08] rounded-xl overflow-hidden
                          shadow-card animate-slide-down z-50">

            {/* User info */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {user?.displayName ?? 'Trader'}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {user?.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                           text-sm text-slate-400 hover:text-slate-200
                           hover:bg-white/[0.05] transition-all duration-150"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>

              <Link
                href="/settings?tab=profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                           text-sm text-slate-400 hover:text-slate-200
                           hover:bg-white/[0.05] transition-all duration-150"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>

              <div className="h-px bg-white/[0.06] my-1" />

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
                           text-sm text-bear hover:bg-bear/10
                           transition-all duration-150"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
