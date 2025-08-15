// Shared authentication form component for login and signup

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleAuthButton } from '@/components/ui/GoogleAuthButton';
import { loginSchema, signupSchema, LoginFormData, SignupFormData } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const isLogin = mode === 'login';
  const schema = isLogin ? loginSchema : signupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    setLoading(true);
    try {
      const response = isLogin 
        ? await authApi.login(data as LoginFormData)
        : await authApi.signup(data as SignupFormData);

      if (response.success && response.token && response.user) {
        login(response.token, response.user);
        toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
        router.push('/');
      } else {
        toast.error(response.message || 'Authentication failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response && 'data' in error.response &&
        typeof error.response.data === 'object' && error.response.data && 'message' in error.response.data
        ? (error.response.data as { message: string }).message
        : 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-border/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to continue your journey' : 'Start your learning adventure today'}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    error={(!isLogin && 'firstName' in errors) ? (errors as { firstName?: { message?: string } }).firstName?.message : undefined}
                    {...register('firstName' as keyof (LoginFormData | SignupFormData))}
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    error={(!isLogin && 'lastName' in errors) ? (errors as { lastName?: { message?: string } }).lastName?.message : undefined}
                    {...register('lastName' as keyof (LoginFormData | SignupFormData))}
                  />
                </div>
              )}
              
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                error={errors?.email?.message as string}
                {...register('email')}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors?.password?.message as string}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleAuthButton 
                text={isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                isLoading={loading}
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
              <Link
                href={isLogin ? '/signup' : '/login'}
                className="font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}