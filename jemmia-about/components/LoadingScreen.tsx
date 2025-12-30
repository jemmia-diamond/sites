"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

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
            duration: 1,
            scale: 1,
            opacity: 1,
            ease: "power3.out",
        });

        // 3. Counting Text Reveal
        tl.to(
            textRef.current,
            {
                duration: 0.5,
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
                duration: 1.5,
                ease: "power2.out",
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
            duration: 0.5,
            yPercent: -100,
            ease: "power4.inOut",
        }, "-=0.4");

    }, { scope: containerRef });

    if (isComplete) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white text-[#002422] pointer-events-none"
        >
            <div ref={diamondRef} className="w-48 h-20 md:w-64 md:h-24 mb-8 relative">
                <Image
                    src="https://file.hstatic.net/200000355853/file/logo.svg"
                    alt="Jemmia Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    priority
                />
            </div>

            <div ref={textRef} className="flex flex-col items-center gap-2">
                <div className="text-4xl md:text-6xl font-light tracking-tighter tabular-nums">
                    <span ref={progressRef}>0</span>
                    <span className="text-2xl md:text-3xl align-top ml-1">%</span>
                </div>
            </div>
        </div>
    );
};
