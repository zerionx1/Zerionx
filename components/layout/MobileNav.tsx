'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LineChart,
  FlaskConical,
  Zap,
  Brain,
} from 'lucide-react'

const MOBILE_NAV = [
  { href: '/dashboard',     label: 'Home',    icon: LayoutDashboard },
  { href: '/chart',         label: 'Chart',   icon: LineChart       },
  { href: '/paper-trading', label: 'Paper',   icon: FlaskConical    },
  { href: '/live-trading',  label: 'Live',    icon: Zap, live: true },
  { href: '/emotion-report',label: 'Emotion', icon: Brain           },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                    border-t border-white/[0.06] bg-dark-300/95 backdrop-blur-xl
                    flex items-center justify-around px-2 py-2 safe-area-bottom">
      {MOBILE_NAV.map(({ href, label, icon: Icon, live }) => {
        const isActive = pathname === href ||
          (href !== '/dashboard' && pathname.startsWith(href))

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
                        transition-all duration-150 min-w-[56px] ${
              isActive
                ? 'text-brand-400'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : ''}`} />
              {live && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2
                                 rounded-full bg-bull border border-dark-300" />
              )}
            </div>
            <span className={`text-2xs font-medium ${
              isActive ? 'text-brand-400' : ''
            }`}>
              {label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-brand-500" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
