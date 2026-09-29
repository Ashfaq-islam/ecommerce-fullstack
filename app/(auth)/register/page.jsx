import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Create Account | ShopStore',
  description: 'Create a ShopStore account to save your details and track your orders.',
}

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterForm />
    </AuthCard>
  )
}
