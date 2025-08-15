'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PresentationWithSlides, Slide } from '@/types';
import { Button } from './Button';
import { ExportButton } from './ExportButton';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface SlideViewerProps {
  presentation: PresentationWithSlides;
  className?: string;
}

// Slide thumbnail component
const SlideThumbnail: React.FC<{
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ slide, index, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer transition-colors rounded-sm p-2 border text-left
        ${isActive 
          ? 'bg-accent/10 border-accent' 
          : 'bg-background border-border hover:bg-surface/50'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`text-xs font-medium px-1 py-0.5 rounded-sm ${
          isActive ? 'bg-accent text-white' : 'bg-surface text-muted-foreground'
        }`}>
          {index + 1}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className={`text-xs font-medium line-clamp-2 leading-tight ${
          isActive ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {slide.title}
        </h3>
        <div className="space-y-0.5">
          {slide.bulletPoints.slice(0, 2).map((point: string, pointIndex: number) => (
            <div key={pointIndex} className="flex items-start gap-1">
              <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
              <p className="text-xs text-muted-foreground/80 line-clamp-1 leading-tight">
                {point.length > 30 ? `${point.substring(0, 30)}...` : point}
              </p>
            </div>
          ))}
          {slide.bulletPoints.length > 2 && (
            <p className="text-xs text-muted-foreground/60 ml-1.5">
              +{slide.bulletPoints.length - 2} more
            </p>
          )}
          {slide.keyTakeaway && (
            <div className="mt-1 pt-1 border-t border-border/50">
              <p className="text-xs text-accent/80 line-clamp-1 leading-tight">
                💡 {slide.keyTakeaway.length > 35 ? `${slide.keyTakeaway.substring(0, 35)}...` : slide.keyTakeaway}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SlideViewer: React.FC<SlideViewerProps> = ({ 
  presentation, 
  className = '' 
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = presentation.slides.sort((a, b) => a.slideOrder - b.slideOrder);
  const currentSlide = slides[currentSlideIndex];

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => 
      prev < slides.length - 1 ? prev + 1 : prev
    );
  }, [slides.length]);

  const goToPreviousSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => 
      prev > 0 ? prev - 1 : prev
    );
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextSlide();
          break;
        case 'Home':
          event.preventDefault();
          setCurrentSlideIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setCurrentSlideIndex(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, goToNextSlide, goToPreviousSlide]);

  if (!slides.length) {
    return (
      <div className={`bg-surface border border-border rounded-md p-6 text-center ${className}`}>
        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-base font-semibold text-foreground mb-2">No Slides Available</h2>
        <p className="text-xs text-muted-foreground">This presentation doesn&apos;t have any slides yet.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 ${className}`}>
      {/* Sidebar - Slide Navigation */}
      <div className="bg-surface border border-border rounded-md p-3 h-fit max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-160px)] overflow-hidden order-2 lg:order-1">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Slides</span>
          <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-sm">
            {slides.length}
          </span>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[200px] lg:max-h-[calc(100vh-300px)]">
          {slides.map((slide, index) => (
            <SlideThumbnail
              key={slide.id}
              slide={slide}
              index={index}
              isActive={index === currentSlideIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 order-1 lg:order-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-sm">
              {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>
          <ExportButton 
            presentationId={presentation.id}
            presentationTitle={presentation.title}
          />
        </div>

        {/* Slide Content */}
        <div className="bg-surface border border-border rounded-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 leading-tight">
            {currentSlide.title}
          </h2>
          
          <div className="space-y-2 sm:space-y-3 mb-4">
            {currentSlide.bulletPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 bg-accent rounded-full mt-2 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed text-sm">{point}</p>
              </div>
            ))}
          </div>

          {/* Key Takeaway */}
          {currentSlide.keyTakeaway && (
            <div className="bg-accent/10 border border-accent/20 rounded-md p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-xs font-medium text-accent uppercase tracking-wide">Key Takeaway</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{currentSlide.keyTakeaway}</p>
            </div>
          )}

          {/* Image Idea */}
          {currentSlide.imageIdea && (
            <div className="bg-surface border border-border rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visual Suggestion</span>
              </div>
              <p className="text-xs text-muted-foreground italic">{currentSlide.imageIdea}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            onClick={goToPreviousSlide}
            disabled={currentSlideIndex === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <div className="flex items-center gap-1 order-first sm:order-none">
            {slides.slice(0, 10).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlideIndex
                    ? 'bg-accent'
                    : 'bg-muted-foreground hover:bg-accent/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
            {slides.length > 10 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{slides.length - 10}
              </span>
            )}
          </div>

          <Button
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Transcription Section */}
        <div className="bg-surface border border-border rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3 h-3 text-accent" />
            <h3 className="text-xs font-semibold text-foreground">Original Transcription</h3>
            <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-sm">
              {presentation.transcription.length} chars
            </span>
          </div>
          <div className="bg-background border border-border rounded-sm p-3 max-h-60 overflow-y-auto">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {presentation.transcription}
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Use ← → arrow keys to navigate slides
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlideViewer;