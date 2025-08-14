'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { slidesApi } from '@/lib/api';
import api from '@/lib/api';
import { Mic, Upload, FileAudio, Pause, Check, X, Youtube } from 'lucide-react';

type ProcessingStep = 'idle' | 'recording' | 'uploaded' | 'youtube-input' | 'transcribing' | 'generating' | 'complete';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState<string>('');
  const [audioData, setAudioData] = useState<number[]>(new Array(60).fill(0));
  const [showSlideGeneration, setShowSlideGeneration] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<{title: string, thumbnail?: string} | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up audio analysis for visualization
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        const recordingBlob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(recordingBlob);
        setStep('uploaded');
        setAudioData(new Array(60).fill(0));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStep('recording');
      setRecordingDuration(0);

      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Start audio visualization
      visualizeAudio();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check your permissions.');
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      if (!isRecording || !analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Convert to bars for visualization
      const bars = 60;
      const barWidth = Math.floor(bufferLength / bars);
      const newAudioData = [];

      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < barWidth; j++) {
          sum += dataArray[i * barWidth + j];
        }
        const average = sum / barWidth;
        newAudioData.push(average / 255); // Normalize to 0-1
      }

      setAudioData(newAudioData);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setStep('uploaded');
      setError(null);
    } else {
      setError('Please select a valid audio file');
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setError(null);
    setStep('transcribing');
    setProgress(20);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 80) return prev + 10;
          return prev;
        });
      }, 2000);

      setTimeout(() => {
        setStep('generating');
        setProgress(90);
      }, 8000);

      const response = await slidesApi.generateSlidesFromYoutube(youtubeUrl, title.trim() || undefined);
      
      clearInterval(progressInterval);
      setProgress(100);
      setStep('complete');

      setTimeout(() => {
        router.push(`/slides/${response.presentation.id}`);
      }, 1500);

    } catch (err: unknown) {
      console.error('Error processing YouTube video:', err);
      setError((err as any)?.response?.data?.error || 'Failed to process YouTube video. Please try again.');
      setStep('youtube-input');
      setProgress(0);
    }
  };

  const transcribeOnly = async () => {
    const fileToProcess = audioFile || (recordedBlob ? new File([recordedBlob], 'recording.webm', { type: 'audio/webm' }) : null);
    
    if (!fileToProcess) {
      setError('No audio file to process');
      return;
    }

    setError(null);
    setStep('transcribing');
    setProgress(50);

    try {
      const formData = new FormData();
      formData.append('audio', fileToProcess);

      const response = await api.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setTranscription(response.data.transcription);
        setProgress(100);
        setStep('idle');
        setShowSlideGeneration(true);
      } else {
        throw new Error('Transcription failed');
      }
    } catch (err: unknown) {
      console.error('Error transcribing audio:', err);
      setError((err as any)?.response?.data?.error || 'Failed to transcribe audio. Please try again.');
      setStep('uploaded');
      setProgress(0);
    }
  };

  const handleGenerateSlides = async () => {
    const fileToProcess = audioFile || (recordedBlob ? new File([recordedBlob], 'recording.webm', { type: 'audio/webm' }) : null);
    
    if (!fileToProcess) {
      setError('No audio file to process');
      return;
    }

    setError(null);
    setStep('transcribing');
    setProgress(20);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 80) return prev + 10;
          return prev;
        });
      }, 2000);

      setTimeout(() => {
        setStep('generating');
        setProgress(90);
      }, 5000);

      const response = await slidesApi.generateSlidesFromAudio(fileToProcess, title.trim() || undefined);
      
      clearInterval(progressInterval);
      setProgress(100);
      setStep('complete');

      // Small delay to show completion, then redirect
      setTimeout(() => {
        router.push(`/slides/${response.presentation.id}`);
      }, 1500);

    } catch (err: unknown) {
      console.error('Error generating slides:', err);
      setError((err as any)?.response?.data?.error || 'Failed to generate slides. Please try again.');
      setStep('uploaded');
      setProgress(0);
    }
  };

  const resetForm = () => {
    setStep('idle');
    setTitle('');
    setError(null);
    setIsRecording(false);
    setRecordingDuration(0);
    setAudioFile(null);
    setRecordedBlob(null);
    setProgress(0);
    setTranscription('');
    setShowSlideGeneration(false);
    setAudioData(new Array(60).fill(0));
    setYoutubeUrl('');
    setVideoInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentStepText = () => {
    switch (step) {
      case 'recording': return 'Recording audio...';
      case 'transcribing': return 'Transcribing audio...';
      case 'generating': return 'Generating slides with AI...';
      case 'complete': return 'Slides generated successfully!';
      default: return '';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pt-20 pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Processing States */}
            {(step === 'transcribing' || step === 'generating' || step === 'complete') && (
              <div className="glass rounded-lg p-8 mb-8">
                <div className="text-center">
                  <div className="mb-6">
                    {step === 'complete' ? (
                      <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <LoadingSpinner size="lg" className="mb-4" />
                    )}
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                      {getCurrentStepText()}
                    </h2>
                    <p className="text-muted-foreground">
                      {step === 'transcribing' && 'Converting your audio to text...'}
                      {step === 'generating' && 'Creating slides from your content...'}
                      {step === 'complete' && 'Redirecting to your new presentation...'}
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{progress}% complete</p>
                </div>
              </div>
            )}

            {/* Main Interface */}
            {(step === 'idle' || step === 'recording' || step === 'uploaded' || step === 'youtube-input') && (
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                  How can I help you today?
                </h1>
                <p className="text-base text-muted-foreground max-w-lg mx-auto">
                  Record your voice, upload audio, paste YouTube URL, or transcribe content to create presentations
                </p>
              </div>
            )}

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

            {/* Main Form */}
            {(step === 'idle' || step === 'recording' || step === 'uploaded' || step === 'youtube-input') && (
              <div className="glass rounded-lg p-6 mb-8">
                {/* Title Input */}
                <div className="mb-6">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Presentation Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your presentation..."
                    className="w-full px-3 py-2 bg-surface border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-foreground placeholder:text-muted-foreground text-sm"
                    disabled={step === 'recording'}
                  />
                </div>

                {/* Audio Input Section */}
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  {step === 'idle' && (
                    <>
                      <div className="mb-6">
                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Mic className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2">
                          Record or Upload Audio
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Choose how you'd like to provide your audio content
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={startRecording}
                          className="flex items-center space-x-2"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Start Recording</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Audio File</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setStep('youtube-input')}
                          className="flex items-center space-x-2"
                        >
                          <Youtube className="w-4 h-4" />
                          <span>YouTube Video</span>
                        </Button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </>
                  )}

                  {step === 'recording' && (
                    <div>
                      <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-4 h-4 bg-destructive rounded-full animate-pulse" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Recording... {formatDuration(recordingDuration)}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Speak clearly about your topic. Click stop when finished.
                      </p>
                      
                      {/* Waveform Visualization */}
                      <div className="flex items-end justify-center space-x-1 h-16 mb-6">
                        {audioData.slice(0, 40).map((value, index) => (
                          <div
                            key={index}
                            className="bg-accent rounded-full transition-all duration-75"
                            style={{
                              height: `${Math.max(4, value * 40)}px`,
                              width: '3px',
                              opacity: 0.6 + (value * 0.4),
                            }}
                          />
                        ))}
                      </div>
                      
                      <Button
                        onClick={stopRecording}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Pause className="w-5 h-5" />
                        <span>Stop Recording</span>
                      </Button>
                    </div>
                  )}

                  {step === 'uploaded' && (
                    <div>
                      <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileAudio className="w-8 h-8 text-success" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Audio Ready
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {audioFile 
                          ? `File: ${audioFile.name}`
                          : `Recording: ${formatDuration(recordingDuration)}`
                        }
                      </p>
                      <div className="flex gap-4 justify-center flex-wrap">
                        <Button
                          onClick={transcribeOnly}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <span>Transcribe Only</span>
                        </Button>
                        <Button
                          onClick={handleGenerateSlides}
                          className="flex items-center space-x-2 px-8 py-3"
                        >
                          <span>Generate Slides</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={resetForm}
                          className="flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Start Over</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 'youtube-input' && (
                    <div>
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Youtube className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        YouTube Video URL
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Paste a YouTube video URL to extract audio and generate slides
                      </p>
                      
                      <div className="mb-6">
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-3 bg-surface border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="flex gap-4 justify-center flex-wrap">
                        <Button
                          onClick={handleYoutubeSubmit}
                          disabled={!youtubeUrl.trim()}
                          className="flex items-center space-x-2 px-8 py-3"
                        >
                          <span>Generate Slides</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={resetForm}
                          className="flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Back</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transcription Result */}
            {transcription && (
              <div className="glass rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Transcription:</h2>
                  <div className="flex gap-2">
                    {showSlideGeneration && (
                      <Button
                        onClick={() => {
                          // Convert transcription to slides
                          setError(null);
                          setStep('generating');
                          setProgress(50);
                          
                          // Use the transcription to generate slides
                          slidesApi.generateSlides({
                            transcription: transcription,
                            title: title.trim() || 'Generated Presentation'
                          }).then((response) => {
                            setProgress(100);
                            setStep('complete');
                            setTimeout(() => {
                              router.push(`/slides/${response.presentation.id}`);
                            }, 1500);
                          }).catch((err) => {
                            console.error('Error generating slides:', err);
                            setError((err as any)?.response?.data?.error || 'Failed to generate slides. Please try again.');
                            setStep('idle');
                            setProgress(0);
                          });
                        }}
                        className="flex items-center space-x-2"
                      >
                        <span>Create Slides</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="flex items-center space-x-2"
                    >
                      <span>Start Over</span>
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">{transcription}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            {step === 'idle' && !transcription && (
              <div className="glass rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  How it works:
                </h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Record your voice or upload an audio file with your content</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>AI automatically transcribes your audio to text</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Choose to transcribe only or automatically generate structured slides</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Review and present your slides with the interactive viewer</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
    </ProtectedRoute>
  );
}
