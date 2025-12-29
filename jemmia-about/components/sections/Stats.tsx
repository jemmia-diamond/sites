"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const STATS = [
    { label: "Doanh Thu Q3 (Target)", value: 104, suffix: "%" },
    { label: "Tăng Trưởng T9", value: 110, suffix: "%" },
    { label: "Livestream Record", value: 80, suffix: " Viên" },
    { label: "Đơn Hàng Bespoke", value: 1.2, suffix: " Tỷ" },
];

export function Stats() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const items = gsap.utils.toArray<HTMLElement>(".stat-item");

            items.forEach((item) => {
                const valueEl = item.querySelector(".stat-value");
                if (!valueEl) return;

                const targetValue = parseFloat(valueEl.getAttribute("data-value") || "0");

                // Counter animation
                gsap.fromTo(
                    valueEl,
                    { innerText: 0 },
                    {
                        innerText: targetValue,
                        duration: 2,
                        ease: "power2.out",
                        snap: { innerText: targetValue % 1 === 0 ? 1 : 0.1 },
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                            toggleActions: "play none none reverse",
                        },
                        onUpdate: function () {
                            const el = this.targets()[0];
                            if (el) {
                                const val = this.progress() * targetValue;
                                el.innerText = targetValue % 1 !== 0 ? val.toFixed(1) : Math.ceil(val);
                            }
                        }
                    }
                );

                // Fade in entire block
                gsap.from(item, {
                    y: 30,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%",
                    }
                });
            });
        },
        { scope: containerRef }
    );

    return (
        <section ref={containerRef} className="py-24 bg-neutral-900 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 md:px-10">
                <div className="text-center mb-16">
                    <h3 className="text-neon-green uppercase tracking-widest text-sm font-bold mb-2">Kết Quả Kinh Doanh</h3>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase">Những Con Số Ấn Tượng</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    {STATS.map((stat, i) => (
                        <div key={i} className="stat-item flex flex-col items-center gap-2">
                            <div
                                className="stat-value text-5xl md:text-7xl font-black text-neon-green font-sans"
                                data-value={stat.value}
                            >
                                0
                            </div>
                            <div className="text-sm md:text-base font-bold uppercase tracking-[0.1em] text-white flex items-center gap-1">
                                {stat.label} <span className="text-neutral-500 whitespace-nowrap">[{stat.suffix}]</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
