"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function ParallaxImage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Reveal Animation
            gsap.fromTo(
                containerRef.current,
                { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
                {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        end: "bottom 80%",
                        scrub: 1,
                    },
                }
            );

            // Parallax Scale
            gsap.fromTo(
                imageRef.current,
                { scale: 1.2 },
                {
                    scale: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                }
            );
        },
        { scope: containerRef }
    );

    return (
        <section className="py-20 overflow-hidden px-4 md:px-0">
            <div
                ref={containerRef}
                className="relative w-full h-[50vh] md:h-[80vh] overflow-hidden"
            >
                <div
                    ref={imageRef}
                    className="absolute inset-0 bg-neutral-800 flex items-center justify-center bg-[url('https://placehold.co/1920x1080/111/444')] bg-cover bg-center text-white/50"
                >
                    {/* Fallback label if image fails or for styling */}
                    <h2 className="text-[20vw] md:text-[10rem] font-black opacity-20 uppercase mix-blend-overlay">
                        Focus
                    </h2>
                </div>

                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                    <p className="text-neon-green font-bold uppercase tracking-widest text-xs md:text-sm mb-2">
                        Behind the scenes
                    </p>
                    <h3 className="text-3xl md:text-6xl text-white font-serif italic">
                        Unseen Moments
                    </h3>
                </div>
            </div>
        </section>
    );
}
