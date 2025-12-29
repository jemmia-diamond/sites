"use client";

import { Marquee } from "@/components/ui/marquee";

export function Partners() {
    return (
        <section className="py-20 text-white">
            <div className="text-center mb-12">
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Official Partners</h3>
            </div>

            {/* Reuse Marquee for partners or simple grid */}
            <div className="opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <Marquee
                    text="MCLAREN • GOOGLE • DELL TECHNOLOGIES • DARKTRACE • CISCO • OKX • RICHARD MILLE"
                    duration={40}
                    className="bg-transparent text-white border-y border-white/10"
                    repeat={6}
                />
            </div>
        </section>
    );
}
