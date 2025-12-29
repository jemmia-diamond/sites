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
        quarter: "6 Steps",
        year: "Process",
        title: "Quy Trình Kiểm Soát",
        events: [
            {
                month: "01",
                title: "Hành trình Đạo đức",
                desc: "Cam kết chỉ nhập khẩu kim cương từ các quốc gia tuân thủ các chuẩn mực về nhân quyền, an sinh xã hội và bảo vệ môi trường (Úc, Botswana, Canada, Nam Phi...).",
                tag: "Ethical",
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
            },
            {
                month: "02",
                title: "Hành trình Pháp lý",
                desc: "100% sản phẩm nhập khẩu chính ngạch, có đầy đủ hóa đơn, chứng từ và thực hiện nghĩa vụ thuế với nhà nước. Minh bạch tuyệt đối.",
                tag: "Legal",
                image: "https://images.unsplash.com/photo-1450101499121-87b483c00329?q=80&w=2074&auto=format&fit=crop"
            },
            {
                month: "03",
                title: "Hành trình Tiêu chuẩn cao",
                desc: "Chỉ 2% kim cương trên thế giới lọt qua bộ lọc của Jemmia. Không BGM (nâu/xanh/sữa), không huỳnh quang, chỉ chọn nước D-F, độ sạch VS2+.",
                tag: "Standard",
                image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1887&auto=format&fit=crop"
            },
            {
                month: "04",
                title: "Hành trình Kiểm định",
                desc: "Sử dụng máy móc GIA (ID100, Match iD...) để tái kiểm định (double-check). Loại bỏ ngay những viên không đạt chuẩn dù đã có giấy tờ.",
                tag: "GIA Check",
                image: "https://images.unsplash.com/photo-1581093458791-9f302e6d8a6b?q=80&w=2070&auto=format&fit=crop"
            },
            {
                month: "05",
                title: "Hành trình Thiết kế",
                desc: "Kết hợp nghệ nhân tay nghề cao và đội ngũ thiết kế sáng tạo để tạo ra các tác phẩm độc bản, mang đậm dấu ấn cá nhân và văn hóa Việt.",
                tag: "Design",
                image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop"
            },
            {
                month: "06",
                title: "Hành trình Tặng phẩm",
                desc: "Mỗi món trang sức là một gia bảo (Heiress), được chế tác để lưu truyền qua nhiều thế hệ, giữ vững giá trị theo thời gian.",
                tag: "Legacy",
                image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop"
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
                        The Standard
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white mt-4">
                        Hành Trình <br /> <span className="text-white/50">Kim Cương</span>
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
