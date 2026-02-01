'use client';

import { useState } from 'react';
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
      {/* Header */}
      <header className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          SlideGenie AI
        </h1>
        <p className="text-lg text-gray-600">
          Turn your text into professional presentations or documents in seconds.
        </p>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-3xl glass rounded-2xl p-6 md:p-10 space-y-8">

        {/* Input Area */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Your Content
            <span className="text-gray-400 font-normal ml-2">({text.length}/2000 chars)</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.substring(0, 2000))}
            className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none text-gray-800 bg-white/50"
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
          className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'
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
          <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100 flex items-center justify-between">
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
      <footer className="text-gray-400 text-sm">
        © 2024 SlideGenie AI. Limit 15 slides per run.
      </footer>
    </main>
  );
}
