'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { slidesApi } from '@/lib/api';
import { GenerateSlidesRequest } from '@/types';

export default function SlidesPage() {
  const [transcription, setTranscription] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerateSlides = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transcription.trim()) {
      setError('Please enter a transcription');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: GenerateSlidesRequest = {
        transcription: transcription.trim(),
        title: title.trim() || undefined
      };

      const response = await slidesApi.generateSlides(request);
      
      // Redirect to the presentation viewer
      router.push(`/slides/${response.presentation.id}`);
    } catch (err: unknown) {
      console.error('Error generating slides:', err);
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response && 'data' in err.response &&
        typeof err.response.data === 'object' && err.response.data && 'error' in err.response.data
        ? (err.response.data as { error: string }).error
        : 'Failed to generate slides. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewPresentations = () => {
    router.push('/presentations');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Generate Slides from Transcription
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Transform your transcribed content into engaging presentation slides using AI
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-destructive mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="glass rounded-lg p-6 mb-8">
              <form onSubmit={handleGenerateSlides} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Presentation Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your presentation..."
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-foreground placeholder:text-muted-foreground"
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label htmlFor="transcription" className="block text-sm font-medium text-foreground mb-2">
                    Transcription *
                  </label>
                  <textarea
                    id="transcription"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="Paste your transcription here..."
                    rows={12}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors resize-y text-foreground placeholder:text-muted-foreground"
                    disabled={isGenerating}
                    required
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isGenerating || !transcription.trim()}
                  className="flex-1 sm:flex-none px-8 py-3 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating Slides...
                    </>
                  ) : (
                    'Generate Slides'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleViewPresentations}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-none px-6 py-3"
                >
                  View My Presentations
                </Button>
              </div>
            </form>
          </div>

            <div className="glass rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                How it works:
              </h2>
              <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Paste your transcribed text in the box above</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AI analyzes the content and creates structured slides</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Each slide gets a title and bullet points with key information</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Navigate through your slides with an interactive viewer</span>
              </li>
              </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}