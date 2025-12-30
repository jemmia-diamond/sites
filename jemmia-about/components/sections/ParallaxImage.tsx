"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function ParallaxImage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

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
                <img
                    ref={imageRef}
                    className="h-full w-full object-cover"
                    src={"https://w.ladicdn.com/664c47fd56f9a000124a324e/dubai-diamond-week-6_2b8f24f0105f47daac5d184178de337d_grande-20241118041153-xd8cg.webp"}
                />

                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

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
