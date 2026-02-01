"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [text, setText] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [type, setType] = useState<"pptx" | "pdf">("pptx");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ data: any } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some content");
      return;
    }

    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, slideCount, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Generation failed");
      }

      const data = await response.json();
      setSuccess({ data });
      triggerDownload(data.fileBase64, data.filename, data.contentType);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (base64: string, filename: string, contentType: string) => {
    const link = document.createElement("a");
    link.href = `data:${contentType};base64,${base64}`;
    link.download = filename;
    link.click();
  };

  const charCount = text.length;
  const maxChars = 2000;

  return (
    <main className="min-h-screen">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 social-link"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="container-saas">
        {/* Hero Section */}
        <header className="section-spacing text-center fade-in">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/logo.png"
              alt="SlideGenie AI Logo"
              width={64}
              height={64}
              className="smooth-transition hover:scale-110"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">SlideGenie AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-6 font-light">
            Turn text into professional presentations in seconds
          </p>

          <p className="text-sm text-slate-500 max-w-xl mx-auto mb-8">
            AI-powered PPT & PDF generator
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button
              onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary"
            >
              Generate Presentation
            </button>
            <a
              href="https://github.com/Bharath-Kumar-K-0930/SlideGenie"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              View on GitHub
            </a>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="badge badge-primary">Next.js</span>
            <span className="badge badge-primary">FastAPI</span>
            <span className="badge badge-accent">OpenAI</span>
            <span className="badge badge-accent">AI-Powered</span>
          </div>
        </header>

        {/* Generator Card */}
        <section id="generator" className="max-w-3xl mx-auto mb-16 slide-up">
          <div className="card-modern p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Create Your Presentation</h2>

            {/* Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Example: 'The future of renewable energy, including solar power advancements, wind energy innovations, and sustainable practices for 2026.'"
                className="textarea-modern"
                maxLength={maxChars}
              />
              <div className="char-counter">
                {charCount} / {maxChars} characters
              </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Number of Slides: <span className="gradient-text font-bold">{slideCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="slider-modern"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>1</span>
                <span>15</span>
              </div>
            </div>

            {/* Format Toggle */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Output Format
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setType("pptx")}
                  className={`toggle-option flex-1 ${type === "pptx" ? "active" : ""}`}
                >
                  📊 PowerPoint (.pptx)
                </button>
                <button
                  onClick={() => setType("pdf")}
                  className={`toggle-option flex-1 ${type === "pdf" ? "active" : ""}`}
                >
                  📄 PDF (.pdf)
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </span>
              ) : (
                "Generate Presentation"
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-6 toast toast-error">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && !loading && (
              <div className="mt-6 toast toast-success">
                ✓ Success! Your file has been downloaded.
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="section-spacing">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why <span className="gradient-text">SlideGenie AI</span>?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="icon-container mb-4">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">⚡ Lightning Fast</h3>
              <p className="text-sm text-slate-600">
                Generate professional presentations in seconds, not hours
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="icon-container mb-4">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">🤖 AI-Powered</h3>
              <p className="text-sm text-slate-600">
                Advanced AI understands your content and creates structured slides
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="icon-container mb-4">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">📄 PPT & PDF</h3>
              <p className="text-sm text-slate-600">
                Export as PowerPoint (.pptx) or PDF – your choice!
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="icon-container mb-4">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">🔒 Secure & Private</h3>
              <p className="text-sm text-slate-600">
                Your data is processed securely and never stored
              </p>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="stat-card">
              <div className="text-3xl font-bold gradient-text mb-1">2s</div>
              <div className="text-sm text-slate-600">Avg. Time</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold gradient-text mb-1">15</div>
              <div className="text-sm text-slate-600">Max Slides</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl font-bold gradient-text mb-1">2</div>
              <div className="text-sm text-slate-600">Formats</div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="divider"></div>

        {/* Footer */}
        <footer className="py-12 text-center">
          <p className="text-slate-600 mb-4">
            Built with ❤️ by <span className="font-semibold gradient-text">Bharath Kumar K</span>
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="tech-badge">Next.js 16</span>
            <span className="tech-badge">FastAPI</span>
            <span className="tech-badge">OpenAI GPT</span>
            <span className="tech-badge">Python-PPTX</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <a href="https://github.com/Bharath-Kumar-K-0930" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/bharath-kumar-k" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://github.com/Bharath-Kumar-K-0930/SlideGenie" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Source Code">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </a>
          </div>

          <p className="text-xs text-slate-500">
            © 2024 SlideGenie AI. All rights reserved. | Limit: 15 slides per run
          </p>
        </footer>
      </div>
    </main>
  );
}
