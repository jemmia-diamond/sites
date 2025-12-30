"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

const COLLECTIONS = [
    {
        title: "Máy GIA ID100",
        desc: "Thiết bị hiện đại nhất phân biệt tức thì kim cương tự nhiên với kim cương nuôi cấy (Lab-grown) & đá giả.",
        image: "	https://w.ladicdn.com/s850x700/664c47fd56f9a000124a324e/image-8-20241030081058--ailk.png", // Lab/Tech
    },
    {
        title: "GIA Match iD",
        desc: "Công nghệ soi mã số cạnh xác thực viên kim cương khớp hoàn toàn với chứng thư Kiểm định đi kèm.",
        image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2670&auto=format&fit=crop", // Microscope view
    },
    {
        title: "Kính Gemolite NXT",
        desc: "Kính hiển vi thế hệ mới của GIA dùng để đánh giá độ sạch và các chi tiết siêu nhỏ bên trong viên đá.",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop", // Science/Lab
    },
    {
        title: "Đội Ngũ Chuyên Gia",
        desc: "Từ giám đốc đến nhân viên tư vấn đều sở hữu các chứng chỉ chuyên môn của GIA (Diamond Essentials, Jewelry Essentials...).",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop", // Professional team
    },
];

export function Collections() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add("(min-width: 800px)", () => {
                const scrollWidth = containerRef.current!.scrollWidth;
                const viewportWidth = window.innerWidth;

                // Main Horizontal Scroll
                const mainTween = gsap.to(containerRef.current, {
                    x: -(scrollWidth - viewportWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top top",
                        end: `+=${scrollWidth - viewportWidth + 500}`,
                        pin: true,
                        anticipatePin: 1,
                        scrub: 1,
                        invalidateOnRefresh: true,
                        fastScrollEnd: false,
                        refreshPriority: 1,
                    },
                });

                // Internal Parallax for Images (Premium Feel)
                gsap.utils.toArray<HTMLElement>(".col-image").forEach((img) => {
                    gsap.fromTo(
                        img,
                        { xPercent: -15, scale: 1.2 },
                        {
                            xPercent: 15,
                            scale: 1.2,
                            ease: "none",
                            scrollTrigger: {
                                trigger: img.parentElement,
                                containerAnimation: mainTween,
                                start: "left right",
                                end: "right left",
                                scrub: true,
                            }
                        }
                    );
                });

                // Text Reveal Animation
                gsap.utils.toArray<HTMLElement>(".col-text").forEach((text) => {
                    gsap.from(text, {
                        y: 50,
                        opacity: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: text.parentElement?.parentElement,
                            containerAnimation: mainTween,
                            start: "left center",
                            toggleActions: "play none none reverse",
                        }
                    });
                });
            });

            return () => mm.revert();
        },
        { scope: sectionRef }
    );

    return (
        <section id="collections" ref={sectionRef} className="relative overflow-hidden z-30 bg-[#002422]">
            {/* Intro Text Overlay */}
            <div className="absolute top-10 left-10 z-20 pointer-events-none mix-blend-difference">
                <span className="text-neon-green font-bold tracking-[0.2em] uppercase text-sm block mb-2">
                    Technology
                </span>
                <h2 className="text-4xl font-black uppercase text-white">
                    Công Nghệ <br /> & Con Người
                </h2>
            </div>

            <div className="h-auto md:h-screen flex items-start md:items-center">
                <div ref={containerRef} className="flex flex-col md:flex-row h-auto md:h-full w-full md:w-fit">

                    {/* Title Slide */}
                    <div className="w-full md:w-screen h-[50vh] md:h-full flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black relative">
                        <div className="absolute inset-0 opacity-30">
                            <Image
                                src="https://images.unsplash.com/photo-1617038224558-28ad3fb558a7?q=80&w=2000&auto=format&fit=crop" // Diamond Workshop
                                alt="Craftsmanship"
                                fill
                                className="object-cover grayscale"
                            />
                        </div>
                        <h2 className="relative z-10 text-[12vw] md:text-[10vw] font-black uppercase text-white leading-none text-center mix-blend-difference">
                            Tiên Phong <br />
                            <span className="text-white/50">Công Nghệ</span>
                        </h2>
                    </div>

                    {/* Collection Items */}
                    {COLLECTIONS.map((col, i) => (
                        <div key={i} className="w-full md:w-[60vw] h-[80vh] md:h-full shrink-0 relative flex flex-col justify-end p-6 md:p-20 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden group">
                            {/* BG Image */}
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <div className="col-image w-full h-full relative">
                                    <Image
                                        src={col.image}
                                        alt={col.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                            </div>

                            <div className="absolute top-6 right-6 md:top-10 md:right-10 text-6xl md:text-9xl font-black text-white/10 select-none z-10">
                                0{i + 1}
                            </div>

                            <div className="col-text relative z-10 max-w-2xl md:translate-y-10 md:group-hover:translate-y-0 transition-transform duration-500">
                                <div className="w-12 h-1 bg-neon-green mb-4 md:mb-6" />
                                <h3 className="text-3xl md:text-6xl font-black uppercase text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
                                    {col.title}
                                </h3>
                                <p className="text-base md:text-2xl text-white/90 font-light leading-relaxed drop-shadow-md">
                                    {col.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
