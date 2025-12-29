"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function About() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                    end: "bottom bottom",
                },
            });

            tl.from(".about-image", {
                x: -50,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out",
            })
                .from(
                    ".about-text",
                    {
                        x: 50,
                        opacity: 0,
                        duration: 1.2,
                        stagger: 0.1,
                        ease: "power3.out",
                    },
                    "-=0.8"
                );
        },
        { scope: containerRef }
    );

    return (
        <section id="vision" ref={containerRef} className="py-32 px-4 md:px-10 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                {/* Left: Image Placeholder */}
                <div className="about-image relative w-full md:w-1/2 aspect-3/4 max-w-[500px] bg-neutral-800 rounded-lg overflow-hidden border border-white/10">
                    {/* Placeholder for "Lando casual/helmet off" */}
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 font-bold uppercase tracking-widest text-2xl">
                        Jemmia Store
                    </div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 space-y-8">
                    <h2 className="about-text text-4xl md:text-6xl font-sans font-black uppercase tracking-tight leading-none">
                        Triết Lý & <span className="text-neon-green">Định Vị</span>
                    </h2>
                    <div className="about-text space-y-6 text-lg text-neutral-400 font-sans leading-relaxed">
                        <div className="space-y-2">
                            <h3 className="text-white font-bold uppercase tracking-wider text-xl">Sứ Mệnh</h3>
                            <p>
                                Giúp khách hàng tích lũy kim cương an toàn và bền vững.
                                Jemmia không chỉ cung cấp trang sức mà còn kiến tạo kênh lưu giữ tài sản giá trị vượt thời gian.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-bold uppercase tracking-wider text-xl">Định Vị</h3>
                            <p>
                                Thương hiệu mang tinh thần dân tộc, nỗ lực đưa văn hóa và nghệ thuật Việt Nam vào từng thiết kế,
                                đồng thời tuân thủ các tiêu chuẩn kiểm định quốc tế nghiêm ngặt nhất.
                            </p>
                        </div>
                    </div>
                    <div className="about-text pt-4">
                        <button className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-neon-green transition-colors">
                            Tìm Hiểu Thêm
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
