"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera, useGLTF, MeshRefractionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMenu } from "@/components/context/MenuContext";
import { useMetalTexture } from "@/hooks/useMetalTexture";
import { Suspense } from "react";
import { StringUtils } from "@/utils/stringUtils";

gsap.registerPlugin(ScrollTrigger);

function DiamondModel() {
    const groupRef = useRef<THREE.Group>(null);
    const floatRef = useRef<THREE.Group>(null);
    const { nodes } = useGLTF('/model/diamond.gltf');
    const metalTexture = useMetalTexture();

    const posTarget = useRef(new THREE.Vector3(3.5, -0.5, -3));
    const rotTarget = useRef(new THREE.Vector3(Math.PI * 3, Math.PI, 0));
    const scaleTarget = useRef(new THREE.Vector3(0.5, 0.5, 0.5));

    const { camera, size } = useThree();

    const get3DPosition = (xPx: number, yPx: number, z: number) => {
        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        // Calculate visible height at the target Z depth
        const depth = Math.abs(perspectiveCamera.position.z - z);
        const vFOV = THREE.MathUtils.degToRad(perspectiveCamera.fov);
        const visibleHeight = 2 * Math.tan(vFOV / 2) * depth;
        const visibleWidth = visibleHeight * perspectiveCamera.aspect;

        // Map pixel coordinates to 3D coordinates
        // xPx is from left edge
        const x = -visibleWidth / 2 + (xPx / size.width) * visibleWidth;

        // For y, if needed (currently not requested for specific pixel Y, but good to have)
        // yPx from top edge
        const y = visibleHeight / 2 - (yPx / size.height) * visibleHeight;

        return { x, y, z };
    };

    useLayoutEffect(() => {
        let mm = gsap.matchMedia();

        mm.add({
            // DESKTOP
            isDesktop: "(min-width: 800px)",
            // MOBILE
            isMobile: "(max-width: 799px)",
        }, (context) => {
            const { isMobile } = context.conditions as { isMobile: boolean };

            // 0. Hero (Initial)
            const stateHero = {
                pos: isMobile ? new THREE.Vector3(0, 4.5, -10) : new THREE.Vector3(3.5, 0, -5),
                scale: isMobile ? new THREE.Vector3(0.4, 0.4, 0.4) : new THREE.Vector3(0.5, 0.5, 0.5),
                rot: new THREE.Vector3(Math.PI * 3, Math.PI, 0)
            };

            // 1. Vision (Left, closer)
            const stateVision = {
                pos: isMobile ? new THREE.Vector3(0, -8.5, -18) : new THREE.Vector3(12.5, 1.5, -15),
                scale: isMobile ? new THREE.Vector3(0.35, 0.35, 0.35) : new THREE.Vector3(0.6, 0.6, 0.6),
                rot: new THREE.Vector3(Math.PI / 2, Math.PI, 0)
            };

            // 2. Culture (Right, closer)
            const stateCulture = {
                pos: isMobile ? new THREE.Vector3(0, 8.5, -17) : new THREE.Vector3(11.5, 1.5, -15),
                // Scale stays same as Vision (0.6 / 0.35)
                rot: new THREE.Vector3(Math.PI * 2, Math.PI * 2, 0)
            };

            // 3. Timeline (Left, closer)
            // Calculate dynamic position based on actual DOM element
            let timelineX = 32; // Default fallback (16px padding + 16px offset)
            const timelineLine = document.querySelector('#timeline .bg-neon-green');
            if (timelineLine) {
                const rect = timelineLine.getBoundingClientRect();
                timelineX = rect.left + rect.width / 2;
            }

            const timelineMobilePos = get3DPosition(timelineX, 0, -100);

            const stateTimeline = {
                pos: isMobile
                    ? new THREE.Vector3(timelineMobilePos.x, 0, -100)
                    : new THREE.Vector3(0, 0.5, -100),
                rot: new THREE.Vector3(0, Math.PI * 2, 0)
            };

            // 4. Collections (Right, closer)
            const stateCollections = {
                pos: isMobile ? new THREE.Vector3(0, 3, -5) : new THREE.Vector3(12.5, -0.5, -18),
                // Scale stays same
                rot: new THREE.Vector3(0, Math.PI * 2.5, 0)
            };

            // 5. Results (Left, closer)
            // User requested right-8, bottom-8 for BOTH mobile and desktop.
            // Using safe margin of 60px for mobile, and 250px for desktop to prevent clipping.
            const marginX = isMobile ? 60 : 320;
            const marginY = isMobile ? 60 : 200;
            const targetZ = isMobile ? -25 : -40;

            const resultsCornerPos = get3DPosition(size.width - marginX, size.height - marginY, targetZ);

            const stateResults = {
                pos: new THREE.Vector3(resultsCornerPos.x, resultsCornerPos.y, targetZ),
                rot: new THREE.Vector3(Math.PI / 2, Math.PI, 0)
            };

            // 6. Conclusion (Center)
            const stateConclusion = {
                pos: isMobile ? new THREE.Vector3(0, 5.5, -15) : new THREE.Vector3(0, 9, -25),
                scale: isMobile ? new THREE.Vector3(0.4, 0.4, 0.4) : new THREE.Vector3(0.6, 0.6, 0.6),
                rot: new THREE.Vector3(0, Math.PI * 4, 0) // Reduced spin
            };


            // --- SET INITIAL ---
            posTarget.current.copy(stateHero.pos);
            scaleTarget.current.copy(stateHero.scale);
            // Rot target initial is implied

            // GSAP Config - Instant Scrub for snappy response
            const scrollConfig = {
                scrub: 0,
                ease: "none" // Linear ease for scroll
            };


            // --- ANIMATION TIMELINES (Linked with fromTo) ---

            // 1. Hero -> Vision
            gsap.fromTo(posTarget.current,
                { x: stateHero.pos.x, y: stateHero.pos.y, z: stateHero.pos.z },
                {
                    x: stateVision.pos.x, y: stateVision.pos.y, z: stateVision.pos.z,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#vision", start: "top bottom", end: "top center", ...scrollConfig }
                }
            );
            gsap.fromTo(scaleTarget.current,
                { x: stateHero.scale.x, y: stateHero.scale.y, z: stateHero.scale.z },
                {
                    x: stateVision.scale.x, y: stateVision.scale.y, z: stateVision.scale.z,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#vision", start: "top bottom", end: "top center", ...scrollConfig }
                }
            );
            gsap.fromTo(rotTarget.current,
                { x: stateHero.rot.x, y: stateHero.rot.y }, // z ignored in tweens usually
                {
                    x: stateVision.rot.x, y: stateVision.rot.y,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#vision", start: "top bottom", end: "bottom bottom", ...scrollConfig }
                }
            );

            // 2. Vision -> Culture
            gsap.fromTo(posTarget.current,
                { x: stateVision.pos.x, y: stateVision.pos.y, z: stateVision.pos.z },
                {
                    x: stateCulture.pos.x, y: stateCulture.pos.y, z: stateCulture.pos.z,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#culture", start: "top bottom", end: "top center", ...scrollConfig }
                }
            );

            gsap.fromTo(rotTarget.current,
                { x: stateVision.rot.x, y: stateVision.rot.y },
                {
                    x: stateCulture.rot.x, y: stateCulture.rot.y,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#culture", start: "top bottom", end: "bottom bottom", ...scrollConfig }
                }
            );

            // 3. Culture -> Timeline
            gsap.fromTo(posTarget.current,
                { x: stateCulture.pos.x, y: stateCulture.pos.y, z: stateCulture.pos.z },
                {
                    x: stateTimeline.pos.x, y: stateTimeline.pos.y, z: stateTimeline.pos.z,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#timeline", start: "top bottom", end: "top center", ...scrollConfig }
                }
            );
            gsap.fromTo(rotTarget.current,
                { x: stateCulture.rot.x, y: stateCulture.rot.y },
                {
                    x: stateTimeline.rot.x, y: stateTimeline.rot.y,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#timeline", start: "top bottom", end: "top center", ...scrollConfig }
                }
            );

            // // 4. Timeline -> Collections
            // gsap.fromTo(posTarget.current,
            //     { x: stateTimeline.pos.x, y: stateTimeline.pos.y, z: stateTimeline.pos.z },
            //     {
            //         x: stateCollections.pos.x, y: stateCollections.pos.y, z: stateCollections.pos.z,
            //         immediateRender: false,
            //         scrollTrigger: { trigger: "#collections", start: "top bottom", end: "top center", ...scrollConfig }
            //     }
            // );
            // // Rot change
            // gsap.fromTo(rotTarget.current,
            //     { x: stateTimeline.rot.x, y: stateTimeline.rot.y },
            //     {
            //         x: stateCollections.rot.x, y: stateCollections.rot.y,
            //         immediateRender: false,
            //         scrollTrigger: { trigger: "#collections", start: "top bottom", end: "bottom bottom", ...scrollConfig }
            //     }
            // );

            // 5. Collections -> Results
            gsap.fromTo(posTarget.current,
                { x: stateTimeline.pos.x, y: stateTimeline.pos.y, z: stateTimeline.pos.z },
                {
                    x: stateResults.pos.x, y: stateResults.pos.y, z: stateResults.pos.z,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#results", start: "top bottom", end: "top center", ...scrollConfig }
                }
            );
            gsap.fromTo(rotTarget.current,
                { x: stateTimeline.rot.x, y: stateTimeline.rot.y }, // From Timeline rot
                {
                    x: stateResults.rot.x, y: stateResults.rot.y,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#results", start: "top bottom", end: "bottom bottom", ...scrollConfig }
                }
            );

            // 6. Results -> Conclusion
            gsap.fromTo(posTarget.current,
                { x: stateResults.pos.x, y: stateResults.pos.y, z: stateResults.pos.z },
                {
                    x: stateConclusion.pos.x, y: stateConclusion.pos.y, z: stateConclusion.pos.z,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#conclusion", start: "top bottom", end: "center center", ...scrollConfig }
                }
            );
            gsap.fromTo(scaleTarget.current,
                { x: stateVision.scale.x, y: stateVision.scale.y, z: stateVision.scale.z }, // Was 0.5
                {
                    x: stateConclusion.scale.x, y: stateConclusion.scale.y, z: stateConclusion.scale.z,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#conclusion", start: "top bottom", end: "center center", ...scrollConfig }
                }
            );
            gsap.fromTo(rotTarget.current,
                { x: stateResults.rot.x, y: stateResults.rot.y },
                {
                    x: stateConclusion.rot.x, y: stateConclusion.rot.y,
                    immediateRender: false,
                    scrollTrigger: { trigger: "#conclusion", start: "top bottom", end: "bottom bottom", ...scrollConfig }
                }
            );

            return () => {
                // Cleanup handled by gsap.context
            };
        });

        return () => mm.revert(); // Cleanup matchMedia
    }, [size.width, size.height]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Dampening factor - Increased for snappier follow (Double speed)
        const damp = 1 - Math.exp(-6 * delta);

        groupRef.current.position.lerp(posTarget.current, damp);
        groupRef.current.scale.lerp(scaleTarget.current, damp);

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotTarget.current.x, damp);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotTarget.current.y, damp);

        // Idle animation
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;

        // Floating effect
        if (floatRef.current) {
            floatRef.current.position.y = Math.sin(t * 1.5) * 0.5; // Speed 1.5, Amp 0.15
        }
    });

    return (
        <group ref={groupRef}>
            <group ref={floatRef}>
                {nodes.Diamond_Round && (
                    <mesh geometry={(nodes.Diamond_Round as THREE.Mesh).geometry} frustumCulled={true} key={`mesh-node-${StringUtils.random(6)}`} castShadow receiveShadow>
                        <MeshRefractionMaterial
                            envMap={metalTexture}
                            bounces={3}
                            aberrationStrength={0.003}
                            ior={2.418}
                            fresnel={1}
                            opacity={0.95}
                            color={"#ffffff"}
                        />
                    </mesh>
                )}
            </group>
        </group>
    );
}

// Preload the model
useGLTF.preload("/model/diamond.gltf");

// Internal component for Environment to safely use R3F hooks
function SceneEnvironment() {
    const metalTexture = useMetalTexture();

    return (
        <Environment
            map={metalTexture}
            environmentIntensity={1}
            backgroundIntensity={1}
            environmentRotation={[0, Math.PI / 2, 0]}
            backgroundRotation={[0, Math.PI / 2, 0]}
            background={false}
            backgroundBlurriness={0.5}
        />
    );
}

export function DiamondScene() {
    const { isOpen } = useMenu();

    return (
        <div
            className={`fixed inset-0 z-1 pointer-events-none transition-opacity duration-500 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
        >
            <Canvas
                className="pointer-events-none"
                style={{ pointerEvents: "none" }}
                gl={{
                    antialias: false,
                    powerPreference: "low-power",
                    precision: "lowp",
                }}
                dpr={[1, 1.5]}
                shadows
            >
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.3} color={0xffffff} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                <pointLight position={[-10, -10, -10]} intensity={1} />
                <SceneEnvironment />

                <Suspense fallback={null}>
                    <DiamondModel />
                </Suspense>
            </Canvas>
        </div>
    );
}

