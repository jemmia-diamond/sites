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
            className="relative h-screen w-full overflow-hidden flex items-center justify-center p-4"
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

            {/* Large Typography */}
            <div
                ref={textRef}
                className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mix-blend-difference px-4"
            >
                <div className="w-full text-center mb-4 md:mb-6">
                    <p className="text-neon-green uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-base font-bold animate-pulse">
                        JEMMIA 2025 RECAP
                    </p>
                </div>

                <h1 className="text-[12vw] md:text-[8vw] leading-[1.1] md:leading-[1.2] font-black tracking-tighter text-white uppercase text-center w-full font-serif mb-6 md:mb-8">
                    <div>
                        <span className="hero-text-line block">DẤU ẤN</span>
                    </div>
                    <div>
                        <span className="hero-text-line block text-neon-green">VƯƠN TẦM</span>
                    </div>
                    <div>
                        <span className="hero-text-line block"> QUỐC TẾ</span>
                    </div>
                </h1>

                <div className="w-full flex justify-center">
                    <p className="text-white/80 max-w-lg md:max-w-2xl text-center text-base md:text-xl font-light leading-relaxed px-2">
                        Tổng kết hành trình phát triển chiến lược Quý 2 & Quý 3 năm 2025.
                        <br className="hidden md:block" />
                        <span className="inline md:hidden"> </span>
                        Khẳng định vị thế <span className="text-neon-green font-bold">Thương hiệu Việt</span> & Bản sắc riêng trên bản đồ kim cương thế giới.
                    </p>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-xs uppercase tracking-widest animate-bounce">
                Scroll Down
            </div>
        </section>
    );
}
