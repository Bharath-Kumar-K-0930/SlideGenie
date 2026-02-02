"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [text, setText] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [type, setType] = useState<"pptx" | "pdf">("pptx");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some content");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setError("");
    setSuccess(false);
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

      // Trigger download
      const link = document.createElement("a");
      link.href = `data:${data.data.contentType};base64,${data.data.fileBase64}`;
      link.download = data.data.filename;
      link.click();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const maxChars = 2000;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ padding: '1.25rem 0' }}>
            <div className="flex items-center gap-md">
              <Image src="/logo.png" alt="SlideGenie AI" width={40} height={40} />
              <h1 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>
                SlideGenie AI
              </h1>
            </div>

            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section text-center fade-in">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="flex items-center justify-center gap-sm mb-lg">
            <span className="badge badge-primary">AI-Powered</span>
            <span className="badge badge-secondary">Fast & Easy</span>
          </div>

          <h2 className="mb-md">
            Turn Your Ideas Into
            <br />
            <span className="text-gradient">Professional Presentations</span>
          </h2>

          <p className="mb-xl" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Generate stunning PowerPoint and PDF presentations in seconds using advanced AI technology
          </p>

          <div className="flex items-center justify-center gap-md mb-xl" style={{ flexWrap: 'wrap' }}>
            <button
              onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-primary btn-lg"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started Free
            </button>
            <a
              href="https://github.com/Bharath-Kumar-K-0930/SlideGenie"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-3" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="stat-card">
              <div className="stat-value">2s</div>
              <div className="stat-label">Average Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">15</div>
              <div className="stat-label">Max Slides</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">2</div>
              <div className="stat-label">Formats</div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generator" className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card">
            <h3 className="mb-lg text-center">Create Your Presentation</h3>

            {/* Content Input */}
            <div className="mb-lg">
              <label className="label">
                Your Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Example: 'The future of renewable energy, including solar power advancements, wind energy innovations, and sustainable practices for 2026.'"
                className="textarea"
                maxLength={maxChars}
              />
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                textAlign: 'right',
                marginTop: 'var(--spacing-xs)'
              }}>
                {charCount} / {maxChars} characters
              </div>
            </div>

            {/* Slide Count */}
            <div className="mb-lg">
              <label className="label">
                Number of Slides: <span className="text-gradient" style={{ fontSize: '1.125rem' }}>{slideCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="slider"
              />
              <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                <span>1</span>
                <span>15</span>
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-xl">
              <label className="label">Output Format</label>
              <div className="toggle-group">
                <button
                  onClick={() => setType("pptx")}
                  className={`toggle-option ${type === "pptx" ? "active" : ""}`}
                >
                  <div className="flex items-center justify-center gap-sm">
                    <span>ðŸ“Š</span>
                    <span>PowerPoint</span>
                  </div>
                </button>
                <button
                  onClick={() => setType("pdf")}
                  className={`toggle-option ${type === "pdf" ? "active" : ""}`}
                >
                  <div className="flex items-center justify-center gap-sm">
                    <span>ðŸ“„</span>
                    <span>PDF</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <svg className="spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Presentation</span>
                </>
              )}
            </button>

            {/* Alerts */}
            {error && (
              <div className="alert alert-error" style={{ marginTop: 'var(--spacing-lg)' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ marginTop: 'var(--spacing-lg)' }}>
                âœ“ Success! Your file has been downloaded.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-2xl">
            <h3 className="mb-md">
              Why Choose <span className="text-gradient">SlideGenie AI</span>?
            </h3>
            <p style={{ maxWidth: '600px', margin: '0 auto' }}>
              Powerful features designed to make presentation creation effortless
            </p>
          </div>

          <div className="grid grid-4">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="mb-sm" style={{ fontSize: '1.125rem' }}>Lightning Fast</h4>
              <p style={{ fontSize: '0.9375rem' }}>
                Generate professional presentations in just seconds
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="mb-sm" style={{ fontSize: '1.125rem' }}>AI-Powered</h4>
              <p style={{ fontSize: '0.9375rem' }}>
                Advanced AI creates structured, meaningful content
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="mb-sm" style={{ fontSize: '1.125rem' }}>Multiple Formats</h4>
              <p style={{ fontSize: '0.9375rem' }}>
                Export as PowerPoint (.pptx) or PDF format
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="mb-sm" style={{ fontSize: '1.125rem' }}>Secure & Private</h4>
              <p style={{ fontSize: '0.9375rem' }}>
                Your data is processed securely and never stored
              </p>
            </div>
          </div>
        </div>
      </section>

