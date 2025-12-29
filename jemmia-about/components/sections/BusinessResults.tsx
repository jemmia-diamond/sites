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
        label: "Doanh Thu Q3",
        value: "104%",
        desc: "Đạt mục tiêu kế hoạch",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
    },
    {
        label: "Tăng Trưởng T9",
        value: "110%",
        desc: "Vượt kế hoạch tháng",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
    },
    {
        label: "Siêu Livestream",
        value: "80h",
        desc: "Chiến dịch 'săn deal' - 80 viên kim cương",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2658&auto=format&fit=crop"
    },
    {
        label: "Đơn Bespoke",
        value: "1.2 Tỷ",
        desc: "Bộ trang sức Eternal Love",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop"
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
                        Core Values
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white leading-tight">
                        Bảo Chứng <span className="text-white/50">Niềm Tin</span>
                    </h2>
                    <div className="w-[1px] h-24 bg-neon-green mx-auto mt-8" />
                </div>

                <div className="space-y-24 md:space-y-32">

                    {/* ROW 1: GIA (Image Left, Text Right) */}
                    <div className="trust-row flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
                            <div className="absolute top-4 left-4 w-full h-full border border-white/20 z-0" />
                            <div className="relative w-full h-full z-10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                <Image
                                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2670&auto=format&fit=crop"
                                    alt="GIA Lab"
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
                                Nói Có Giấy <br /> <span className="text-neon-green">Mách Có Máy</span>
                            </h3>
                            <p className="text-white/70 text-lg leading-relaxed mb-8 border-l-2 border-neon-green pl-6">
                                Minh bạch hóa toàn bộ quy trình kiểm định với hệ thống máy móc chuẩn quốc tế. Khách hàng được trực tiếp trải nghiệm và kiểm chứng chất lượng.
                            </p>
                            <ul className="space-y-3 text-sm text-white/60 uppercase tracking-widest">
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Máy kiểm định GIA ID100
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Soi mã số cạnh kim cương
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Quy trình Minđ-set 1:1
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* ROW 2: JOURNEY (Text Left, Image Right) */}
                    <div className="trust-row flex flex-col-reverse md:flex-row items-center gap-12 md:gap-24">
                        <div className="w-full md:w-1/2 text-left md:text-right">
                            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Hành Trình <br /> <span className="text-white/50">Kim Cương</span>
                            </h3>
                            <p className="text-white/70 text-lg leading-relaxed mb-8 border-l-2 md:border-l-0 md:border-r-2 border-white/30 pl-6 md:pl-0 md:pr-6">
                                Quy trình tuyển chọn khắt khe, khẳng định triết lý "Minh bạch tuyệt đối". Mỗi viên kim cương là một hành trình di sản đầy tự hào.
                            </p>
                            <ul className="space-y-3 text-sm text-white/60 uppercase tracking-widest flex flex-col items-start md:items-end">
                                <li className="flex items-center gap-3 flex-row-reverse md:flex-row">
                                    Tuyển chọn thô nghiêm ngặt
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </li>
                                <li className="flex items-center gap-3 flex-row-reverse md:flex-row">
                                    Chế tác thủ công tinh xảo
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </li>
                                <li className="flex items-center gap-3 flex-row-reverse md:flex-row">
                                    Chứng nhận quốc tế uy tín
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </li>
                            </ul>
                        </div>
                        <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
                            <div className="absolute bottom-4 right-4 w-full h-full border border-neon-green/30 z-0" />
                            <div className="relative w-full h-full z-10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                <Image
                                    src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop"
                                    alt="Journey"
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
                    <div className="h-[1px] flex-1 bg-white/10 mx-6" />
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
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90 group-hover:to-black/80 transition-colors duration-500" />

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
