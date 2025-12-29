"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/ui/TextReveal";

const EVENTS = [
    {
        title: "Cột Mốc Quốc Tế",
        subtitle: "Trụ sở DMCC - Dubai",
        description: "Khẳng định doanh nghiệp Việt đủ bản lĩnh bước vào sân chơi toàn cầu, sẵn sàng cạnh tranh và tạo giá trị ngang tầm quốc tế. Dubai là điểm khởi đầu mang tinh thần Việt đi xa hơn.",
        tag: "Global",
        image: "https://images.unsplash.com/photo-1512453979798-5ea904ac6605?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Dạ Tiệc Tri Ân",
        subtitle: "Tự Hào Non Nước",
        description: "Concept Hoa Sen thanh khiết. Trải nghiệm thưởng trà, không gian nghệ thuật và hoạt động Personal Color thú vị cho khách mời thượng lưu.",
        tag: "Gala",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
    },
    {
        title: "Show Diễn Nghệ Thuật",
        subtitle: "Legacy & Symphony",
        description: "Trình diễn các bộ sưu tập kim cương độc bản tại VOW Legacy, SYMPHONY, OSAKA Event. Kể câu chuyện tình yêu vĩnh cửu và tôn vinh những khoảnh khắc trường tồn.",
        tag: "Art Show",
        image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop"
    },
    {
        title: "Hợp Tác & Tài Trợ",
        subtitle: "RMIT & Metamen",
        description: "Tham gia Hội đồng doanh nghiệp RMIT (Môn Global Business) và tài trợ Vàng Metamen 3D Innovation Day (20/09/2025). Kết nối tri thức, công nghệ và 'ươm mầm' tài năng trẻ.",
        tag: "Partners",
        image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
    }
];

export function KeyEvents() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const items = gsap.utils.toArray<HTMLElement>(".event-item");

            items.forEach((item, i) => {
                // 3D Tilt Entry Animation
                gsap.fromTo(item,
                    {
                        opacity: 0,
                        y: 100,
                        rotateX: -15,
                        scale: 0.9,
                        transformOrigin: "top center"
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        scale: 1,
                        duration: 1.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                        }
                    }
                );

                // Internal Parallax
                const img = item.querySelector("img");
                if (img) {
                    gsap.fromTo(img,
                        { scale: 1.2, yPercent: -15 },
                        {
                            scale: 1.2,
                            yPercent: 15,
                            ease: "none",
                            scrollTrigger: {
                                trigger: item,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: true
                            }
                        }
                    );
                }
            });
        },
        { scope: containerRef }
    );

    return (
        <section id="vision" ref={containerRef} className="py-24 px-4 md:px-10 text-white min-h-screen relative z-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24">

                {/* Left Column: Sticky Title */}
                <div className="md:w-1/3">
                    <div className="static md:sticky md:top-24 mb-10 md:mb-0">
                        <span className="text-neon-green font-bold tracking-[0.2em] uppercase text-xs md:text-sm block mb-4 border-l-2 border-neon-green pl-4">
                            Pillar 01
                        </span>
                        <div className="flex flex-col">
                            <TextReveal tag="h2" className="text-4xl md:text-6xl font-black uppercase text-white leading-none mb-2" stagger={0.05}>
                                Tầm Nhìn &
                            </TextReveal>
                            <TextReveal tag="span" className="text-4xl md:text-6xl font-black uppercase text-white/50 leading-none" delay={0.3} stagger={0.05}>
                                Sự Kiện Trọng Điểm
                            </TextReveal>
                        </div>
                        <p className="mt-6 md:mt-8 text-white/60 text-base md:text-lg leading-relaxed max-w-sm">
                            Điểm lại những cột mốc đáng nhớ khẳng định vị thế thương hiệu trên trường quốc tế.
                        </p>
                    </div>
                </div>

                {/* Right Column: Scrolling Events */}
                <div className="md:w-2/3 flex flex-col gap-16 md:gap-24 perspective-1000">
                    {EVENTS.map((event, i) => (
                        <div
                            key={i}
                            className="event-item group"
                        >
                            {/* Card Container */}
                            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:border-neon-green/30">

                                {/* Image Half */}
                                <div className="relative h-[250px] md:h-[400px] overflow-hidden w-full">
                                    <Image
                                        src={event.image}
                                        alt={event.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                    <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3 py-1 bg-black/60 backdrop-blur rounded-full border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-widest text-neon-green">
                                        {event.tag}
                                    </div>
                                </div>

                                {/* Content Half */}
                                <div className="p-6 md:p-10 relative">
                                    <h3 className="text-neon-green font-bold uppercase text-xs md:text-sm tracking-wider mb-2">
                                        {event.subtitle}
                                    </h3>
                                    <h4 className="text-2xl md:text-4xl font-black text-white uppercase leading-tight mb-4">
                                        {event.title}
                                    </h4>
                                    <p className="text-white/70 text-sm md:text-base leading-relaxed border-t border-white/10 pt-4">
                                        {event.description}
                                    </p>

                                    <div className="absolute top-6 right-6 text-4xl md:text-6xl font-black text-white/5 font-serif select-none pointer-events-none">
                                        0{i + 1}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
