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
        const chars = children.split("");

        // Clear content and rebuild with spans
        el.innerHTML = "";
        chars.forEach((char, i) => {
            const span = document.createElement("span");
            span.innerText = char;
            span.style.display = "inline-block";
            span.style.opacity = "0";
            span.style.transform = "translateY(100%)";
            if (char === " ") span.style.width = "0.3em"; // preserve space width
            span.className = "char";
            el.appendChild(span);
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
