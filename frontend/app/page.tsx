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
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-24 space-y-8">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 p-3 rounded-full glass hover:scale-110 smooth-transition"
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

      {/* Header */}
      <header className="text-center space-y-4 max-w-2xl fade-in">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Image
            src="/logo.png"
            alt="SlideGenie AI Logo"
            width={80}
            height={80}
            className="drop-shadow-lg"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text">
          SlideGenie AI
        </h1>
        <p className="text-lg text-gray-600">
          Turn your text into professional presentations or documents in seconds.
        </p>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-3xl glass rounded-2xl p-6 md:p-10 space-y-8 scale-in">

        {/* Input Area */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Your Content
            <span className="text-gray-400 font-normal ml-2">({text.length}/2000 chars)</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.substring(0, 2000))}
            className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none text-gray-800"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            placeholder="Paste your notes, article, or topic idea here..."
            disabled={loading}
          />
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slide Count Slider */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Length: {slideCount} Slides
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>15</span>
            </div>
          </div>

          {/* Type Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Output Format</label>
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setType('pptx')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'pptx' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                disabled={loading}
              >
                PowerPoint (.pptx)
              </button>
              <button
                onClick={() => setType('pdf')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'pdf' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                disabled={loading}
              >
                PDF Document
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !text}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg smooth-transition shadow-lg ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'gradient-button glow'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating Magic...</span>
            </span>
          ) : (
            'Generate Presentation'
          )}
        </button>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {success && !loading && (
          <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100 flex items-center justify-between success-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Success! Your file has been downloaded.</span>
            </div>
            <button
              onClick={() => triggerDownload(success.data!.fileBase64, success.data!.filename, success.data!.contentType)}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Download Again
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full max-w-3xl mt-12 space-y-6">
        {/* Developer Info */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Developed by <span className="font-bold text-indigo-600">Bharath Kumar K</span>
            </p>
            <p className="text-xs text-gray-500">
              Built with ❤️ using Next.js, FastAPI, and OpenAI
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/Bharath-Kumar-K-0930"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-700 hover:text-gray-900"
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors text-sm text-blue-700 hover:text-blue-900"
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition-colors text-sm text-yellow-700 hover:text-yellow-900"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
              </svg>
              LeetCode
            </a>

            <a
              href="mailto:bharathkumarkbk10@gmail.com"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors text-sm text-red-700 hover:text-red-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>

          {/* Source Code Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <a
              href="https://github.com/Bharath-Kumar-K-0930/SlideGenie.git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View Source Code
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-400">
          © 2024 SlideGenie AI. All rights reserved. | Limit: 15 slides per run
        </div>
      </footer>
    </main>
  );
}
