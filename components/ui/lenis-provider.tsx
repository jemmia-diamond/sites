"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export function LenisProvider({ children }: { children: any }) {
    return (
        <ReactLenis root>
            {children}
        </ReactLenis>
    );
}
