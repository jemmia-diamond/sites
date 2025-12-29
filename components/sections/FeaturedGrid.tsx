"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const FEATURES = [
    {
        title: "DMCC - Dubai HQ",
        description: "Khai trương trụ sở tại DMCC. Khẳng định doanh nghiệp Việt đủ bản lĩnh bước vào sân chơi toàn cầu.",
        tag: "Vươn Tầm Quốc Tế",
    },
    {
        title: "Minh Bạch Tuyệt Đối",
        description: "Chiến dịch 'Nói có giấy - Mách có máy'. Minh bạch hóa quy trình kiểm định với máy móc chuẩn quốc tế.",
        tag: "Công Nghệ & Niềm Tin",
    },
    {
        title: "Triển Lãm Thượng Lưu",
        description: "Trình diễn BST độc bản tại VOW Legacy, SYMPHONY, OSAKA. Tôn vinh vẻ đẹp trường tồn.",
        tag: "Sự Kiện & Kết Nối",
    },
    {
        title: "Hợp Tác Giáo Dục",
        description: "Tham gia Hội đồng doanh nghiệp RMIT & Tài trợ Vàng Metamen 3D Innovation Day (20/09).",
        tag: "Đối Tác Chiến Lược",
    },
];

export function FeaturedGrid() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const items = gsap.utils.toArray<HTMLElement>(".feature-card");

            items.forEach((item, i) => {
                gsap.from(item, {
                    y: 100,
                    opacity: 0,
                    duration: 1,
                    delay: i * 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%",
                    },
                });
            });
        },
        { scope: containerRef }
    );

    return (
        <section ref={containerRef} className="py-24 px-4 md:px-10 bg-black text-white relative z-10">
            {/* Section Header */}
            <div className="mb-16 border-b border-white/20 pb-8 flex flex-col md:flex-row justify-between items-end">
                <div>
                    <span className="text-neon-green font-bold tracking-widest uppercase text-sm">Chiến Lược & Phát Triển</span>
                    <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mt-2">
                        Tầm Nhìn <span className="text-white/50">Chiến Lược</span>
                    </h2>
                </div>
                <span className="text-sm tracking-widest text-neutral-400 mt-4 md:mt-0 text-right">
                    JEMMIA GLOBAL VISION
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FEATURES.map((feat, i) => (
                    <div
                        key={i}
                        className="feature-card group relative h-[350px] border border-white/10 p-8 flex flex-col justify-between overflow-hidden hover:border-neon-green/50 transition-colors duration-500 bg-neutral-900/50 backdrop-blur-sm"
                    >
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-neon-green border border-neon-green/20">
                                {feat.tag}
                            </div>
                            <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">0{i + 1}</span>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-bold mb-3 uppercase group-hover:text-neon-green transition-colors">{feat.title}</h3>
                            <p className="text-neutral-400 text-lg leading-relaxed group-hover:text-white transition-colors">
                                {feat.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
