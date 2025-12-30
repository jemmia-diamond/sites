"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
    {
        title: "Tin Tưởng",
        subtitle: "5 Giá Trị Cốt Lõi",
        description: "Đảm bảo mọi giao dịch minh bạch, sản phẩm có nguồn gốc rõ ràng để khách hàng an tâm đầu tư lâu dài.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        ),
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
    },
    {
        title: "Tự Học",
        subtitle: "KIẾN THỨC LÀ SỨC MẠNH",
        description: "Không ngừng cập nhật công nghệ và kiến thức mới từ các tổ chức ngọc học uy tín nhất thế giới (như GIA).",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        ),
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Thách Thức",
        subtitle: "VƯƠN TẦM QUỐC TẾ",
        description: "Sẵn sàng đổi mới, không ngại đối mặt với các khó khăn của thị trường để nâng tầm ngành kim cương Việt Nam trên bản đồ thế giới.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
        ),
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Thấu Cảm",
        subtitle: "KHÁCH HÀNG LÀ TRỌNG TÂM",
        description: "Cá nhân hóa trải nghiệm khách hàng, thấu hiểu nhu cầu riêng biệt của từng người và tích cực tham gia các hoạt động từ thiện cho cộng đồng.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
        ),
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
    },
    {
        title: "Tận Tâm",
        subtitle: "PHỤC VỤ TỪ TÂM",
        description: "Phục vụ với sự tỉ mỉ từ khâu tư vấn đến dịch vụ hậu mãi, bảo hành, coi khách hàng như người thân.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        ),
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
    }
];

export function Culture() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const rows = gsap.utils.toArray<HTMLElement>(".culture-pill-row");

        gsap.fromTo(rows,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, { scope: sectionRef });

    return (
        <section id="culture" ref={sectionRef} className="relative text-white py-24 md:py-40 overflow-hidden">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,163,0.05),transparent_70%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <span className="text-neon-green font-bold tracking-[0.3em] uppercase text-xs md:text-sm block mb-4 animate-pulse">
                        Phát Triển Bền Vững
                    </span>
                    <h2 className="text-4xl md:text-7xl font-black uppercase text-transparent bg-clip-text bg-linear-to-b from-white to-white/50 leading-tight font-serif drop-shadow-2xl">
                        5 GIÁ TRỊ CỐT LÕI
                    </h2>
                </div>

                <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8">
                    {CARDS.map((item, index) => (
                        <div
                            key={index}
                            className="culture-pill-row group relative w-full h-auto min-h-[120px] md:h-[140px] flex items-stretch rounded-[50px] bg-white/[0.03] border border-white/10 hover:border-neon-green/50 transition-all duration-500 overflow-hidden"
                        >
                            {/* Hover Background Image Reveal */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>

                            {/* Left: Number & Shape */}
                            <div className={`
                                w-[100px] md:w-[140px] flex flex-col items-center justify-center shrink-0 relative
                                bg-linear-to-br from-white/10 to-transparent border-r border-white/10
                                group-hover:bg-neon-green group-hover:text-black transition-colors duration-500
                            `}>
                                <span className="text-3xl md:text-5xl font-black font-serif leading-none tracking-tighter">0{index + 1}</span>
                                <div className="mt-2 text-neon-green group-hover:text-black transition-colors duration-500">
                                    {item.icon}
                                </div>
                            </div>

                            {/* Right: Content */}
                            <div className="flex-1 flex flex-col justify-center px-6 md:px-10 py-4 md:py-0 relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                                    <div>
                                        <span className="text-neon-green text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 block opacity-80">
                                            {item.subtitle}
                                        </span>
                                        <h3 className="text-xl md:text-3xl font-bold uppercase text-white group-hover:text-neon-green transition-colors duration-300">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-md md:text-right group-hover:text-white transition-colors duration-300">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            {/* Action Arrow (Decoration) */}
                            <div className="hidden md:flex w-20 items-center justify-center shrink-0 border-l border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neon-green transform -rotate-45"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
