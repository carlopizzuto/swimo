import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function RootPage() {
  // Server-side redirect to splash screen
  redirect(ROUTES.SPLASH)
} 