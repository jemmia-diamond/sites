"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextReveal } from "@/components/ui/TextReveal";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
    {
        label: "UNESCO",
        value: "Vinh Danh",
        desc: "Thương hiệu bản sắc Việt định vị giá trị toàn cầu",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
    },
    {
        label: "GIA Authorized",
        value: "Đối Tác",
        desc: "Được GIA ủy quyền phân phối & nhập khẩu chính ngạch",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
    },
    {
        label: "Dubai Conference",
        value: "Góp Mặt",
        desc: "Tham gia hội nghị kim cương quốc tế DMCC",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop"
    },
    {
        label: "Từ Thiện",
        value: "Đấu Giá",
        desc: "Đấu giá kim cương mã số đẹp vì cộng đồng",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2658&auto=format&fit=crop"
    },
];

export function BusinessResults() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Animate Zig-Zag Rows
        const rows = gsap.utils.toArray<HTMLElement>(".trust-row");
        rows.forEach((row, i) => {
            gsap.from(row, {
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%",
                }
            });
        });

        // Animate Stats
        gsap.from(".biz-stat", {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            scrollTrigger: {
                trigger: ".biz-stats-grid",
                start: "top 85%",
            }
        });

    }, { scope: containerRef });

    return (
        <section id="results" ref={containerRef} className="pb-24 pt-24 md:pb-32 md:pt-48 px-4 md:px-10 border-t border-white/10 relative overflow-hidden">

            {/* 1. TRUST SECTION - MAGAZINE LAYOUT */}
            <div className="max-w-7xl mx-auto mb-32 relative z-10">
                <div className="text-center mb-24">
                    <span className="text-neon-green font-bold tracking-[0.3em] uppercase text-xs md:text-sm block mb-4 animate-pulse">
                        Achievements
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white leading-tight">
                        Dấu Ấn <span className="text-white/50">& Thành Tựu</span>
                    </h2>
                    <div className="w-px h-24 bg-neon-green mx-auto mt-8" />
                </div>

                <div className="space-y-24 md:space-y-32">
                    {/* ROW 1: GLOBAL (Image Left, Text Right) */}
                    <div className="trust-row flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
                            <div className="absolute top-4 left-4 w-full h-full border border-white/20 z-0" />
                            <div className="relative w-full h-full z-10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                <Image
                                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                                    alt="Global Partner"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 text-[100px] md:text-[150px] font-black text-transparent stroke-text opacity-20 select-none z-0">
                                01
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-left">
                            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Vươn Tầm <br /> <span className="text-neon-green">Quốc Tế</span>
                            </h3>
                            <p className="text-white/70 text-lg leading-relaxed mb-8 border-l-2 border-neon-green pl-6">
                                Khẳng định vị thế trên bản đồ kim cương thế giới thông qua việc thiết lập quan hệ đối tác chiến lược với các tổ chức uy tín toàn cầu.
                            </p>
                            <ul className="space-y-3 text-sm text-white/60 uppercase tracking-widest">
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Đối tác được ủy quyền của GIA
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Thành viên sở giao dịch Dubai DMCC
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Tham gia hội nghị kim cương quốc tế
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* ROW 2: CSR (Text Left, Image Right) */}
                    <div className="trust-row flex flex-col-reverse md:flex-row items-center gap-12 md:gap-24">
                        <div className="w-full md:w-1/2 text-left md:text-right">
                            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Trách Nhiệm <br /> <span className="text-white/50">Xã Hội</span>
                            </h3>
                            <p className="text-white/70 text-lg leading-relaxed mb-8 border-l-2 md:border-l-0 md:border-r-2 border-white/30 pl-6 md:pl-0 md:pr-6">
                                Jemmia cam kết đóng góp tích cực cho cộng đồng thông qua các hoạt động thiện nguyện thiết thực, lan tỏa giá trị nhân văn.
                            </p>
                            <ul className="space-y-3 text-sm text-white/60 uppercase tracking-widest flex flex-col items-start md:items-end">
                                <li className="flex items-center gap-3 flex-row-reverse md:flex-row">
                                    Đấu giá từ thiện vì cộng đồng
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </li>
                                <li className="flex items-center gap-3 flex-row-reverse md:flex-row">
                                    Giải thưởng UNESCO vinh danh
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </li>
                                <li className="flex items-center gap-3 flex-row-reverse md:flex-row">
                                    Đồng hành cùng di sản văn hóa
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </li>
                            </ul>
                        </div>
                        <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
                            <div className="absolute bottom-4 right-4 w-full h-full border border-neon-green/30 z-0" />
                            <div className="relative w-full h-full z-10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                <Image
                                    src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2658&auto=format&fit=crop"
                                    alt="CSR"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -top-6 -left-6 text-[100px] md:text-[150px] font-black text-transparent stroke-text opacity-20 select-none z-0">
                                02
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. RESULTS SECTION (VISUAL STATS) */}
            <div className="max-w-7xl mx-auto pb-12 md:pb-24 pt-24 border-t border-white/5">
                <div className="flex items-center justify-between mb-16">
                    <span className="text-white text-sm uppercase tracking-[0.3em] opacity-50">Impact 2025</span>
                    <div className="h-px flex-1 bg-white/10 mx-6" />
                    <span className="text-neon-green font-bold text-lg">Key Figures</span>
                </div>

                <div className="biz-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat, i) => (
                        <div key={i} className="biz-stat group relative h-[350px] rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-neutral-900/40">

                            {/* Background Image (Always Visible now with Overlay) */}
                            <Image
                                src={stat.image}
                                alt={stat.label}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Gradient Overlay for Readability */}
                            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/60 to-black/90 group-hover:to-black/80 transition-colors duration-500" />

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-between p-8">
                                <div className="flex justify-between items-start">
                                    <span className="text-white/80 text-xs font-mono backdrop-blur-md bg-black/30 px-2 py-1 rounded border border-white/10">0{i + 1}</span>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 backdrop-blur-md">
                                        <div className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    </div>
                                </div>

                                <div>
                                    <div className="stat-value text-5xl lg:text-6xl font-black text-white mb-2 group-hover:text-neon-green transition-colors drop-shadow-xl">
                                        {stat.value}
                                    </div>
                                    <div className="h-0.5 w-12 bg-neon-green mb-4 group-hover:w-full transition-all duration-500" />
                                    <div className="text-white font-bold uppercase tracking-wider text-base mb-1 drop-shadow-lg">
                                        {stat.label}
                                    </div>
                                    <div className="text-white/90 text-sm leading-relaxed drop-shadow-md">
                                        {stat.desc}
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
