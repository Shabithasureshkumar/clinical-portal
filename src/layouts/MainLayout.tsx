import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary, PageSkeleton } from '@/components/common/States'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

/** Authenticated shell: sidebar, top bar and the routed page. */
export function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // The drawer closes through each nav link's onNavigate; only the scroll position needs resetting here.
  useEffect(() => {
    window.scrollTo({ top: 0 })
    // `pathname` is the trigger: scroll to top on every route change.
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [pathname])

  return (
    <div className="min-h-screen bg-page">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[260px] 2xl:pl-[295px]">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main id="main" tabIndex={-1} className="px-4 pb-14 pt-8 outline-none sm:px-[34px] sm:pt-[34px]">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
