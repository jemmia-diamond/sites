"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MarqueeProps {
    text: string;
    className?: string;
    repeat?: number; // How many times to repeat the text in one block
    duration?: number; // Seconds
}

export function Marquee({ text, className, repeat = 4, duration = 20 }: MarqueeProps) {
    const innerRef = useRef<HTMLDivElement>(null);
    const content = Array(repeat).fill(text).join(" • ");

    useGSAP(() => {
        ScrollTrigger.create({
            trigger: document.body, // Global scroll tracker
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                // Skew based on velocity (clamp it so it's not too crazy)
                const skew = gsap.utils.clamp(-20, 20, velocity / 50);
                gsap.to(innerRef.current, {
                    skewX: -skew, // Invert for "dragging" feel
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }
        });
    }, { scope: innerRef });

    return (
        <div className={cn("relative overflow-hidden w-full bg-neon-green text-black py-4 select-none", className)}>
            <div
                ref={innerRef}
                className="flex whitespace-nowrap w-fit animate-marquee will-change-transform"
                style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
            >
                <span className="px-4 text-4xl font-bold uppercase italic tracking-tighter">
                    {content} •
                </span>
                <span className="px-4 text-4xl font-bold uppercase italic tracking-tighter">
                    {content} •
                </span>
            </div>
        </div>
    );
}
