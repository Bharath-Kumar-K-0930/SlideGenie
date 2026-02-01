'use client';

import { useState, useEffect } from 'react';
import { apiClient, GenerateRequest, GenerateResponse } from '@/lib/api';
import Image from 'next/image';

export default function Home() {
  // State
  const [text, setText] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [type, setType] = useState<'pptx' | 'pdf'>('pptx');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<GenerateResponse | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Handlers
  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate slides.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: GenerateRequest = {
        text,
        slideCount,
        type
      };

      const response = await apiClient.generatePresentation(payload);

      if (response.status === 'success' && response.data) {
        setSuccess(response);
        triggerDownload(response.data.fileBase64, response.data.filename, response.data.contentType);
      } else {
        setError(response.message || 'An unknown error occurred.');
      }
    } catch (err: any) {
      // Fallback error message
      setError(err?.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (base64Data: string, filename: string, contentType: string) => {
    const link = document.createElement('a');
    link.href = `data:${contentType};base64,${base64Data}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen relative">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-8 right-8 z-50 p-4 rounded-full glass hover:scale-110 smooth-transition shadow-lg"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16 fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                src="/logo.png"
                alt="SlideGenie AI Logo"
                width={100}
                height={100}
                className="drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight gradient-text mb-6">
              SlideGenie AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into stunning presentations in seconds with the power of AI
            </p>
          </header>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Form */}
            <div className="glass rounded-3xl p-8 md:p-10 space-y-8 scale-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Create Your Presentation</h2>
                <p className="text-gray-600">Enter your content and let AI do the magic ✨</p>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Your Content
                  <span className="text-gray-400 font-normal ml-2">({text.length}/2000 chars)</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.substring(0, 2000))}
                  className="w-full h-56 p-5 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none smooth-transition resize-none text-gray-800 text-lg"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                  placeholder="Paste your notes, article, or topic idea here...

Example: 'The future of renewable energy, including solar power advancements, wind energy innovations, and sustainable practices for 2024.'"
                  disabled={loading}
                />
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Slide Count */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Number of Slides: <span className="text-cyan-600 text-xl">{slideCount}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={slideCount}
                    onChange={(e) => setSlideCount(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-cyan-200 to-cyan-400 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    disabled={loading}
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>1 slide</span>
                    <span>15 slides</span>
                  </div>
                </div>

                {/* Type Toggle */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Output Format</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setType('pptx')}
                      className={`py-4 px-6 text-base font-semibold rounded-xl smooth-transition ${type === 'pptx'
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      disabled={loading}
                    >
                      📊 PowerPoint
                    </button>
                    <button
                      onClick={() => setType('pdf')}
                      className={`py-4 px-6 text-base font-semibold rounded-xl smooth-transition ${type === 'pdf'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      disabled={loading}
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !text}
                className={`w-full py-5 px-8 rounded-2xl font-bold text-white text-lg smooth-transition shadow-xl ${loading || !text
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'gradient-button glow hover:scale-105'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-3">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Magic...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>✨ Generate Presentation</span>
                  </span>
                )}
              </button>

              {/* Feedback Messages */}
              {error && (
                <div className="p-5 rounded-xl bg-red-50 text-red-700 text-sm border-2 border-red-100 flex items-start gap-3 fade-in">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && !loading && (
                <div className="p-5 rounded-xl bg-green-50 text-green-700 text-sm border-2 border-green-100 flex items-center justify-between success-pulse fade-in">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Success! Your file has been downloaded.</span>
                  </div>
                  <button
                    onClick={() => triggerDownload(success.data!.fileBase64, success.data!.filename, success.data!.contentType)}
                    className="text-green-800 hover:text-green-900 font-semibold underline"
                  >
                    Download Again
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Features */}
            <div className="space-y-6 fade-in">
              <div className="glass rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6 gradient-text">Why SlideGenie AI?</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Lightning Fast</h4>
                      <p className="text-gray-600">Generate professional presentations in seconds, not hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">AI-Powered</h4>
                      <p className="text-gray-600">Advanced AI understands your content and creates structured slides</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Multiple Formats</h4>
                      <p className="text-gray-600">Export as PowerPoint (.pptx) or PDF - your choice!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Secure & Private</h4>
                      <p className="text-gray-600">Your data is processed securely and never stored</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">2s</div>
                  <div className="text-sm text-gray-600">Avg. Time</div>
                </div>
                <div className="glass rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">15</div>
                  <div className="text-sm text-gray-600">Max Slides</div>
                </div>
                <div className="glass rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">2</div>
                  <div className="text-sm text-gray-600">Formats</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-3xl p-8 space-y-6">
              <div className="text-center space-y-3">
                <p className="text-base font-semibold text-gray-700">
                  Developed with ❤️ by <span className="font-bold gradient-text">Bharath Kumar K</span>
                </p>
                <p className="text-sm text-gray-600">
                  Built using Next.js, FastAPI, and OpenAI
                </p>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://github.com/Bharath-Kumar-K-0930"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 smooth-transition text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>

                <a
                  href="https://www.linkedin.com/in/bharath-kumar-k-b35ba0304"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 smooth-transition text-sm text-blue-700 hover:text-blue-900 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>

                <a
                  href="https://leetcode.com/u/Bharath_Kumar_K_91/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 smooth-transition text-sm text-yellow-700 hover:text-yellow-900 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                  </svg>
                  LeetCode
                </a>

                <a
                  href="mailto:bharathkumarkbk10@gmail.com"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-100 hover:bg-red-200 smooth-transition text-sm text-red-700 hover:text-red-900 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>

              {/* Source Code */}
              <div className="text-center pt-6 border-t border-gray-200">
                <a
                  href="https://github.com/Bharath-Kumar-K-0930/SlideGenie.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 smooth-transition font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View Source Code on GitHub
                </a>
              </div>

              {/* Copyright */}
              <div className="text-center text-xs text-gray-500 pt-4">
                © 2024 SlideGenie AI. All rights reserved. | Limit: 15 slides per run
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
