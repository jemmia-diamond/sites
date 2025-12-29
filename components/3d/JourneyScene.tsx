"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, PerspectiveCamera, Environment, Float, Stars, Sparkles, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// --- STAGE 1: CARBON / PRESSURE ---
function CarbonCloud({ scrollProgress }: { scrollProgress: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 50;

    // Random initial positions for rocks
    const [positions, rotations] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const r = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 10;
            p[i * 3 + 1] = (Math.random() - 0.5) * 10;
            p[i * 3 + 2] = (Math.random() - 0.5) * 5;

            r[i * 3] = Math.random() * Math.PI;
            r[i * 3 + 1] = Math.random() * Math.PI;
            r[i * 3 + 2] = Math.random() * Math.PI;
        }
        return [p, r];
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        // As scrollProgress goes from 0 to 0.3, compress particles to center
        // 0 -> Dispersed
        // 0.3 -> Compressed
        const t = Math.min(scrollProgress * 3.3, 1); // 0 to 1 over first 30%
        const compressFactor = 1 - t * 0.9; // 1 down to 0.1

        const tempObj = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            // Jitter/Heat effect
            const time = state.clock.elapsedTime;
            const heatJitter = Math.sin(time * 5 + i) * 0.05 * (1 - t); // Less jitter as it compresses

            tempObj.position.set(
                positions[i * 3] * compressFactor + heatJitter,
                positions[i * 3 + 1] * compressFactor + heatJitter,
                positions[i * 3 + 2] * compressFactor
            );

            // Rotation slows down as it compresses
            tempObj.rotation.set(
                rotations[i * 3] + time * (0.5 * compressFactor),
                rotations[i * 3 + 1] + time * (0.5 * compressFactor),
                rotations[i * 3 + 2]
            );

            const scale = 1 - t * 0.5; // Shrink slightly
            tempObj.scale.set(scale, scale, scale);

            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObj.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Hide after stage 1
        if (scrollProgress > 0.35) {
            meshRef.current.visible = false;
        } else {
            meshRef.current.visible = true;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#333" roughness={0.9} />
        </instancedMesh>
    );
}

// --- STAGE 2: LATTICE / FORMATION ---
function CrystalLattice({ scrollProgress }: { scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;

        // Visible from 0.25 to 0.6
        // Fade in: 0.25 -> 0.35
        // Stable: 0.35 -> 0.5
        // Fade out/Morph: 0.5 -> 0.6

        let opacity = 0;
        let scale = 0;

        if (scrollProgress > 0.25 && scrollProgress < 0.35) {
            // Fade In
            const t = (scrollProgress - 0.25) / 0.1;
            opacity = t;
            scale = t;
        } else if (scrollProgress >= 0.35 && scrollProgress < 0.5) {
            opacity = 1;
            scale = 1 + (scrollProgress - 0.35); // Grow slightly
        } else if (scrollProgress >= 0.5 && scrollProgress < 0.65) {
            // Fade Out
            const t = 1 - (scrollProgress - 0.5) / 0.15;
            opacity = t;
            scale = 1 + 0.15 + (1 - t); // Keep growing/morphing
        }

        groupRef.current.visible = scrollProgress > 0.25 && scrollProgress < 0.65;

        // Rotate
        groupRef.current.rotation.y += 0.005;
        groupRef.current.rotation.x += 0.002;

        // Update scales of children (simple way to hide/show)
        groupRef.current.scale.setScalar(scale);
    });

    // Create a simple cubic lattice
    const latticePoints = useMemo(() => {
        const points = [];
        const size = 2;
        const step = 1;
        for (let x = -size; x <= size; x += step) {
            for (let y = -size; y <= size; y += step) {
                for (let z = -size; z <= size; z += step) {
                    points.push([x, y, z]);
                }
            }
        }
        return points;
    }, []);

    return (
        <group ref={groupRef}>
            {latticePoints.map((pos, i) => (
                <mesh key={i} position={new THREE.Vector3(...pos)}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color="#b3e5fc" emissive="#4fc3f7" emissiveIntensity={0.5} roughness={0.1} />
                </mesh>
            ))}
            {/* Lines could be added here for bonds, but spheres imply atoms enough for this abstraction */}
        </group>
    );
}

// --- STAGE 3 & 4: DIAMOND / POLISH ---
function TheDiamond({ scrollProgress }: { scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        // Visible from 0.6 onwards
        // 0.6 -> 0.8: Rise and Form (Rough to Polish?)
        // 0.8 -> 1.0: Final spin and shine

        if (scrollProgress < 0.6) {
            groupRef.current.visible = false;
        } else {
            groupRef.current.visible = true;

            // Animation: Rise up
            // 0.6 is start. 0.8 is reaching center.
            let t = 0;
            if (scrollProgress < 0.8) {
                t = (scrollProgress - 0.6) / 0.2;
                // Move from y: -5 to y: 0
                groupRef.current.position.y = -5 + t * 5;
                // Rotate fast while rising
                groupRef.current.rotation.y = t * Math.PI * 4;
            } else {
                // Final stage
                groupRef.current.position.y = 0;
                // Slow rotation
                groupRef.current.rotation.y += 0.005;
                // Add gentle float
                groupRef.current.position.y = Math.sin(clock.elapsedTime) * 0.1;
            }
        }
    });

    const diamondConfig = {
        transmission: 1,
        thickness: 1.5,
        roughness: 0,
        ior: 2.4,
        chromaticAberration: 0.4, // "Fire" of the diamond
        anisotropy: 0.5,
        distortion: 0.2,
        distortionScale: 0.3,
        temporalDistortion: 0.1,
        clearcoat: 1,
        attenuationDistance: 0.5,
        attenuationColor: "#ffffff"
    };

    return (
        <group ref={groupRef}>
            {/* 1. The Pavilion (Bottom Cone) */}
            <mesh position={[0, -0.75, 0]}>
                <cylinderGeometry args={[1.5, 0, 1.5, 32]} />
                <MeshTransmissionMaterial {...diamondConfig} color="#ffffff" />
            </mesh>

            {/* 2. The Crown (Top truncated cone) */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[1.0, 1.5, 0.5, 32]} />
                <MeshTransmissionMaterial {...diamondConfig} color="#f0faff" />
            </mesh>
        </group>
    );
}


export function JourneyScene({ scrollProgress }: { scrollProgress: number }) {
    // Dynamic lighting based on progress
    // < 0.4: Magma colors (Red/Orange)
    // 0.4 - 0.7: Cooling (Blue/Purple)
    // > 0.7: Daylight (White)

    const lightColor = useMemo(() => {
        if (scrollProgress < 0.4) return "#ff3d00"; // Red/Orange
        if (scrollProgress < 0.7) return "#7c4dff"; // Purple/Cooling
        return "#ffffff"; // White
    }, [Math.floor(scrollProgress * 10)]); // Optimize updates

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />

            {/* Background Atmosphere */}
            <color attach="background" args={[scrollProgress < 0.5 ? "#1a0500" : "#000000"]} />
            {scrollProgress < 0.5 && <fog attach="fog" args={["#1a0500", 5, 20]} />}

            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color={lightColor} />
            <pointLight position={[-10, -5, 5]} intensity={0.5} color="blue" />

            <Environment preset={scrollProgress < 0.5 ? "sunset" : "studio"} />

            <group>
                <CarbonCloud scrollProgress={scrollProgress} />
                <CrystalLattice scrollProgress={scrollProgress} />
                <TheDiamond scrollProgress={scrollProgress} />
            </group>

            {scrollProgress > 0.5 && <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} color="#fff" />}
        </>
    );
}
