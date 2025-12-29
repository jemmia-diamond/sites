"use client";

import { ReactLenis } from 'lenis/react'

export function LenisProvider({ children }: { children: any }) {
    return (
        <ReactLenis root>
            {children}
        </ReactLenis>
    );
}
