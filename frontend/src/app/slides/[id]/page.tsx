'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SlideViewer } from '@/components/ui/SlideViewer';
import { slidesApi } from '@/lib/api';
import { PresentationWithSlides } from '@/types';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function PresentationPage() {
  const params = useParams();
  const router = useRouter();
  const presentationId = params.id as string;
  
  const [presentation, setPresentation] = useState<PresentationWithSlides | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (presentationId) {
      fetchPresentation();
    }
  }, [presentationId]);

  const fetchPresentation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await slidesApi.getPresentation(presentationId);
      setPresentation(data);
    } catch (err: unknown) {
      console.error('Error fetching presentation:', err);
      setError((err as any)?.response?.data?.error || 'Failed to load presentation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!presentation) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${presentation.title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await slidesApi.deletePresentation(presentation.id);
      router.push('/presentations');
    } catch (err: unknown) {
      console.error('Error deleting presentation:', err);
      setError((err as any)?.response?.data?.error || 'Failed to delete presentation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackToList = () => {
    router.push('/presentations');
  };

  const handleCreateNew = () => {
    router.push('/slides');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background pt-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-sm text-muted-foreground">Loading presentation...</p>
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-lg p-8 text-center">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Error Loading Presentation</h2>
              <p className="text-sm text-muted-foreground mb-6">{error}</p>
              <div className="flex justify-center gap-3">
                <Button onClick={fetchPresentation} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button onClick={handleBackToList} size="sm">
                  Back to Presentations
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!presentation) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background pt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-lg p-8 text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">Presentation Not Found</h2>
              <p className="text-sm text-muted-foreground mb-6">The presentation you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <Button onClick={handleBackToList} size="sm">
                Back to Presentations
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pt-16">
        {/* Header */}
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleBackToList}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                    {presentation.title}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {presentation.slides.length} slides • {new Date(presentation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCreateNew}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </Button>
                
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  {isDeleting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Viewer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SlideViewer presentation={presentation} />
        </div>
      </div>
    </ProtectedRoute>
  );
}