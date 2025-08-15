'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      router.push(`/login?error=${error}`);
      return;
    }

    if (token) {
      // Store the token and get user data
      localStorage.setItem('token', token);
      
      // Fetch user data with the token and update auth state
      import('@/lib/api').then(({ authApi }) => {
        return authApi.getCurrentUser();
      }).then((userData) => {
        // Use the login function with token and user data
        login(token, userData);
        router.push('/dashboard');
      }).catch((err) => {
        console.error('Failed to get user data:', err);
        router.push('/login?error=auth_failed');
      });
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4 mx-auto" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}