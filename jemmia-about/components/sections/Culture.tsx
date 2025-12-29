"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextReveal } from "@/components/ui/TextReveal";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
    {
        title: "Tin Tưởng",
        subtitle: "5 Giá Trị Cốt Lõi",
        description: "Đảm bảo mọi giao dịch minh bạch, sản phẩm có nguồn gốc rõ ràng để khách hàng an tâm đầu tư lâu dài.",
        images: [
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
        ]
    },
    {
        title: "Tự Học",
        subtitle: "5 Giá Trị Cốt Lõi",
        description: "Không ngừng cập nhật công nghệ và kiến thức mới từ các tổ chức ngọc học uy tín nhất thế giới (như GIA).",
        images: [
            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
        ]
    },
    {
        title: "Thách Thức",
        subtitle: "5 Giá Trị Cốt Lõi",
        description: "Sẵn sàng đổi mới, không ngại đối mặt với các khó khăn của thị trường để nâng tầm ngành kim cương Việt Nam trên bản đồ thế giới.",
        images: [
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
        ]
    },
    {
        title: "Thấu Cảm",
        subtitle: "5 Giá Trị Cốt Lõi",
        description: "Cá nhân hóa trải nghiệm khách hàng, thấu hiểu nhu cầu riêng biệt của từng người và tích cực tham gia các hoạt động từ thiện cho cộng đồng.",
        images: [
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"
        ]
    },
    {
        title: "Tận Tâm",
        subtitle: "5 Giá Trị Cốt Lõi",
        description: "Phục vụ với sự tỉ mỉ từ khâu tư vấn đến dịch vụ hậu mãi, bảo hành, coi khách hàng như người thân.",
        images: [
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
        ]
    },
];

export function Culture() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".culture-card");

        // Master Timeline for the pinned sequence
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: `+=${CARDS.length * 150}%`, // Reduced from 250% to 150% for snappier feel
                pin: true,
                scrub: 1, // Reduced scrub for less floaty feel
                anticipatePin: 1,
                refreshPriority: 10, // High priority to handle pinning correctly
            }
        });

        // Loop through cards to build sequential transitions
        cards.forEach((card, i) => {
            const isFirst = i === 0;
            const isLast = i === cards.length - 1;
            const isEven = i % 2 === 0;

            // Get internal elements
            const mainImg = card.querySelector(".culture-img-main");
            const floatImg = card.querySelector(".culture-img-float");
            const content = card.querySelector(".culture-content");

            // --- ENTRY ANIMATION ---
            if (!isFirst) {
                // Combined timeline for simultaneous entry
                const entryTl = gsap.timeline();

                // Card Scale & Fade In
                entryTl.fromTo(card, {
                    yPercent: 100,
                    opacity: 0,
                    scale: 0.9
                }, {
                    yPercent: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power2.out"
                }, 0);

                // Content Entry
                if (content) {
                    entryTl.fromTo(content,
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                        0.2
                    );
                }

                // Images Entry (Simpler, cleaner animation)
                if (mainImg) {
                    entryTl.fromTo(mainImg,
                        { scale: 0.8, opacity: 0, y: 50 },
                        { scale: 1, opacity: 1, y: 0, duration: 1, ease: "back.out(1.2)" },
                        0.3
                    );
                }
                if (floatImg) {
                    entryTl.fromTo(floatImg,
                        { scale: 0.8, opacity: 0, y: 100 },
                        { scale: 1, opacity: 1, y: 0, duration: 1, ease: "back.out(1.5)" },
                        0.4
                    );
                }

                tl.add(entryTl, ">-0.5"); // Overlap significantly with previous card's hold/exit
            }

            // --- HOLD / EXIT ANIMATION ---
            if (!isLast) {
                // Clean exit
                tl.to(card, {
                    scale: 0.95,
                    opacity: 0,
                    filter: "blur(5px)",
                    duration: 0.8,
                    ease: "power2.in"
                }, "+=1"); // Hold for 1 second of scrub time
            }
        });

    }, { scope: containerRef });

    return (
        <section id="culture" ref={containerRef} className="culture-pin-container relative h-screen w-full overflow-hidden  flex flex-col justify-center">

            <div className="absolute top-6 md:top-10 w-full z-50 text-center pointer-events-none px-4">
                <span className="text-neon-green font-bold tracking-[0.2em] uppercase text-xs md:text-sm block mb-2 animate-pulse">
                    Pillar 04
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase text-white leading-none drop-shadow-2xl">
                    5 Giá Trị <span className="text-white/50">Cốt Lõi</span>
                </h2>
            </div>

            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-neon-green/10 via-transparent to-transparent pointer-events-none" />


            {/* Cards Container */}
            <div className="relative w-full max-w-6xl mx-auto h-[550px] md:h-[70vh] flex items-center justify-center px-4">
                {CARDS.map((card, i) => {
                    const isEven = i % 2 === 0;
                    return (
                        <div
                            key={i}
                            className={`culture-card absolute inset-0 w-full h-full rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#050505]/90 shadow-2xl flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} will-change-transform`}
                            style={{
                                zIndex: i + 1,
                                opacity: i === 0 ? 1 : 0
                            }}
                        >
                            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                            {/* Content Side */}
                            <div className="culture-content w-full md:w-5/12 p-6 md:p-14 flex flex-col justify-center relative z-10 order-2 md:order-none">
                                <span className="w-12 h-1 bg-neon-green mb-4 md:mb-6" />
                                <span className="text-neon-green font-bold uppercase tracking-widest text-xs md:text-sm mb-2 md:mb-3 block">
                                    {card.subtitle}
                                </span>
                                <h3 className="text-2xl md:text-5xl font-black text-white uppercase leading-tight mb-4 md:mb-6">
                                    {card.title}
                                </h3>
                                <p className="text-white/70 text-sm md:text-lg leading-relaxed mb-4 md:mb-8">
                                    {card.description}
                                </p>
                                <div className={`text-6xl md:text-8xl font-black text-white/5 font-serif select-none absolute bottom-4 right-4 ${isEven ? 'md:left-4 md:right-auto' : 'md:right-4'}`}>
                                    0{i + 1}
                                </div>
                            </div>

                            {/* Image Side */}
                            <div className={`w-full md:w-7/12 relative h-1/2 md:h-full bg-white/5 overflow-hidden order-1 md:order-none
                                ${isEven ? 'md:border-l' : 'md:border-r'} border-white/5
                            `}>
                                {/* Main Image */}
                                <div className={`culture-image-item culture-img-main absolute top-6 md:top-10 w-[60%] h-[70%] md:h-[55%] rounded-xl overflow-hidden shadow-2xl z-20 border border-white/20
                                    ${isEven ? 'right-6 md:right-10' : 'left-6 md:left-10'}
                                `}>
                                    <Image src={card.images[0]} alt="Collage 1" fill className="object-cover" />
                                </div>
                                {/* Float Image */}
                                <div className={`culture-image-item culture-img-float absolute bottom-6 md:bottom-10 w-[50%] h-[60%] md:h-[45%] rounded-xl overflow-hidden shadow-2xl z-30 border border-white/20
                                    ${isEven ? 'left-6 md:left-10' : 'right-6 md:right-10'}
                                `}>
                                    <Image src={card.images[1]} alt="Collage 2" fill className="object-cover" />
                                </div>
                                {/* BG Filler */}
                                <div className="culture-image-item absolute inset-0 opacity-20 scale-110">
                                    <Image src={card.images[2]} alt="Background" fill className="object-cover grayscale" />
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </section>
    );
}
