'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { slidesApi } from '@/lib/api';
import { Presentation } from '@/types';
import { Plus, FileText, Calendar, ChevronRight, AlertCircle } from 'lucide-react';

export default function PresentationsPage() {
  const router = useRouter();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await slidesApi.getUserPresentations();
      setPresentations(data);
    } catch (err: unknown) {
      console.error('Error fetching presentations:', err);
      setError((err as any)?.response?.data?.error || 'Failed to load presentations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/slides');
  };

  const handleViewPresentation = (id: string) => {
    router.push(`/slides/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-sm text-muted-foreground">Loading presentations...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-lg p-8 text-center">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Error Loading Presentations</h2>
              <p className="text-sm text-muted-foreground mb-6">{error}</p>
              <div className="flex justify-center gap-3">
                <Button onClick={fetchPresentations} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button onClick={handleCreateNew} size="sm">
                  Create New Presentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                My Presentations
              </h1>
              <p className="text-sm text-muted-foreground">
                {presentations.length === 0 
                  ? 'No presentations yet'
                  : `${presentations.length} presentation${presentations.length === 1 ? '' : 's'}`
                }
              </p>
            </div>
            <Button
              onClick={handleCreateNew}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Presentation</span>
            </Button>
          </div>

          {presentations.length === 0 ? (
            /* Empty state */
            <div className="glass rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-3">
                No presentations yet
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Transform your audio recordings into professional slide presentations using AI. 
                Get started by creating your first presentation.
              </p>
              <Button
                onClick={handleCreateNew}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Presentation</span>
              </Button>
            </div>
          ) : (
            /* Presentations grid */
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  className="glass rounded-lg p-4 hover:bg-surface/50 transition-colors cursor-pointer group"
                  onClick={() => handleViewPresentation(presentation.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 flex-1">
                      {presentation.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 ml-2" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {presentation.transcription.length > 100 
                      ? `${presentation.transcription.substring(0, 100)}...`
                      : presentation.transcription
                    }
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{new Date(presentation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}