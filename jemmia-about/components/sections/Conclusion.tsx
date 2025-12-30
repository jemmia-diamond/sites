"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { TextReveal } from "@/components/ui/TextReveal";

export function Conclusion() {
    const containerRef = useRef<HTMLDivElement>(null);
    const diamondRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // 1. Initial Reveal
        gsap.from(".conclusion-element", {
            y: 30,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
            }
        });

        // 2. Diamond Floating Animation (Yoyo)
        if (diamondRef.current) {
            gsap.to(diamondRef.current, {
                y: -20,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Add rotation to the shine behind it
            gsap.to(".diamond-shine", {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: "linear"
            });
        }

    }, { scope: containerRef });

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <section id="conclusion" ref={containerRef} className="relative h-screen flex flex-col items-center justify-center text-center z-20">

            {/* Content Container */}
            <div className="relative z-10 px-2 pb-2 md:pb-10 mx-auto flex flex-col items-center">

                {/* DIAMOND VISUAL */}
                <div className="conclusion-element relative w-40 h-40 md:w-56 md:h-56">
                    {/* Rotating Shine/Rays */}
                    <div className="diamond-shine absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,var(--neon-green)_40deg,transparent_60deg)] opacity-20 blur-xl rounded-full mix-blend-screen" />
                    <div className="diamond-shine absolute inset-[-50%] bg-[conic-gradient(from_180deg,transparent_0deg,transparent_20deg,var(--neon-green)_40deg,transparent_60deg)] opacity-20 blur-xl rounded-full mix-blend-screen animation-delay-1000" />

                    {/* The Diamond */}
                    <div ref={diamondRef} className="relative w-full h-full drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                        <Image
                            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop"
                            alt="Jemmia Diamond"
                            fill
                            className="object-cover rounded-full border-2 border-neon-green/30 opacity-0"
                        />
                        {/* Sparkle Glint Overlay */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white blur-md animate-pulse" />
                    </div>
                </div>

                <div className="conclusion-element">
                    <span className="w-16 h-px bg-linear-to-r from-transparent via-neon-green to-transparent block mx-auto mb-8" />
                    <p className="text-neon-green font-bold tracking-[0.3em] uppercase text-xs md:text-sm animate-pulse">
                        The Expert of Diamond Standard
                    </p>
                </div>

                <div className="mt-3">
                    <TextReveal className="text-4xl md:text-6xl font-serif font-medium text-white leading-tight">
                        Chuyên gia
                    </TextReveal>
                    <TextReveal className="text-4xl md:text-6xl font-serif font-medium text-white/50 leading-tight" delay={0.2}>
                        Kim cương chuẩn
                    </TextReveal>
                </div>

                <div className="conclusion-element mx-auto mt-3">
                    <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                        Tiên phong chuẩn mực kim cương.
                        <br className="hidden md:block" />
                        Tôn vinh vị thế độc bản.
                    </p>
                </div>

                <div className="conclusion-element pt-12">
                    <button
                        onClick={scrollToTop}
                        className="group relative px-6 py-2 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:bg-neon-green/10"
                    >
                        <div className="absolute inset-0 border border-white/20 rounded-full group-hover:border-neon-green transition-colors duration-300" />
                        <span className="relative text-white/80 font-bold uppercase tracking-widest text-sm group-hover:text-neon-green transition-colors">
                            Về Đầu Trang
                        </span>
                    </button>

                    <div className="mt-8 text-white/20 text-xs uppercase tracking-widest">
                        © 2025 Jemmia Diamond
                    </div>
                </div>

            </div>
        </section>
    );
}
