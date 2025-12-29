"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

const COLLECTIONS = [
    {
        title: "Lotus & Sen Quý Hiển",
        desc: "Cảm hứng hoa sen, tôn vinh vẻ đẹp thanh tao & nội lực phụ nữ Việt. Hợp tác cùng Hoa hậu Lương Thùy Linh.",
        image: "https://images.unsplash.com/photo-1629224316810-9d8805b95076?q=80&w=2000&auto=format&fit=crop", // Elegant Asian vibes or jewelry
    },
    {
        title: "Vững Cội Vươn Xa",
        desc: "BST Ghim Cài 'Di Sản Non Nước'. Hình ảnh Chim Lạc & Trống Đồng - Biểu tượng cội nguồn dân tộc.",
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2000&auto=format&fit=crop", // Gold/Bronze Heritage
    },
    {
        title: "Hào Khí Đông A",
        desc: "BST Ghim Cài 'Di Sản Non Nước'. Biểu tượng cho trí tuệ, bản lĩnh và hào khí dân tộc.",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000&auto=format&fit=crop", // Red/Powerful
    },
    {
        title: "Vững Thế Phồn Vinh",
        desc: "BST Ghim Cài 'Di Sản Non Nước'. Hình tượng bông lúa vàng - Sự thịnh vượng và no ấm bền vững.",
        image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2000&auto=format&fit=crop", // Green/Nature/Gold
    },
];

export function Collections() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current || !sectionRef.current) return;

            const scrollWidth = containerRef.current.scrollWidth;
            const viewportWidth = window.innerWidth;

            // Main Horizontal Scroll
            const mainTween = gsap.to(containerRef.current, {
                x: -(scrollWidth - viewportWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${scrollWidth - viewportWidth}`,
                    pin: true,
                    anticipatePin: 1,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    fastScrollEnd: true,
                    refreshPriority: 1, // Prioritize this calculation
                },
            });

            // Internal Parallax for Images (Premium Feel)
            gsap.utils.toArray<HTMLElement>(".col-image").forEach((img) => {
                gsap.fromTo(
                    img,
                    { xPercent: -15, scale: 1.2 },
                    {
                        xPercent: 15,
                        scale: 1.2,
                        ease: "none",
                        scrollTrigger: {
                            trigger: img.parentElement, // The container of the image
                            containerAnimation: mainTween, // Link to horizontal scroll
                            start: "left right",
                            end: "right left",
                            scrub: true,
                        }
                    }
                );
            });

            // Text Reveal Animation
            gsap.utils.toArray<HTMLElement>(".col-text").forEach((text) => {
                gsap.from(text, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: text.parentElement?.parentElement, // The main card
                        containerAnimation: mainTween,
                        start: "left center",
                        toggleActions: "play none none reverse",
                    }
                });
            });
        },
        { scope: sectionRef }
    );

    return (
        <section id="collections" ref={sectionRef} className="relative overflow-hidden z-30 bg-[#002422]">
            {/* Intro Text Overlay */}
            <div className="absolute top-10 left-10 z-20 pointer-events-none mix-blend-difference">
                <span className="text-neon-green font-bold tracking-[0.2em] uppercase text-sm block mb-2">
                    Pillar 02
                </span>
                <h2 className="text-4xl font-black uppercase text-white">
                    Nghệ Thuật <br /> Chế Tác
                </h2>
            </div>

            <div className="h-screen flex items-center">
                <div ref={containerRef} className="flex h-full w-fit">

                    {/* Title Slide */}
                    <div className="w-screen h-full flex items-center justify-center shrink-0 border-r border-white/10 bg-black relative">
                        <div className="absolute inset-0 opacity-30">
                            <Image
                                src="https://images.unsplash.com/photo-1617038224558-28ad3fb558a7?q=80&w=2000&auto=format&fit=crop" // Diamond Workshop
                                alt="Craftsmanship"
                                fill
                                className="object-cover grayscale"
                            />
                        </div>
                        <h2 className="relative z-10 text-[12vw] md:text-[10vw] font-black uppercase text-white leading-none text-center mix-blend-difference">
                            Bộ Sưu Tập <br />
                            <span className="text-white/50">Di Sản 2025</span>
                        </h2>
                    </div>

                    {/* Collection Items */}
                    {COLLECTIONS.map((col, i) => (
                        <div key={i} className="w-[100vw] md:w-[60vw] h-full shrink-0 relative flex flex-col justify-end p-6 md:p-20 border-r border-white/10 overflow-hidden group">
                            {/* BG Image */}
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <div className="col-image w-full h-full relative">
                                    <Image
                                        src={col.image}
                                        alt={col.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                            </div>

                            <div className="absolute top-6 right-6 md:top-10 md:right-10 text-6xl md:text-9xl font-black text-white/10 select-none z-10">
                                0{i + 1}
                            </div>

                            <div className="col-text relative z-10 max-w-2xl translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="w-12 h-1 bg-neon-green mb-4 md:mb-6" />
                                <h3 className="text-3xl md:text-6xl font-black uppercase text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
                                    {col.title}
                                </h3>
                                <p className="text-base md:text-2xl text-white/90 font-light leading-relaxed drop-shadow-md">
                                    {col.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
