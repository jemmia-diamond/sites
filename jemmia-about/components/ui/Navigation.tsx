"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMenu } from "@/components/context/MenuContext";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
    { label: "Home", href: "#hero" },
    { label: "Tầm Nhìn", href: "#vision" },
    { label: "Bộ Sưu Tập", href: "#collections" },
    { label: "Thành Tựu", href: "#results" },
    { label: "Văn Hóa & Con Người", href: "#culture" },
    { label: "Lời Kết", href: "#conclusion" },
];

export function Navigation() {
    const { isOpen, toggleMenu, closeMenu } = useMenu();
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    // Initial Setup of Timeline
    useGSAP(() => {
        gsap.set(overlayRef.current, { yPercent: -100 });

        tl.current = gsap.timeline({ paused: true })
            .to(overlayRef.current, {
                yPercent: 0,
                duration: 1,
                ease: "power4.inOut"
            })
            .from(".nav-item", {
                y: 100,
                opacity: 0,
                rotateX: -20,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.4");

    }, { scope: containerRef });

    // Handle Open/Close
    useEffect(() => {
        if (isOpen) {
            tl.current?.play();
        } else {
            tl.current?.reverse();
        }
    }, [isOpen]);

    // Handle Smooth Scroll & Close
    const handleLinkClick = (href: string) => {
        closeMenu();

        // Simple smooth scroll logic if it's an anchor
        if (href.startsWith("#")) {
            const element = document.querySelector(href);
            if (element) {
                // Wait for menu close animation roughly or just let it happen
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 500);
            } else if (href === "#hero") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    return (
        <div ref={containerRef}>
            {/* TOGGLE BUTTON (Fixed Top Right) */}
            <button
                onClick={toggleMenu}
                className="fixed top-8 right-8 z-50 group w-12 h-12 flex flex-col justify-center items-end gap-1.5 focus:outline-none mix-blend-difference"
                aria-label="Toggle Menu"
            >
                <span className={cn(
                    "block h-[2px] bg-white transition-all duration-300 ease-out",
                    isOpen ? "w-8 rotate-45 translate-y-2" : "w-8 group-hover:w-10"
                )} />
                <span className={cn(
                    "block h-[2px] bg-white transition-all duration-300 ease-out",
                    isOpen ? "opacity-0" : "w-6 group-hover:w-10"
                )} />
                <span className={cn(
                    "block h-[2px] bg-white transition-all duration-300 ease-out",
                    isOpen ? "w-8 -rotate-45 -translate-y-2" : "w-4 group-hover:w-10"
                )} />
            </button>

            {/* OVERLAY */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-40 bg-[#002422] flex flex-col items-center justify-center overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neon-green/10 via-[#002422] to-[#002422] opacity-50 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

                <nav className="relative z-10 flex flex-col items-center gap-6">
                    {MENU_ITEMS.map((item, i) => (
                        <div key={i} className="nav-item overflow-hidden px-4 py-2">
                            {/* Button wrapper with Grid Stack */}
                            <button
                                onClick={() => handleLinkClick(item.href)}
                                className="group relative grid grid-cols-1 grid-rows-1 items-center justify-items-center text-5xl md:text-7xl font-bold uppercase tracking-tighter cursor-pointer"
                            >
                                {/* Default Text (Sans) - Occupies Grid Cell 1/1 */}
                                <span className="col-start-1 row-start-1 block text-white/30 transition-all duration-500 ease-in-out group-hover:-translate-y-full group-hover:opacity-0">
                                    {item.label}
                                </span>

                                {/* Hover Text (Serif Italic Gold) - Occupies Grid Cell 1/1 */}
                                <span className="col-start-1 row-start-1 block text-neon-green font-serif italic font-medium transition-all duration-500 ease-in-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 whitespace-nowrap">
                                    {item.label}
                                </span>
                            </button>
                        </div>
                    ))}
                </nav>

                <div className="nav-item mt-12 text-white/30 text-xs tracking-[0.5em] uppercase">
                    Jemmia Diamond © 2025
                </div>
            </div>
        </div>
    );
}
