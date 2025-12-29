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
        title: "Team Trip 2025",
        subtitle: "Team By Team",
        description: "Đổi mới hình thức Company Trip truyền thống. Trao quyền cho các team/phòng ban tự lên kế hoạch và lựa chọn địa điểm, giúp thấu hiểu và gắn kết sâu sắc hơn.",
        images: [
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1504159506876-f8338247a14a?q=80&w=2070&auto=format&fit=crop"
        ]
    },
    {
        title: "Hoạt Động Tinh Thần",
        subtitle: "Cine Day & Team Up Run",
        description: "Bao rạp xem phim lịch sử 'Mưa Đỏ' để ôn lại lịch sử và khơi dậy lòng tự hào dân tộc. Giải chạy 10X Team Up Run rèn luyện sức bền.",
        images: [
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2000&auto=format&fit=crop", // Gym/Sport
            "https://images.unsplash.com/photo-1517649763732-e0c9e2b1660d?q=80&w=2070&auto=format&fit=crop", // Cinema/Community like
            "https://images.unsplash.com/photo-1552674605-469523f54050?q=80&w=2070&auto=format&fit=crop"  // Sport
        ]
    },
    {
        title: "Đào Tạo Chuyên Sâu",
        subtitle: "Expert Training",
        description: "Cử nhân sự đi Thái Lan học Diamond Grading. Workshop 'AI - Thông minh hơn ai?', xây dựng thương hiệu cá nhân và nâng cao năng lực quản lý.",
        images: [
            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
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
                end: `+=${CARDS.length * 250}%`, // Much longer scroll distance
                pin: true,
                scrub: 1.5, // Momentum: animation "catches up" smoothly even on fast scroll
                anticipatePin: 1,
                // Optional: Snap to closest card to ensure focus
                snap: {
                    snapTo: 1 / (CARDS.length - 1),
                    duration: { min: 0.2, max: 1.0 }, // Allow some time to settle
                    delay: 0.2,
                    ease: "power1.inOut"
                }
            }
        });

        // Loop through cards to build sequential transitions
        cards.forEach((card, i) => {
            const isFirst = i === 0;
            const isLast = i === cards.length - 1;
            const isEven = i % 2 === 0;

            // Get internal elements for "Explosion" effect
            const mainImg = card.querySelector(".culture-img-main");
            const floatImg = card.querySelector(".culture-img-float");
            const content = card.querySelector(".culture-content");

            // --- ENTRY ANIMATION (Except first card which is already there) ---
            if (!isFirst) {
                // Card Slide Up & Fade In
                tl.fromTo(card, {
                    yPercent: 100,
                    opacity: 0,
                    scale: 0.8
                }, {
                    yPercent: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power2.inOut"
                }, ">-0.2"); // Overlap slightly with previous exit

                // LIVING IMAGES: DRAMATIC 3D EXPLOSION
                if (mainImg) {
                    tl.fromTo(mainImg,
                        {
                            scale: 0.5,
                            rotationY: isEven ? 90 : -90, // 3D Flip
                            xPercent: isEven ? -50 : 50,
                            opacity: 0
                        },
                        {
                            scale: 1,
                            rotationY: 0,
                            xPercent: 0,
                            opacity: 1,
                            duration: 1.5,
                            ease: "elastic.out(1, 0.75)" // Bouncy
                        },
                        "<0.1"
                    );
                }
                if (floatImg) {
                    tl.fromTo(floatImg,
                        {
                            yPercent: 120, // Shoot up from bottom
                            rotation: isEven ? -45 : 45,
                            scale: 0.5,
                            opacity: 0
                        },
                        {
                            yPercent: 0,
                            rotation: isEven ? 5 : -5,
                            scale: 1.1,
                            opacity: 1,
                            duration: 1.6,
                            ease: "elastic.out(1, 0.6)" // Bouncy
                        },
                        "<0.1"
                    );
                }
                if (content) {
                    tl.fromTo(content,
                        { x: isEven ? -50 : 50, opacity: 0, filter: "blur(10px)" },
                        { x: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" },
                        "<0.2"
                    );
                }
            } else {
                // First Card Initial State: Just ensure it's visible. 
                // Could add a small 'pop' if we wanted but static is safer for 'pinned start'.
            }

            // --- EXIT ANIMATION (Except last card which stays) ---
            if (!isLast) {
                // Card Fade Out & Scale Down & Blur
                tl.to(card, {
                    scale: 0.8,
                    opacity: 0,
                    filter: "blur(10px)",
                    duration: 0.8,
                    ease: "power2.in"
                }, "+=0.5"); // Initial hold time
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
                    Văn Hóa <span className="text-white/50">& Con Người</span>
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
                                // First card visible by default, others hidden handled by GSAP
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
