'use client';

import { useState, useRef } from 'react';
import { Mic, Check, X, Upload, FileAudio } from 'lucide-react';
import api from '@/lib/api';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<number[]>(new Array(60).fill(0));
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up audio analysis
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start audio visualization
      visualizeAudio();

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
        
        // Create blob from recorded chunks
        const recordingBlob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(recordingBlob);
        setHasRecording(true);
        setAudioData(new Array(60).fill(0));
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file);
      setHasRecording(true);
      setTranscription(''); // Clear any previous transcription
    } else {
      alert('Please select a valid audio file');
    }
  };

  const transcribeAudio = async () => {
    const audioToTranscribe = uploadedFile || recordedBlob;
    
    if (!audioToTranscribe) {
      console.error('No audio to transcribe');
      return;
    }

    setIsTranscribing(true);
    setTranscription('');

    try {
      const formData = new FormData();
      
      if (uploadedFile) {
        formData.append('audio', uploadedFile);
      } else if (recordedBlob) {
        // Create a file from the blob for better naming
        const audioFile = new File([recordedBlob], 'recording.webm', { type: 'audio/webm' });
        formData.append('audio', audioFile);
      }

      const response = await api.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setTranscription(response.data.transcription);
      } else {
        throw new Error('Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscription('Error: Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const confirmRecording = () => {
    transcribeAudio();
  };

  const cancelRecording = () => {
    setHasRecording(false);
    setDuration(0);
    setRecordedBlob(null);
    setUploadedFile(null);
    setTranscription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startNewRecording = () => {
    setHasRecording(false);
    setDuration(0);
    setRecordedBlob(null);
    setUploadedFile(null);
    setTranscription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    startRecording();
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        
        {/* Main Title */}
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How can I help you today?
          </h1>
          <p className="text-lg text-gray-400">
            Ask me anything or start a conversation with your voice
          </p>
        </div>

        {/* Voice Input Container */}
        <div className="w-full max-w-2xl">
          
          {/* File Upload Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* Upload Button */}
          {!isRecording && !hasRecording && !isTranscribing && (
            <div className="flex justify-center mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Audio File</span>
              </button>
            </div>
          )}
          
          {/* Voice Input Field */}
          <div className="relative">
            <div className={`w-full min-h-[60px] bg-[#1a1f2e] border-2 rounded-2xl shadow-lg transition-all duration-200 ${
              isRecording 
                ? 'border-blue-500 shadow-blue-500/20' 
                : hasRecording
                ? 'border-green-500 shadow-green-500/20'
                : isTranscribing
                ? 'border-yellow-500 shadow-yellow-500/20'
                : 'border-gray-700 hover:border-gray-600'
            } flex items-center px-6`}>
              
              {/* Default State */}
              {!isRecording && !hasRecording && !isTranscribing && (
                <div className="flex items-center space-x-4 w-full">
                  <Mic className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-base">Speak your message...</span>
                </div>
              )}

              {/* Transcribing State */}
              {isTranscribing && (
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-base">Transcribing audio...</span>
                </div>
              )}

              {/* Recording State */}
              {isRecording && (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-base">Listening...</span>
                  </div>
                  <span className="text-sm text-gray-400 font-mono">
                    {formatDuration(duration)}
                  </span>
                </div>
              )}

              {/* Waveform Visualization */}
              {isRecording && (
                <div className="absolute inset-x-6 bottom-2 flex items-end justify-center space-x-0.5 h-6">
                  {audioData.slice(0, 40).map((value, index) => (
                    <div
                      key={index}
                      className="bg-blue-400 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(2, value * 20)}px`,
                        width: '2px',
                        opacity: 0.6 + (value * 0.4),
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Recording Complete State */}
              {hasRecording && !isTranscribing && (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    {uploadedFile ? (
                      <>
                        <FileAudio className="w-5 h-5 text-green-400" />
                        <span className="text-white text-base">
                          File uploaded: {uploadedFile.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-white text-base">
                          Recording complete ({formatDuration(duration)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Voice Input Button */}
            {!hasRecording && !isTranscribing && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {/* Action Buttons for Recording Complete */}
            {hasRecording && !isTranscribing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button
                  onClick={cancelRecording}
                  className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all duration-200"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
                {!uploadedFile && (
                  <button
                    onClick={startNewRecording}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center transition-all duration-200"
                    title="Record again"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={confirmRecording}
                  className="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 flex items-center justify-center transition-all duration-200"
                  title="Transcribe"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Transcription Result */}
          {transcription && (
            <div className="mt-6 p-4 bg-[#1a1f2e] border border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-300">Transcription:</h3>
                <button
                  onClick={cancelRecording}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Start Over
                </button>
              </div>
              <p className="text-white whitespace-pre-wrap">{transcription}</p>
            </div>
          )}

          {/* Helper Text */}
          <div className="mt-4 text-center">
            {!isRecording && !hasRecording && !isTranscribing && !transcription && (
              <p className="text-sm text-gray-500">
                Click the microphone to start recording or upload an audio file
              </p>
            )}
            {isRecording && (
              <p className="text-sm text-blue-400 animate-pulse">
                Speak clearly and click the microphone when finished
              </p>
            )}
            {hasRecording && !isTranscribing && (
              <p className="text-sm text-gray-400">
                {uploadedFile ? 'Click the check mark to transcribe your file' : 'Review your recording and click the check mark to transcribe'}
              </p>
            )}
            {isTranscribing && (
              <p className="text-sm text-yellow-400 animate-pulse">
                Please wait while we transcribe your audio...
              </p>
            )}
          </div>
        </div>

        {/* Example Prompts */}
        {!isRecording && !hasRecording && !isTranscribing && !transcription && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
            <div className="p-4 border border-gray-700 bg-[#1a1f2e] rounded-xl hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="font-medium text-white mb-2">Write & plan</h3>
              <p className="text-sm text-gray-400">Help me write an email to my team</p>
            </div>
            <div className="p-4 border border-gray-700 bg-[#1a1f2e] rounded-xl hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="font-medium text-white mb-2">Reason</h3>
              <p className="text-sm text-gray-400">Help me think through a complex decision</p>
            </div>
            <div className="p-4 border border-gray-700 bg-[#1a1f2e] rounded-xl hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="font-medium text-white mb-2">Create</h3>
              <p className="text-sm text-gray-400">Help me brainstorm ideas for a project</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 py-4 px-6 text-center">
        <p className="text-xs text-gray-500">
          Voice conversations may be recorded for quality and training purposes
        </p>
      </div>
    </div>
  );
}