import { Link } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { ROUTES } from '@/constants/routes'

interface ErrorPageProps {
  code: string
  title: string
  message: string
}

function ErrorPage({ code, title, message }: ErrorPageProps) {
  return (
    <Card className="mx-auto mt-10 max-w-[560px] rounded-[22px] p-10 text-center">
      <p className="text-[56px] font-bold leading-none tracking-[-0.03em] text-brand-500">{code}</p>
      <h1 className="mt-4 text-[24px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
      <p className="mt-3 text-[15px] text-muted">{message}</p>
      <Link
        to={ROUTES.home}
        className="mt-7 inline-flex h-11 items-center justify-center rounded-[12px] bg-linear-to-b from-[#22d0ee] to-[#0cbfe3] px-6 text-[15px] font-semibold text-white shadow-brand"
      >
        Back to Home
      </Link>
    </Card>
  )
}

export function NotFoundPage() {
  return <ErrorPage code="404" title="Page not found" message="The page you are looking for does not exist or may have moved." />
}

export function ForbiddenPage() {
  return <ErrorPage code="403" title="You do not have access" message="Your role does not include this area. Ask a clinic administrator if you need access." />
}
