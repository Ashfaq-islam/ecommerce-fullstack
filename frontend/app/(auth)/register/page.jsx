import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Request an Account | ShopStore',
  description: 'Request a ShopStore account and we will contact you with your login details.',
}

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterForm />
    </AuthCard>
  )
}
