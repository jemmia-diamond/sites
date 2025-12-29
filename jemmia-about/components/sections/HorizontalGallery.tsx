"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const GALLERY_ITEMS = [
    {
        title: "LOTUS & SEN QUÝ HIỂN",
        subtitle: "Kết Hợp Cùng Hoa Hậu Lương Thùy Linh",
        desc: "Lấy cảm hứng từ hoa sen, tôn vinh vẻ đẹp thanh tao nhưng đầy nội lực của người phụ nữ Việt.",
        color: "bg-pink-950/30",
    },
    {
        title: "VỮNG CỘI VƯƠN XA",
        subtitle: "Ghim Cài: Di Sản Non Nước",
        desc: "Hình ảnh chim Lạc và mặt Trống Đồng - Biểu tượng cho cội nguồn và khát vọng vươn xa.",
        color: "bg-yellow-950/30",
    },
    {
        title: "HÀO KHÍ ĐÔNG A",
        subtitle: "Ghim Cài: Di Sản Non Nước",
        desc: "Biểu tượng cho trí tuệ và bản lĩnh dẫn đầu của người Việt.",
        color: "bg-red-950/30",
    },
    {
        title: "VỮNG THẾ PHỒN VINH",
        subtitle: "Ghim Cài: Di Sản Non Nước",
        desc: "Hình tượng bông lúa đại diện cho sự no ấm và thịnh vượng bền vững.",
        color: "bg-green-950/30",
    },
];

export function HorizontalGallery() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const scrollWidth = sectionRef.current!.scrollWidth;
            const amountToScroll = scrollWidth - window.innerWidth;

            gsap.to(sectionRef.current, {
                x: -amountToScroll,
                ease: "none",
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: "top top",
                    end: `+=${amountToScroll + 500}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                },
            });
        },
        { scope: triggerRef }
    );

    return (
        <section ref={triggerRef} className="overflow-hidden bg-neutral-950 border-t border-white/10">
            <div className="h-screen py-20 relative flex items-center">

                <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:block mix-blend-difference">
                    <h3 className="text-white -rotate-90 text-sm uppercase tracking-[0.5em] whitespace-nowrap origin-center">
                        Art of Craftsmanship
                    </h3>
                </div>

                <div ref={sectionRef} className="flex gap-12 px-10 md:px-20 w-fit h-[65vh]">
                    {/* Intro Slide */}
                    <div className="w-[85vw] md:w-[35vw] flex flex-col justify-center h-full gap-8 shrink-0 border-r border-white/10 pr-12">
                        <span className="text-neon-green uppercase tracking-widest font-bold">Nghệ Thuật Chế Tác</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase text-white leading-[0.9]">
                            Bộ Sưu Tập <br /><span className="text-white/50">Di Sản</span>
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Các tác phẩm mang đậm tính biểu tượng văn hóa, kết hợp giữa tay nghề thủ công tinh xảo và câu chuyện bản sắc Việt.
                        </p>
                    </div>

                    {/* Gallery Items */}
                    {GALLERY_ITEMS.map((item, i) => (
                        <div
                            key={i}
                            className={`w-[85vw] md:w-[50vw] h-full shrink-0 relative flex flex-col justify-between p-10 border border-white/10 hover:border-white/30 transition-all duration-500 ${item.color} rounded-sm`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="text-4xl font-black text-white/10 font-serif">0{i + 1}</div>
                                <div className="px-4 py-2 bg-black/40 backdrop-blur rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-white">
                                    Collection
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h4 className="text-neon-green uppercase tracking-wider text-sm mb-3 font-bold">{item.subtitle}</h4>
                                <h3 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4 leading-tight">{item.title}</h3>
                                <div className="h-px w-20 bg-white/20 mb-4" />
                                <p className="text-white/90 text-lg leading-relaxed font-light">{item.desc}</p>
                            </div>
                        </div>
                    ))}

                    <div className="w-[10vw] shrink-0" />
                </div>
            </div>
        </section>
    );
}
