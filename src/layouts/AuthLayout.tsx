import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'

/** Unauthenticated shell used by the sign-in page. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-10">
      <main id="main" className="w-full max-w-[440px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Outlet />
      </main>
      <p className="mt-8 text-center text-[13px] text-muted">Mednevo Clinical Portal</p>
    </div>
  )
}
