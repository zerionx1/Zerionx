'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LineChart,
  FlaskConical,
  Zap,
  Bot,
  BarChart2,
  Briefcase,
  Brain,
  Trophy,
  BookOpen,
  BookMarked,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plug,
} from 'lucide-react'

// ── Nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    group: 'Main',
    items: [
      { href: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
      { href: '/chart',          label: 'Chart',         icon: LineChart        },
      { href: '/portfolio',      label: 'Portfolio',     icon: Briefcase        },
    ],
  },
  {
    group: 'Trading',
    items: [
      { href: '/paper-trading',  label: 'Paper Trade',   icon: FlaskConical     },
      { href: '/live-trading',   label: 'Live Trade',    icon: Zap, live: true  },
      { href: '/algo-builder',   label: 'Algo Builder',  icon: Bot              },
      { href: '/backtest',       label: 'Backtest',      icon: BarChart2        },
    ],
  },
  {
    group: 'Insights',
    items: [
      { href: '/emotion-report', label: 'Emotion AI',    icon: Brain            },
      { href: '/leaderboard',    label: 'Leaderboard',   icon: Trophy           },
      { href: '/learn',          label: 'Learn',         icon: BookOpen         },
      { href: '/journal',        label: 'Journal',       icon: BookMarked       },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/connect-broker', label: 'Connect Broker',icon: Plug             },
      { href: '/settings',       label: 'Settings',      icon: Settings         },
    ],
  },
]

export default function Sidebar() {
  const pathname    = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40
                    border-r border-white/[0.06] bg-dark-300/95 backdrop-blur-xl
                    transition-all duration-300 ${
                      collapsed ? 'w-[68px]' : 'w-[220px]'
                    }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/[0.06]
                         ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg
                          bg-brand-500/20 border border-brand-500/30 shrink-0">
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-100 text-base tracking-tight">
              ZerionX1
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-4">
              {/* Group label */}
              {!collapsed && (
                <p className="px-4 mb-1 text-2xs font-semibold text-slate-600
                               uppercase tracking-widest">
                  {group.group}
                </p>
              )}

              {group.items.map(({ href, label, icon: Icon, live }) => {
                const isActive = pathname === href ||
                  (href !== '/dashboard' && pathname.startsWith(href))

                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={`flex items-center mx-2 mb-0.5 rounded-lg
                                transition-all duration-150 group relative
                                ${collapsed
                                  ? 'justify-center p-2.5'
                                  : 'gap-3 px-3 py-2.5'
                                }
                                ${isActive
                                  ? 'bg-brand-500/15 text-brand-300'
                                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                                }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2
                                      w-0.5 h-5 bg-brand-500 rounded-r-full" />
                    )}

                    <Icon className={`shrink-0 transition-colors ${
                      collapsed ? 'w-5 h-5' : 'w-4 h-4'
                    } ${isActive ? 'text-brand-400' : ''}`} />

                    {!collapsed && (
                      <span className="text-sm font-medium flex-1">{label}</span>
                    )}

                    {/* Live badge */}
                    {!collapsed && live && (
                      <span className="flex items-center gap-1 text-2xs font-semibold
                                       text-bull bg-bull/10 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
                        LIVE
                      </span>
                    )}

                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-surface-100
                                      border border-white/10 rounded-lg text-xs text-slate-200
                                      whitespace-nowrap opacity-0 group-hover:opacity-100
                                      pointer-events-none transition-opacity duration-150 z-50">
                        {label}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`flex items-center justify-center w-full py-2 px-3 rounded-lg
                        text-slate-600 hover:text-slate-300 hover:bg-white/[0.05]
                        transition-all duration-150 ${collapsed ? '' : 'gap-2'}`}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs">Collapse</span>
                </>
              )
            }
          </button>
        </div>
      </aside>
    </>
  )
}
