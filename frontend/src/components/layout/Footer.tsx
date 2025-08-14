// Modern footer with glassmorphism design

import Link from 'next/link';
import { Mail, Phone, MapPin, Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background border-t border-border/50">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <Link href="/" className="text-3xl font-bold gradient-text">
                OnEd
              </Link>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
              Pioneering the future of education through AI-powered personalization 
              and cutting-edge learning technologies.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center mr-3">
                  <Mail className="h-4 w-4" />
                </div>
                <span>hello@oned.com</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-6">
              Platform
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-accent transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-accent transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-6">
              Resources
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <p className="text-muted-foreground">
              © {currentYear} OnEd. Transforming education with AI. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-6 lg:mt-0">
              <a 
                href="#" 
                className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-all"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-all"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-all"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}