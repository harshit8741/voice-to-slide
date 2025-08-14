// Signup page component

import { AuthForm } from '@/components/auth/AuthForm';

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}

export const metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
};