"use client";

import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

// --- CUSTOM SHADER MATERIAL FOR LUXURY PARTICLES ---
const ShardMaterial = shaderMaterial(
    {
        uTime: 0,
        uMouse: new THREE.Vector3(0, 0, 0),
        uColor: new THREE.Color("#F8F0E3"), // Champagne / Diamond White
        uGold: new THREE.Color("#D4AF37"), // Gold
        uPixelRatio: 1,
    },
    // Vertex Shader: Gentle Flow & Sparkle Preparation
    `
    uniform float uTime;
    uniform vec3 uMouse;
    
    attribute vec3 aRandom; // [speed, scale, offset]
    
    varying float vAlpha;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying float vSparkleOffset;
    varying float vScale;

    // --- SIMPLEX NOISE FUNCTION ---
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy; 
      vec3 x3 = x0 - D.yyy;      
      i = mod289(i);
      vec4 p = permute( permute( permute( 
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857; 
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );   
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      // 1. Initial Position
      vec3 startPos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      
      // 2. Animate Position (Gentle Flow)
      // Slower speed for elegance
      float speed = aRandom.x * 0.2 + 0.05; 
      float time = uTime * speed;
      
      vec3 pos = startPos;
      // Drift upwards slowly
      pos.y += time * 1.5; 
      // Gentle sine wave sway
      pos.x += sin(time * 0.3 + aRandom.z * 10.0) * 1.0;
      pos.z += cos(time * 0.2 + aRandom.y * 10.0) * 0.5;
      
      // Wrap around logic (Infinite field)
      float boxH = 40.0;
      pos.y = mod(pos.y + 20.0, boxH) - 20.0;
      
      // Add subtle noise turbulence
      float noiseVal = snoise(pos * 0.1 + uTime * 0.05);
      pos += noiseVal * 0.8;

      // 3. Mouse Interaction (Gentle Repulsion/Attraction)
      // Subtle interaction, not aggressive
      float dist = distance(pos.xy, uMouse.xy);
      float radius = 6.0;
      if (dist < radius) {
        float force = (radius - dist) / radius;
        // Move away slightly
        vec3 dir = normalize(pos - uMouse);
        pos += dir * force * 1.5; 
      }

      // 4. Rotation (Sparkle Tumble)
      float rotAngle = uTime * (aRandom.x * 0.5 + 0.1) + aRandom.z * 6.28;
      // Rotate around Y and Z slightly
      float c = cos(rotAngle);
      float s = sin(rotAngle);
      mat3 rotMatY = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
      mat3 rotMatZ = mat3( c, -s, 0, s, c, 0, 0, 0, 1 );
      
      vScale = 0.1 + aRandom.y * 0.3; // vary scale
      vec3 localPos = position * vScale;
      localPos = rotMatY * rotMatZ * localPos;
      
      vec3 finalPos = pos + localPos;
      vec4 mvPosition = viewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      vNormal = normalize(normalMatrix * (rotMatY * rotMatZ * normal));
      vPos = finalPos;
      vSparkleOffset = aRandom.z; // Used in frag for unique twinkle
      
      // Distance fade
      float depth = -mvPosition.z;
      // float fade = smoothstep(30.0, 10.0, depth); // Fade far objects?
      vAlpha = 1.0; 
    }
  `,
    // Fragment Shader: Diamond/Gold Sparkle
    `
    uniform vec3 uColor;
    uniform vec3 uGold;
    uniform float uTime;
    
    varying float vAlpha;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying float vSparkleOffset;
    varying float vScale;

    void main() {
      // Lighting
      // A few virtual lights to create "facets"
      vec3 light1 = normalize(vec3(1.0, 1.0, 1.0));
      vec3 light2 = normalize(vec3(-1.0, 0.5, 0.5));
      
      float diff1 = max(dot(vNormal, light1), 0.0);
      float diff2 = max(dot(vNormal, light2), 0.0);
      
      // Sparkle/Glint Logic
      // High specular sharpness
      float specular = pow(diff1, 8.0) + pow(diff2, 8.0);
      
      // Twinkle based on time and view direction (simulating facets reflecting light)
      // Rapid fluctuation
      float twinkle = sin(uTime * 3.0 + vSparkleOffset * 20.0) * 0.5 + 0.5;
      specular *= (0.5 + 0.5 * twinkle);
      
      // Color mixing: Mostly Diamond White/Off-white, occasionally Gold
      // Use noise or random attribute to mix. Let's use vSparkleOffset.
      vec3 baseColor = mix(uColor, uGold, step(0.7, vSparkleOffset)); // 30% Gold, 70% White
      
      // Dispersion (Fake rainbow hints in bright spots)
      vec3 dispersion = vec3(0.0);
      if (specular > 0.8) {
          dispersion = vec3(
            sin(vSparkleOffset * 10.0),
            sin(vSparkleOffset * 10.0 + 2.0),
            sin(vSparkleOffset * 10.0 + 4.0)
          ) * 0.5;
      }

      vec3 finalColor = baseColor * (0.2 + diff1 * 0.4) + (specular * 2.0) + dispersion;
      
      // Soft glow
      // finalColor += baseColor * 0.1;

      // Distance fog/Alpha fade (optional)
      
      gl_FragColor = vec4(finalColor, vAlpha * (0.3 + 0.7 * specular)); // Transparency tied to brightness for "glint" look
    }
  `
);

