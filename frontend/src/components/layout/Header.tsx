// Modern header navigation with glassmorphism design

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    ...(user ? [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'My Presentations', href: '/presentations' }
    ] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-6 h-6 bg-gradient-to-br from-accent to-blue-600 rounded-md flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                OnEd
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-surface"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-surface border border-border">
                  <div className="w-5 h-5 bg-gradient-to-br from-accent to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-xs text-foreground font-medium">
                    {user.firstName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-xs bg-surface border-border hover:bg-surface-hover"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs bg-surface border-border hover:bg-surface-hover">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-xs bg-accent hover:bg-accent-hover">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-surface transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/50">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-muted/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 pb-3 border-t border-border/50">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center px-3 py-2 rounded-lg bg-muted/50">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-foreground font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full bg-muted/30 border-border hover:bg-muted/50">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="w-full bg-accent hover:bg-accent-hover">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}