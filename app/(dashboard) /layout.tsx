'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Sidebar   from '@/components/layout/Sidebar'
import Topbar    from '@/components/layout/Topbar'
import MobileNav from '@/components/layout/MobileNav'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router              = useRouter()
  const [user, setUser]     = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Auth guard ───────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/login')
      } else {
        setUser(firebaseUser)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  // ── Loading screen ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
                      bg-dark-500 gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl
                        bg-brand-500/15 border border-brand-500/25">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
        </div>
        <p className="text-sm text-slate-500 animate-pulse">
          Loading ZerionX1...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-500">

      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Topbar */}
      <Topbar user={user} />

      {/* Main content area */}
      <main className="lg:pl-[220px] pt-16 pb-20 lg:pb-8 min-h-screen
                       transition-all duration-300">
        <div className="page-container animate-fade-in">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <MobileNav />

    </div>
  )
}
