"use client";

import { useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function RevealProvider({ children }: { children: React.ReactNode }) {
    useIsomorphicLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Target sections and common UI cards for global reveal
        const revealElements = document.querySelectorAll('section, .reveal, .stat-card, .feature-card, .guide-step, .card');

        const ctx = gsap.context(() => {
            revealElements.forEach((el) => {
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        y: 30,
                        scale: 0.98
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 90%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        });

        return () => ctx.revert();
    }, []);

    return <>{children}</>;
}
