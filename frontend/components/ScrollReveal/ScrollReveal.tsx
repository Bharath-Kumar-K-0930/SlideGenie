"use client";

import { useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

// Handle SSR safety for useLayoutEffect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ScrollRevealProps {
    children: React.ReactNode;
    scrollContainerRef?: React.RefObject<HTMLElement>;
    enableBlur?: boolean;
    baseOpacity?: number;
    baseRotation?: number;
    blurStrength?: number;
    containerClassName?: string;
    textClassName?: string;
    rotationEnd?: string;
    wordAnimationEnd?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    containerClassName = '',
    textClassName = '',
    rotationEnd = 'bottom bottom',
    wordAnimationEnd = 'bottom bottom',
    as: Component = 'h2'
}) => {
    const containerRef = useRef<HTMLElement>(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        return text.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) return word;
            return (
                <span className="word" key={index} style={{ display: 'inline-block', willChange: 'opacity, filter' }}>
                    {word}
                </span>
            );
        });
    }, [children]);

    useIsomorphicLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

        const ctx = gsap.context(() => {
            const wordElements = el.querySelectorAll('.word');

            // Cinematic Reveal Timeline
            // Using .from so the characters are visible if GSAP doesn't run or finishes
            gsap.from(wordElements, {
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: 'top 95%', // Detect early
                    end: 'bottom 60%',
                    scrub: 1,
                    onRefresh: (self) => {
                        // If already past the scroll point on load, ensure it's revealed
                        if (self.progress > 0) gsap.set(wordElements, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 });
                    }
                },
                opacity: 0,
                y: 20,
                scale: 0.95,
                filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
                stagger: 0.1,
                ease: 'power2.out',
                immediateRender: false, // Wait for trigger
            });
        }, containerRef);

        // Force a refresh after a small delay to catch hydration layouts
        const timeout = setTimeout(() => ScrollTrigger.refresh(), 100);

        return () => {
            clearTimeout(timeout);
            ctx.revert();
        };
    }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

    return (
        <Component ref={containerRef as any} className={`scroll-reveal ${containerClassName}`} style={{ opacity: 1 }}>
            <span className={`scroll-reveal-text ${textClassName}`}>{splitText}</span>
        </Component>
    );
};

export default ScrollReveal;
