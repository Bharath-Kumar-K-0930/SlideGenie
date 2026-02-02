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
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section text-center fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background shapes */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-50px',
          width: '300px',
          height: '300px',
          background: 'var(--color-accent)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: '0.15',
          zIndex: -1
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '-50px',
          width: '250px',
          height: '250px',
          background: '#e1f2f7',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: '0.5',
          zIndex: -1
        }} />

        <div className="container" style={{ maxWidth: '900px', position: 'relative' }}>
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
                    <span>📊</span>
                    <span>PowerPoint</span>
                  </div>
                </button>
                <button
                  onClick={() => setType("pdf")}
                  className={`toggle-option ${type === "pdf" ? "active" : ""}`}
                >
                  <div className="flex items-center justify-center gap-sm">
                    <span>📄</span>
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
                ✓ Success! Your file has been downloaded.
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

      {/* Footer */}
      <footer className="footer-compact">
        <div className="container">
          <div className="text-center">
            <p className="mb-md" style={{ color: 'var(--color-text-secondary)' }}>
              Built with ❤️ by <strong style={{ color: 'var(--color-text)' }}>Bharath Kumar K</strong>
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-md mb-md" style={{ flexWrap: 'wrap' }}>
              <a
                href="https://github.com/Bharath-Kumar-K-0930"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn github"
                title="GitHub"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/bharath-kumar-k-b35ba0304"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn linkedin"
                title="LinkedIn"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              <a
                href="mailto:bharathkumarkbk10@gmail.com"
                className="social-icon-btn email"
                title="Email"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>

              <a
                href="https://leetcode.com/u/Bharath_Kumar_K_91/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn leetcode"
                title="LeetCode"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                </svg>
              </a>

              <a
                href="https://bharath-kumar-k-0930.github.io/My_Portfolio_website/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn portfolio"
                title="Portfolio"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 019-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            </div>

            {/* Tech Stack */}
            <div className="flex items-center justify-center gap-md mb-md" style={{ flexWrap: 'wrap' }}>
              <span className="badge">Next.js 16</span>
              <span className="badge">FastAPI</span>
              <span className="badge">OpenAI</span>
              <span className="badge">Python-PPTX</span>
            </div>

            {/* Copyright */}
            <p style={{ color: 'var(--color-text-muted)' }}>
              © 2024 SlideGenie AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