extend({ ShardMaterial });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            shardMaterial: any;
        }
    }
}

function CrystalField({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const count = 2000; // High count for "dust" effect

    const dummy = new THREE.Object3D();

    const [randomAttrs] = useMemo(() => {
        const randoms = new Float32Array(count * 3);
        const matrixArray = [];

        for (let i = 0; i < count; i++) {
            // Random Pos
            dummy.position.set(
                (Math.random() - 0.5) * 50, // Wider separation
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30 // Depther field
            );
            dummy.updateMatrix();
            matrixArray.push(dummy.matrix.clone());

            // Randoms: [Speed, Scale, Offset/Type]
            randoms[i * 3] = Math.random();
            randoms[i * 3 + 1] = Math.random();
            randoms[i * 3 + 2] = Math.random();
        }
        return [randoms, matrixArray];
    }, [count]);

    useEffect(() => {
        if (!meshRef.current) return;
        const tempObj = new THREE.Object3D();
        // Just initialize matrices, actual movement is shader-based
        for (let i = 0; i < count; i++) {
            // Use the same initial positions from useMemo logic to match if needed,
            // but since we only need *some* position to start with...
            // (We actually need to match the attribute creation logic or just loop again)
            // Re-creating the initial spread logic here for the instancedMesh matrix
            tempObj.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30
            );
            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObj.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [count]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            const { width, height } = state.viewport;
            const x = (mouse.current[0] * width) / 2;
            const y = (mouse.current[1] * height) / 2;
            materialRef.current.uniforms.uMouse.value.lerp(new THREE.Vector3(x, y, 0), 0.1);
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            {/* Octahedron is perfect for "Diamond" shapes */}
            <octahedronGeometry args={[0.2, 0]}>
                <instancedBufferAttribute
                    attach="attributes-aRandom"
                    args={[randomAttrs, 3]}
                />
            </octahedronGeometry>
            {/* @ts-ignore */}
            <shardMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}

export function WebGLBackground() {
    const mouse = useRef<[number, number]>([0, 0]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            mouse.current = [x, y];
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(circle_at_center,#004d49_0%,#002422_100%)]">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 45 }} // Narrower FOV for more cinematic depth
                gl={{ alpha: true, antialias: true }}
                dpr={[1, 2]}
            >
                <CrystalField mouse={mouse} />
            </Canvas>
        </div>
    );
}
