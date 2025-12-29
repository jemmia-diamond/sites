"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
    children: string;
    className?: string; // Additional classes for the text
    tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
    duration?: number;
    stagger?: number;
    delay?: number;
}

export function TextReveal({
    children,
    className,
    tag: Tag = "div",
    duration = 1.0,
    stagger = 0.03,
    delay = 0,
}: TextRevealProps) {
    const textRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = textRef.current;
        if (!el) return;

        // Split text into words/chars manually to avoid extra lib dependency (SplitText is paid GSAP, so we DIY)
        // We will split by character for maximum luxury effect.
        // But we need to preserve spaces.
        // Split text into words to handle wrapping correctly
        // Normalize whitespace to prevent issues with double spaces or newlines
        const words = children.trim().replace(/\s+/g, " ").split(" ");

        // Clear content and rebuild with word spans keeping characters together
        el.innerHTML = "";

        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement("span");
            wordSpan.style.display = "inline-block";
            wordSpan.style.whiteSpace = "nowrap"; // Keep word chars together
            wordSpan.style.wordBreak = "keep-all"; // Extra safety

            const chars = word.split("");
            chars.forEach((char) => {
                const span = document.createElement("span");
                span.innerText = char;
                span.style.display = "inline-block";
                span.style.opacity = "0";
                span.style.transform = "translateY(100%)";
                span.className = "char";
                wordSpan.appendChild(span);
            });

            el.appendChild(wordSpan);

            // Add space between words
            if (wordIndex < words.length - 1) {
                const space = document.createTextNode(" ");
                el.appendChild(space);
            }
        });

        gsap.to(el.querySelectorAll(".char"), {
            y: 0,
            opacity: 1,
            duration: duration,
            stagger: stagger,
            ease: "power4.out",
            delay: delay,
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
            }
        });

        return () => {
            // Cleanup provided by React unmount, GSAP auto-kills triggers usually, 
            // but if we navigated away, we'd want to kill scrolltriggers.
        }

    }, [children, duration, stagger, delay]);

    return (
        <Tag ref={textRef as any} className={cn("overflow-hidden leading-none", className)}>
            {/* Initial render for SEO, strictly replaced by Effect */}
            <span className="opacity-0">{children}</span>
        </Tag>
    );
}
