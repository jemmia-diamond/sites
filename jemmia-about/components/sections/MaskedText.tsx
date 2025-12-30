"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function MaskedText() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useGSAP(
        () => {
            // Simple parallax on the background element behind text
            gsap.to(".masked-bg", {
                scale: 1.2,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            })
        },
        { scope: containerRef }
    );

    return (
        <section id="story" ref={containerRef} className="py-32 relative overflow-hidden flex items-center justify-center bg-white text-black">
            {/* 
                The concept: Large text that acts as a mask, 
                or just very bold black text on white for contrast against the dark site. 
             */}

            <div className="relative z-10 text-center px-4 mix-blend-difference text-white">
                <p className="text-sm uppercase tracking-[0.5em] mb-4 text-neon-green">
                    Why Jemmia?
                </p>
                <h2 className="text-[8vw] leading-[0.9] font-black uppercase text-center">
                    Minh Bạch<br />
                    Tuyệt Đối
                </h2>
                <p className="max-w-xl mx-auto mt-8 text-base md:text-xl text-white/80 font-light leading-relaxed">
                    Giải quyết nỗi đau "Thật - Giả" của thị trường. <br />
                    Mang đến trải nghiệm mua sắm xa xỉ, an tâm và đầy nhiệt huyết của người Việt.
                </p>
            </div>

            {/* Dynamic Background behind "mix-blend-difference" text */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* Maybe a video or gradient here */}
                <div className="masked-bg absolute inset-0 bg-linear-to-tr from-neon-green/20 via-black to-blue-900/20 opacity-50" />
            </div>
        </section>
    );
}
