// Login page component

import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  return <AuthForm mode="login" />;
}

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
};