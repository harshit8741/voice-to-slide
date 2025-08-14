// Modern about page with glassmorphism design

import { Sparkles, Mic, FileText, Brain, Download } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 flex items-center justify-center">        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-surface border border-border mb-8">
              <Sparkles className="w-4 h-4 text-accent mr-2" />
              <span className="text-sm text-muted-foreground font-medium">Our Story & Mission</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform
              <span className="gradient-text"> Audio</span>
              <br />
              into <span className="gradient-text">Professional Slides</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing how lectures, meetings, and audio content become structured presentations 
              through AI-powered transcription and intelligent slide generation.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From recognizing the challenge of converting audio content to creating an AI-powered solution
            </p>
          </div>
          
          <div className="glass rounded-lg p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              <div className="lg:col-span-3 space-y-6">
                <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
                  <p>
                    OnEd was born from a simple yet powerful realization: countless hours of valuable audio content—
                    <span className="text-accent font-medium">lectures, meetings, interviews, and recordings</span>—
                    were locked away in audio formats, difficult to review, study, or share effectively.
                  </p>
                  <p>
                    We recognized that students, professionals, and content creators needed a way to transform their 
                    <span className="text-accent font-medium">spoken ideas into structured, professional presentations</span>. 
                    Traditional methods were time-consuming, requiring manual transcription and tedious slide creation.
                  </p>
                  <p>
                    Today, OnEd harnesses the power of <span className="text-accent font-medium">OpenAI Whisper for 
                    precise transcription</span> and <span className="text-accent font-medium">Google Gemini AI for 
                    intelligent content structuring</span>, automatically creating professional slides with proper 
                    formatting, bullet points, and PowerPoint export capabilities.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground mb-1">AI-Powered</div>
                  <div className="text-sm text-muted-foreground">Transcription</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Core Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The powerful capabilities that make audio-to-slides transformation seamless and professional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Audio Recording
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Record lectures, meetings, or any audio content with real-time waveform visualization and multi-format support.
              </p>
            </div>
            
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                AI Transcription
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced OpenAI Whisper technology converts speech to text with high accuracy across multiple audio formats.
              </p>
            </div>
            
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Smart Slides
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Google Gemini AI intelligently structures transcriptions into professional slides with titles and bullet points.
              </p>
            </div>
            
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                PowerPoint Export
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Export your generated slides to professional PowerPoint presentations with multiple theme options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How OnEd <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple 3-step process to transform your audio content into professional presentations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Record or Upload
              </h3>
              <p className="text-accent font-medium mb-3 text-sm">Audio Input</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Record live audio with our built-in recorder or upload existing audio files. 
                Supports MP3, WAV, WebM, M4A, OGG, and FLAC formats up to 50MB.
              </p>
            </div>
            
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                AI Processing
              </h3>
              <p className="text-accent font-medium mb-3 text-sm">Transcribe & Structure</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                OpenAI Whisper transcribes your audio with high accuracy, then Google Gemini AI 
                intelligently organizes the content into structured slides with titles and bullet points.
              </p>
            </div>
            
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Export & Share
              </h3>
              <p className="text-accent font-medium mb-3 text-sm">Professional Output</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review your generated slides in our viewer, then export to professional PowerPoint 
                presentations with your choice of three beautiful themes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-surface/30">        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Platform <span className="gradient-text">Capabilities</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features and specifications that make OnEd the go-to solution for audio-to-slides conversion
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="text-3xl font-bold gradient-text mb-3">6</div>
              <div className="text-sm text-muted-foreground font-medium">Audio Formats</div>
            </div>
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="text-3xl font-bold gradient-text mb-3">50MB</div>
              <div className="text-sm text-muted-foreground font-medium">Max File Size</div>
            </div>
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="text-3xl font-bold gradient-text mb-3">3</div>
              <div className="text-sm text-muted-foreground font-medium">Export Themes</div>
            </div>
            <div className="glass rounded-lg p-6 text-center hover:bg-surface/50 transition-colors">
              <div className="text-3xl font-bold gradient-text mb-3">AI</div>
              <div className="text-sm text-muted-foreground font-medium">Powered Processing</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: 'About Us - OnEd',
  description: 'Learn about OnEd\'s mission to transform audio content into professional presentations through AI-powered transcription and slide generation',
};