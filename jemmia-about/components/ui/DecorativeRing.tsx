"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);



function RingModel() {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF("/model/scene.gltf");

    // PROXY REFS: GSAP will animate these invisible values
    // HERO INITIAL STATE:
    // Scale increased to 1.3
    const posTarget = useRef(new THREE.Vector3(3.5, -0.5, 0));
    const rotTarget = useRef(new THREE.Vector3(0, Math.PI / 2, 0));
    const scaleTarget = useRef(new THREE.Vector3(1.3, 1.3, 1.3));

    useLayoutEffect(() => {
        let mm = gsap.matchMedia();
        const scrollConfig = {
            scrub: 1,
            ease: "power1.inOut"
        };

        mm.add({
            // DESKTOP
            isDesktop: "(min-width: 800px)",
            // MOBILE
            isMobile: "(max-width: 799px)",
        }, (context) => {
            const { isDesktop, isMobile } = context.conditions as { isDesktop: boolean; isMobile: boolean };

            // --- INITIAL SETUP ---
            if (isMobile) {
                // Mobile: High up, centered, slightly deep
                posTarget.current.set(0, 2, -2);
                scaleTarget.current.set(0.6, 0.6, 0.6);
            } else {
                // Desktop: Right side highlight
                posTarget.current.set(3.5, -0.5, 0);
                scaleTarget.current.set(1.3, 1.3, 1.3);
            }

            // --- ANIMATION TIMELINES ---

            // 1. Hero -> KeyEvents (ID: vision)
            gsap.to(posTarget.current, {
                x: isMobile ? 0 : -4,
                y: isMobile ? -1 : 0,
                z: isMobile ? -4 : -2, // Deep background on mobile
                scrollTrigger: { trigger: "#vision", start: "top bottom", end: "top center", ...scrollConfig }
            });
            gsap.to(scaleTarget.current, {
                x: isMobile ? 0.5 : 0.8,
                y: isMobile ? 0.5 : 0.8,
                z: isMobile ? 0.5 : 0.8,
                scrollTrigger: { trigger: "#vision", start: "top bottom", end: "top center", ...scrollConfig }
            });
            gsap.to(rotTarget.current, {
                x: 0.2,
                y: Math.PI,
                scrollTrigger: { trigger: "#vision", start: "top bottom", end: "bottom bottom", scrub: 1 }
            });

            // 2. KeyEvents -> Timeline (ID: timeline)
            gsap.to(posTarget.current, {
                x: isMobile ? 0 : 5,
                y: isMobile ? 0 : 1,
                z: isMobile ? -4 : -3,
                scrollTrigger: { trigger: "#timeline", start: "top bottom", end: "top center", ...scrollConfig }
            });
            gsap.to(rotTarget.current, {
                x: 0,
                y: Math.PI * 1.5,
                scrollTrigger: { trigger: "#timeline", start: "top bottom", end: "bottom bottom", scrub: 1 }
            });

            // 3. Timeline -> Collections (ID: collections)
            gsap.to(posTarget.current, {
                x: isMobile ? 0 : 5.5,
                y: isMobile ? 3 : 3,
                z: isMobile ? -5 : -5,
                scrollTrigger: { trigger: "#collections", start: "top bottom", end: "top center", ...scrollConfig }
            });
            gsap.to(scaleTarget.current, {
                x: 0.5, y: 0.5, z: 0.5,
                scrollTrigger: { trigger: "#collections", start: "top bottom", end: "top center", ...scrollConfig }
            });

            // 4. Collections -> Business Results (ID: results)
            // Row 1
            gsap.to(posTarget.current, {
                x: isMobile ? 0 : -4.5,
                y: isMobile ? -2 : 0,
                z: isMobile ? -3 : -2,
                scrollTrigger: { trigger: "#results", start: "top bottom", end: "top center", ...scrollConfig }
            });
            gsap.to(scaleTarget.current, {
                x: isMobile ? 0.5 : 0.7,
                y: isMobile ? 0.5 : 0.7,
                z: isMobile ? 0.5 : 0.7,
                scrollTrigger: { trigger: "#results", start: "top bottom", end: "top center", ...scrollConfig }
            });
            // Row 2
            gsap.to(posTarget.current, {
                x: isMobile ? 0 : 4.5,
                y: isMobile ? -2.5 : -1,
                scrollTrigger: { trigger: "#results", start: "30% bottom", end: "50% center", ...scrollConfig }
            });
            gsap.to(rotTarget.current, {
                x: 0.5,
                y: Math.PI * 3,
                scrollTrigger: { trigger: "#results", start: "top bottom", end: "bottom bottom", scrub: 1 }
            });

            // 5. Results -> Culture (ID: culture)
            gsap.to(posTarget.current, {
                x: isMobile ? 0 : -5,
                y: isMobile ? 3.5 : -2.5,
                z: isMobile ? -4 : -2,
                scrollTrigger: { trigger: "#culture", start: "top bottom", end: "top center", ...scrollConfig }
            });
            gsap.to(rotTarget.current, {
                x: 0,
                y: Math.PI * 4,
                scrollTrigger: { trigger: "#culture", start: "top bottom", end: "bottom bottom", scrub: 1 }
            });

            // 6. Culture -> Conclusion (ID: conclusion)
            gsap.to(posTarget.current, {
                x: 0,
                y: isMobile ? 1 : 1.2,
                z: isMobile ? -2 : 0,
                scrollTrigger: { trigger: "#conclusion", start: "top bottom", end: "center center", ...scrollConfig }
            });
            gsap.to(scaleTarget.current, {
                x: 0.5, y: 0.5, z: 0.5,
                scrollTrigger: { trigger: "#conclusion", start: "top bottom", end: "center center", ...scrollConfig }
            });
            gsap.to(rotTarget.current, {
                y: Math.PI * 8,
                scrollTrigger: { trigger: "#conclusion", start: "top bottom", end: "bottom bottom", scrub: 1 }
            });

            return () => {
                // Cleanup handled by gsap.context but good practice if needed custom cleanup
            };
        });

        return () => mm.revert(); // Cleanup matchMedia
    }, []);

    // Continuous Frame Loop: LERP to targets
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Dampening factor - roughly 0.1 for 60fps
        const damp = 1 - Math.exp(-3 * delta);

        groupRef.current.position.lerp(posTarget.current, damp);
        groupRef.current.scale.lerp(scaleTarget.current, damp);

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotTarget.current.x, damp);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotTarget.current.y, damp);

        // Idle animation
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
        groupRef.current.position.y += Math.sin(t * 0.5) * 0.005;
    });

    return (
        <group ref={groupRef} position={[3.5, -0.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.3, 1.3, 1.3]}>
            {/* Initial position matches targets */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <primitive object={scene} />
            </Float>
        </group>
    );
}

// Preload the model
useGLTF.preload("/model/scene.gltf");

import { useMenu } from "@/components/context/MenuContext";

export function DecorativeRing() {
    const { isOpen } = useMenu();

    return (
        <div
            className={`fixed inset-0 z-1 pointer-events-none transition-opacity duration-500 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
        >
            <Canvas
                className="pointer-events-none"
                style={{ pointerEvents: "none" }}
                gl={{ alpha: true, antialias: true }}
                dpr={[1, 2]}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={1} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <Environment preset="studio" />

                <RingModel />
            </Canvas>
        </div>
    );
}