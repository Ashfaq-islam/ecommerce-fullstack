import { Suspense } from 'react'

import AuthCard from '@/components/auth/AuthCard'
import AuthFormSkeleton from '@/components/auth/AuthFormSkeleton'
import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Sign In | ShopStore',
  description: 'Sign in to your ShopStore account to track orders and check out faster.',
}

export default function LoginPage() {
  return (
    <AuthCard>
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
