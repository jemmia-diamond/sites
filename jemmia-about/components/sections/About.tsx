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
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                {/* Left: Image Placeholder */}
                <div className="about-image relative w-full md:w-1/2 aspect-3/4 max-w-[500px] bg-neutral-800 rounded-lg overflow-hidden border border-white/10">
                    <img
                        src="https://w.ladicdn.com/s650x600/664c47fd56f9a000124a324e/20241029-154851-20241029084918-sjcvf.jpeg"
                        alt="Jemmia Store"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 space-y-8 md:pr-14">
                    <h2 className="about-text text-4xl md:text-6xl font-sans font-black uppercase tracking-tight leading-none">
                        Triết Lý & <span className="text-neon-green">Định Vị</span>
                    </h2>
                    <div className="about-text space-y-6 text-lg text-neutral-400 font-sans leading-relaxed">
                        <div className="space-y-2">
                            <h3 className="text-white font-bold uppercase tracking-wider text-xl">Sứ Mệnh</h3>
                            <p>
                                Giúp khách hàng tích lũy kim cương một cách an toàn bền vững và không ngừng hoàn thiện để mang đến sản phẩm giá trị xứng tầm với khách hàng.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-bold uppercase tracking-wider text-xl">Tầm nhìn</h3>
                            <p>
                                Trở thành công ty chuyên gia tại Việt Nam trong lĩnh vực kim cương, mang đến sản phẩm kim cương chất lượng cùng thiết kế trang sức sáng tạo tôn vinh vẻ đẹp, vươn tầm thế giới.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-bold uppercase tracking-wider text-xl">Định Vị</h3>
                            <p>
                                Jemmia mong muốn định vị mình là thương hiệu trang sức mang tinh thần dân tộc, tiếp biến tinh hoa văn hóa và nghệ thuật vào từng bộ sưu tập trang sức, đồng thời đáp ứng các tiêu chuẩn quốc tế để tạo nên những tác phẩm xứng tầm đẳng cấp toàn cầu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
