"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
    const router = useRouter();
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check local storage for theme
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            setDarkMode(true);
            document.documentElement.setAttribute("data-theme", "dark");
        }

        // Load generated data from localStorage
        const storedData = localStorage.getItem("generatedPresentation");
        if (storedData) {
            setGeneratedData(JSON.parse(storedData));
        } else {
            // If no data, redirect back to home
            router.push("/");
        }
    }, [router]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!generatedData) return;
            if (e.key === "ArrowLeft") {
                setActiveSlide((prev) => Math.max(0, prev - 1));
            } else if (e.key === "ArrowRight") {
                setActiveSlide((prev) => Math.min(generatedData.structure.slides.length - 1, prev + 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [generatedData]);

    const handleDownload = () => {
        if (!generatedData) return;

        const link = document.createElement("a");
        link.href = `data:${generatedData.contentType};base64,${generatedData.fileBase64}`;
        link.download = generatedData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRedesign = () => {
        // Go back to home to edit
        localStorage.removeItem("generatedPresentation");
        router.push("/");
    };

    if (!generatedData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-xl">
                <div className="text-center">
                    <div className="spin mb-md" style={{ width: '40px', height: '40px', margin: '0 auto', borderTopColor: 'transparent', border: '4px solid var(--color-primary)', borderRadius: '50%' }}></div>
                    <p>Loading presentation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            {/* Header */}
            <header className="border-b" style={{ borderColor: 'var(--color-border)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="container">
                    <div className="flex items-center justify-between" style={{ padding: '1.25rem 0' }}>
                        <div className="flex items-center gap-md cursor-pointer" onClick={() => router.push('/')}>
                            <Image src="/logo.png" alt="SlideGenie AI" width={32} height={32} />
                            <h1 className="text-gradient" style={{ fontSize: '1.25rem', margin: 0 }}>
                                SlideGenie AI
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container" style={{ maxWidth: '1000px', paddingBottom: 'var(--spacing-2xl)' }}>
                <div className="fade-in">
                    <div className="flex items-center justify-between mb-lg">
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Presentation Preview</h2>
                        <button onClick={handleRedesign} className="btn btn-text">
                            ← Back to Editor
                        </button>
                    </div>

                    <div className="card" style={{ padding: 'var(--spacing-lg)', background: 'var(--color-bg-secondary)', border: '2px solid var(--color-primary)' }}>
                        <div className="flex items-center justify-between mb-md">
                            <h4 style={{ margin: 0 }}>Slide {activeSlide + 1} of {generatedData.structure.slides.length}</h4>
                            <div className="flex gap-sm items-center">
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>
                                    Use ← → keys
                                </span>
                                <button
                                    onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                                    className="btn btn-secondary btn-sm"
                                    disabled={activeSlide === 0}
                                    style={{ minWidth: '40px', padding: '0.5rem' }}
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => setActiveSlide(Math.min(generatedData.structure.slides.length - 1, activeSlide + 1))}
                                    className="btn btn-secondary btn-sm"
                                    disabled={activeSlide === generatedData.structure.slides.length - 1}
                                    style={{ minWidth: '40px', padding: '0.5rem' }}
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        <div style={{
                            aspectRatio: '16/9',
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-lg)',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)' }}>
                                {generatedData.structure.slides[activeSlide]?.title}
                            </h3>
                            <div className="flex gap-lg" style={{ flex: 1 }}>
                                <ul style={{ flex: 2, paddingLeft: 'var(--spacing-lg)' }}>
                                    {generatedData.structure.slides[activeSlide]?.points?.map((p: string, i: number) => (
                                        <li key={i} style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>{p}</li>
                                    ))}
                                </ul>
                                {generatedData.structure.slides[activeSlide]?.image_url && (
                                    <div style={{ flex: 1.5, position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                        <img
                                            src={generatedData.structure.slides[activeSlide]?.image_url}
                                            alt="Slide visual"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-2 gap-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button onClick={handleDownload} className="btn btn-primary btn-lg justify-center">
                                📥 Download {generatedData.filename.endsWith('.pdf') ? 'PDF' : 'PPTX'}
                            </button>
                            <button onClick={handleRedesign} className="btn btn-secondary btn-lg justify-center">
                                🎨 Create New / Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
