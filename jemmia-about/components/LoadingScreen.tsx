"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* 
  Luxury Diamond SVG 
  - Minimalist, geometric line art style
  - White stroke, transparent fill 
*/
const DiamondIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ overflow: "visible" }}
    >
        {/* Outer shape */}
        <path
            d="M20 35 L50 10 L80 35 L50 95 Z"
            stroke="url(#diamond-gradient)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="diamond-path"
        />
        {/* Inner Facets */}
        <path
            d="M20 35 L80 35"
            stroke="url(#diamond-gradient)"
            strokeWidth="1"
            className="diamond-inner"
        />
        <path
            d="M30 35 L50 95 L70 35"
            stroke="url(#diamond-gradient)"
            strokeWidth="1"
            className="diamond-inner"
        />
        <path
            d="M20 35 L50 50 L80 35"
            stroke="url(#diamond-gradient)"
            strokeWidth="1"
            className="diamond-inner"
        />
        <path
            d="M50 10 L50 50 L50 95"
            stroke="url(#diamond-gradient)"
            strokeWidth="1"
            className="diamond-inner"
        />
        <defs>
            <linearGradient id="diamond-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
        </defs>
    </svg>
);

export const LoadingScreen = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const diamondRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);
    const [isComplete, setIsComplete] = useState(false);

    // Lock body scroll during loading
    useEffect(() => {
        if (!isComplete) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isComplete]);

    useGSAP(() => {
        // Force scroll to top immediately
        window.scrollTo(0, 0);
        // Prevent browser from restoring scroll position
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

        const tl = gsap.timeline({
            onComplete: () => setIsComplete(true),
        });

        // 1. Initial State
        gsap.set(containerRef.current, { autoAlpha: 1 });
        gsap.set(diamondRef.current, { scale: 0.8, opacity: 0 });
        gsap.set(textRef.current, { opacity: 0, y: 20 });

        // 2. Diamond Reveal
        tl.to(diamondRef.current, {
            duration: 1.5,
            scale: 1,
            opacity: 1,
            ease: "power3.out",
        })
            .to(
                ".diamond-path",
                {
                    duration: 2,
                    strokeDasharray: "1000",
                    strokeDashoffset: "0",
                    ease: "power2.inOut",
                },
                "<"
            );

        // 3. Counting Text Reveal
        tl.to(
            textRef.current,
            {
                duration: 0.8,
                opacity: 1,
                y: 0,
                ease: "power2.out",
            },
            "-=0.5"
        );

        // 4. Progress Counter using GSAP
        const counterObj = { val: 0 };
        tl.to(
            counterObj,
            {
                val: 100,
                duration: 2,
                ease: "expo.inOut",
                onUpdate: () => {
                    if (progressRef.current) {
                        progressRef.current.innerText = Math.round(counterObj.val).toString();
                    }
                },
            },
            "<"
        );

        // 5. Exit - Slide Up Curtain
        tl.to(containerRef.current, {
            duration: 1.2,
            yPercent: -100,
            ease: "power4.inOut",
            delay: 0.2, // pause briefly at 100%
        });

    }, { scope: containerRef });

    if (isComplete) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black text-white pointer-events-none"
        >
            <div ref={diamondRef} className="w-32 h-32 md:w-48 md:h-48 mb-8 relative">
                <DiamondIcon className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </div>

            <div ref={textRef} className="flex flex-col items-center gap-2">
                <div className="text-4xl md:text-6xl font-light tracking-tighter tabular-nums">
                    <span ref={progressRef}>0</span>
                    <span className="text-2xl md:text-3xl align-top ml-1">%</span>
                </div>
                <p className="text-xs md:text-sm tracking-[0.3em] uppercase opacity-70">
                    Loading Content
                </p>
            </div>
        </div>
    );
};
