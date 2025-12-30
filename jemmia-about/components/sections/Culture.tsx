"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
    {
        title: "Tin Tưởng",
        subtitle: "5 Giá Trị Cốt Lõi",
        description: "Minh bạch tuyệt đối trong mọi giao dịch và nguồn gốc sản phẩm.",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
    },
    {
        title: "Tự Học",
        subtitle: "Kiến Thức Là Sức Mạnh",
        description: "Liên tục cập nhật kiến thức chuẩn GIA và công nghệ mới nhất.",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Thách Thức",
        subtitle: "Vươn Tầm Quốc Tế",
        description: "Không ngại đổi mới để nâng tầm kim cương Việt trên bản đồ thế giới.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Thấu Cảm",
        subtitle: "Khách Hàng Là Trọng Tâm",
        description: "Thấu hiểu nhu cầu riêng biệt và cá nhân hóa trải nghiệm hoàn hảo.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
    },
    {
        title: "Tận Tâm",
        subtitle: "Phục Vụ Từ Tâm",
        description: "Chăm sóc khách hàng như người thân với sự tỉ mỉ trong từng chi tiết.",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
    }
];

export function Culture() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".culture-card");

        gsap.fromTo(cards,
            { y: 50, opacity: 0, scale: 0.95 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    end: "bottom bottom",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, { scope: sectionRef });

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = window.innerWidth * 0.85;
            const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="culture" ref={sectionRef} className="relative text-white py-24 md:py-32 overflow-hidden bg-black/20">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,163,0.03),transparent_70%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 md:mb-20">
                    <span className="text-neon-green font-bold tracking-[0.3em] uppercase text-xs md:text-sm block mb-4 animate-pulse">
                        Phát Triển Bền Vững
                    </span>
                    <h2 className="text-4xl md:text-7xl font-black uppercase text-white drop-shadow-2xl">
                        5 Giá Trị Cốt Lõi
                    </h2>
                </div>

                <div className="relative">
                    {/* Mobile Navigation Arrows */}
                    <div className="md:hidden absolute top-1/2 left-0 w-full flex justify-between px-2 z-20 pointer-events-none -translate-y-1/2">
                        <button
                            onClick={() => scroll('left')}
                            className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-neon-green hover:text-black transition-colors shadow-lg"
                            aria-label="Previous"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-neon-green hover:text-black transition-colors shadow-lg"
                            aria-label="Next"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>

                    {/* CONTAINER: Flex Carousel (Mobile) / Grid (Desktop) */}
                    <div
                        ref={scrollContainerRef}
                        className="flex flex-row md:grid md:grid-cols-12 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-8 md:pb-0 no-scrollbar scroll-smooth"
                    >

                        {CARDS.map((item, index) => {
                            // Desktop Grid Logic: First 3 -> col-span-4, key 2 -> col-span-6
                            // Actually easier: if index < 3 ? span-4 : span-6
                            const isTopRow = index < 3;
                            const colSpan = isTopRow ? "md:col-span-4" : "md:col-span-6";

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "culture-card group relative shrink-0 snap-center md:snap-align-none",
                                        "w-[85vw] md:w-auto h-[450px] md:h-[500px]", // Mobile: Fixed width 85vw, Height 450px
                                        colSpan, // Desktop: Grid span
                                        "rounded-3xl overflow-hidden cursor-pointer",
                                        "border border-white/10 hover:border-neon-green/50 transition-colors duration-500"
                                    )}
                                >
                                    {/* 1. Background Image (Zoom Effect) */}
                                    <div className="absolute inset-0 z-0">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 grayscale-0"
                                        />
                                        {/* Dark Gradient Overlay for text readability */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-60 transition-opacity duration-500" />
                                    </div>

                                    {/* 2. Number Badge (Top Right) */}
                                    <div className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-md border border-white/20 bg-neon-green transition-colors duration-500">
                                        <span className="font-mono font-bold text-sm">0{index + 1}</span>
                                    </div>

                                    {/* 3. Content (Bottom) */}
                                    <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                                        <div className="h-0.5 w-12 bg-neon-green mb-6" />

                                        <span className="block text-neon-green text-xs font-bold tracking-widest uppercase mb-2">
                                            {item.subtitle}
                                        </span>

                                        <h3 className="text-3xl md:text-4xl font-black uppercase text-white mb-3">
                                            {item.title}
                                        </h3>

                                        <p className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-3">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
