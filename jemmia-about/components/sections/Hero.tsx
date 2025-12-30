"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline();

            // Initial reveal animation
            tl.from(".hero-text-line", {
                y: 100,
                opacity: 0,
                duration: 1.5,
                stagger: 0.2,
                ease: "power4.out",
            })
                .from(
                    imageRef.current,
                    {
                        y: 50,
                        opacity: 0,
                        duration: 1.5,
                        ease: "power4.out",
                    },
                    "-=1.0"
                );

            // Parallax effect on scroll
            gsap.to(textRef.current, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

            gsap.to(imageRef.current, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });
        },
        { scope: containerRef }
    );

    return (
        <section
            ref={containerRef}
            id="hero-section"
            className="relative h-screen w-full overflow-hidden flex items-center justify-center p-4 md:p-0"
        >
            {/* Background/Parallax Image */}
            <div
                ref={imageRef}
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
            >
                <div className="relative w-full h-full opacity-50 mix-blend-screen">
                    <Image
                        src="https://cdn.hstatic.net/files/200000355853/file/deep_green_background_301033.avif"
                        alt="Jemmia Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Large Typography Container - Centered/Left Split */}
            <div
                ref={textRef}
                className="pt-16 md:pt-0 relative z-10 w-full max-w-7xl px-12 grid grid-cols-1 md:grid-cols-1 gap-12 items-center mix-blend-difference"
            >
                {/* Left Column: Content */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-full mb-4 md:mb-8">
                        <p className="text-neon-green uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-base font-bold animate-pulse">
                            JEMMIA DIAMOND
                        </p>
                    </div>

                    <h1 className="text-[12vw] md:text-[6.5vw] leading-[0.9] md:leading-[1.3] font-black tracking-tighter text-white uppercase font-serif mb-6 md:mb-10 w-full space-y-3">
                        <div>
                            <span className="hero-text-line block">THƯƠNG HIỆU</span>
                        </div>
                        <div>
                            <span className="hero-text-line block text-neon-green">KIM CƯƠNG</span>
                        </div>
                        <div>
                            <span className="hero-text-line block">BẢN SẮC VIỆT</span>
                        </div>
                    </h1>

                    <div className="w-full">
                        <p className="text-white/80 text-base md:text-xl font-light leading-relaxed max-w-lg">
                            Định vị giá trị toàn cầu.
                            <br />
                            Hành trình mang <span className="text-neon-green font-bold">Văn hóa & Nghệ thuật Việt</span> vào chuẩn mực kim cương quốc tế.
                        </p>
                    </div>
                </div>

                {/* Right Column: Empty (Reserved for Diamond) */}
                <div className="hidden md:block pointer-events-none select-none">
                    {/* Diamond sits here via 3D Canvas */}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-xs uppercase tracking-widest animate-bounce">
                Scroll Down
            </div>
        </section>
    );
}
