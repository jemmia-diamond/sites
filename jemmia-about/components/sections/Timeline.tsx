"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const TIMELINE_DATA = [
    {
        quarter: "Quý I",
        year: "2025",
        title: "Khởi Đầu & Đào Tạo",
        events: [
            {
                month: "Early",
                title: "Đào Tạo Diamond Grading",
                desc: "Cử nhân sự đi Thái Lan tham gia khóa học chuyên sâu.",
                tag: "Culture",
                image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
            }
        ]
    },
    {
        quarter: "Quý II",
        year: "2025",
        title: "Vươn Ra Biển Lớn",
        events: [
            {
                month: "Q2",
                title: "Khai Trương DMCC Dubai",
                desc: "Trụ sở tại trung tâm giao dịch kim cương lớn nhất thế giới.",
                tag: "Global",
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
            },
            {
                month: "Q2",
                title: "Chiến Dịch 'Nói Có Giấy'",
                desc: "Minh bạch hóa quy trình kiểm định với máy móc chuẩn quốc tế.",
                tag: "Trust",
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
            },
            {
                month: "Q2",
                title: "Chuỗi Workshop",
                desc: "AI - Thông minh hơn ai? & Xây dựng thương hiệu cá nhân.",
                tag: "Culture",
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            }
        ]
    },
    {
        quarter: "Quý III",
        year: "2025",
        title: "Bùng Nổ & Lan Tỏa",
        events: [
            {
                month: "Q3",
                title: "Dạ Tiệc 'Tự Hào Non Nước'",
                desc: "Concept Hoa Sen, thưởng trà & Personal Color.",
                tag: "Event",
                image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
            },
            {
                month: "Q3",
                title: "Siêu Livestream 80h",
                desc: "80 Năm Tự Hào - Săn 80 viên kim cương.",
                tag: "Sale",
                image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2658&auto=format&fit=crop"
            },
            {
                month: "Q3",
                title: "Art Shows",
                desc: "VOW Legacy, SYMPHONY, OSAKA Event.",
                tag: "Art",
                image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop"
            },
            {
                month: "Q3",
                title: "Hợp Tác RMIT",
                desc: "Tham gia Hội đồng doanh nghiệp - Môn Global Business.",
                tag: "Partner",
                image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
            },
            {
                month: "Q3",
                title: "Team Trip 2025",
                desc: "Format 'Team By Team' - As One We Win.",
                tag: "Culture",
                image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
            },
            {
                month: "02/09",
                title: "Cine Day 'Mưa Đỏ'",
                desc: "Ôn lại lịch sử & khơi dậy lòng tự hào dân tộc.",
                tag: "Culture",
                image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2000&auto=format&fit=crop"
            },
            {
                month: "20/09",
                title: "Metamen 3D Day",
                desc: "Tài trợ Vàng sự kiện công nghệ in 3D lớn nhất VN.",
                tag: "Tech",
                image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=2662&auto=format&fit=crop"
            }
        ]
    }
];

export function Timeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Animate the central line growing
        gsap.fromTo(lineRef.current,
            { height: "0%" },
            {
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top center",
                    end: "bottom center",
                    scrub: 1,
                }
            }
        );

        // Animate Items
        const items = gsap.utils.toArray<HTMLElement>(".timeline-item");
        items.forEach((item, i) => {
            gsap.from(item, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                }
            });
        });

    }, { scope: containerRef });

    return (
        <section id="timeline" ref={containerRef} className="py-24 md:py-32 px-4 md:px-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black opacity-50" />

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-20 md:mb-32">
                    <span className="text-neon-green font-bold tracking-[0.3em] uppercase text-xs md:text-sm animate-pulse">
                        Roadmap 2025
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white mt-4">
                        Hành Trình <br /> <span className="text-white/50">Di Sản</span>
                    </h2>
                </div>

                {/* Timeline Container */}
                <div className="relative">

                    {/* --- CENTRAL LINE (Responsive: Left on Mobile, Center on Desktop) --- */}
                    {/* The gray background line */}
                    {/* Mobile: Left-4 (1rem), Desktop: Left-1/2 */}
                    <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-white/10 -translate-x-1/2" />

                    {/* The animated growing line */}
                    <div ref={lineRef} className="absolute left-4 md:left-1/2 top-4 w-[2px] bg-neon-green -translate-x-1/2 box-content shadow-[0_0_10px_#D4AF37] z-10" />

                    {TIMELINE_DATA.map((quarter, qIdx) => (
                        <div key={qIdx} className="mb-20 md:mb-32 relative">

                            {/* Quarter Marker */}
                            {/* Mobile: Aligned with left line. Desktop: Centered. */}
                            <div className="flex items-center mb-12 relative pl-8 md:pl-0 md:justify-center">
                                {/* The Dot on the line */}
                                {/* Mobile: left-4 to match line. Desktop: left-1/2 */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-black border-2 border-neon-green rounded-full z-20 shadow-[0_0_15px_#D4AF37]" />

                                {/* The Label */}
                                <div className="ml-6 md:ml-0 bg-white/5 backdrop-blur px-6 py-2 rounded-full border border-white/10 text-neon-green font-bold uppercase tracking-widest text-sm md:text-base z-30 relative md:mt-2">
                                    {quarter.quarter} • {quarter.year}
                                </div>
                            </div>

                            {/* Events List */}
                            <div className="space-y-16">
                                {quarter.events.map((event, eIdx) => {
                                    const isEven = eIdx % 2 === 0;
                                    return (
                                        <div key={eIdx} className={`timeline-item flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''} justify-between gap-6 md:gap-12 group pl-8 md:pl-0 relative`}>

                                            {/* Mobile Dot (On the left line) */}
                                            <div className="absolute left-4 top-8 -translate-x-1/2 w-3 h-3 bg-white/20 rounded-full md:hidden group-hover:bg-neon-green transition-colors z-20" />

                                            {/* Content Block */}
                                            <div className={`w-full md:w-[45%] ${isEven ? 'md:text-left' : 'md:text-right'}`}>

                                                {/* Image Block */}
                                                <div className={`relative w-full h-48 md:h-56 rounded-xl overflow-hidden mb-6 border border-white/10 group-hover:border-neon-green/50 transition-colors shadow-2xl`}>
                                                    <Image
                                                        src={event.image!}
                                                        alt={event.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-bold uppercase tracking-widest text-neon-green border border-white/10">
                                                        {event.month}
                                                    </div>
                                                </div>

                                                <div className="px-2">
                                                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                                                        {event.tag}
                                                    </div>
                                                    <h3 className="text-xl md:text-2xl font-bold text-white uppercase mb-2 group-hover:text-neon-green transition-colors leading-tight">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-white/60 text-sm md:text-base leading-relaxed">
                                                        {event.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Center Dot (Desktop Only) */}
                                            <div className="hidden md:block w-3 h-3 bg-white/20 rounded-full group-hover:bg-neon-green group-hover:scale-150 transition-all duration-300 absolute left-1/2 -translate-x-1/2" />

                                            {/* Empty Side (Desktop Only) */}
                                            <div className="hidden md:block w-[45%]" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
