"use client";

import { useEnvironment } from '@react-three/drei';
import * as THREE from 'three';

export const useMetalTexture = () => {
    const metalTexture = useEnvironment({ files: "/env_metal_001.hdr" });
    metalTexture.mapping = THREE.EquirectangularReflectionMapping;
    metalTexture.colorSpace = THREE.SRGBColorSpace;
    metalTexture.channel = 0;
    metalTexture.repeat = new THREE.Vector2(1, 1);
    metalTexture.offset = new THREE.Vector2(0, 0);
    metalTexture.center = new THREE.Vector2(0, 0);
    metalTexture.rotation = 0;
    metalTexture.wrapS = THREE.RepeatWrapping;
    metalTexture.wrapT = THREE.RepeatWrapping;
    metalTexture.format = THREE.RGBAFormat;
    metalTexture.internalFormat = null;
    metalTexture.type = THREE.HalfFloatType;
    metalTexture.minFilter = THREE.LinearFilter;
    metalTexture.magFilter = THREE.LinearFilter;
    metalTexture.anisotropy = 16;
    metalTexture.flipY = true;
    metalTexture.generateMipmaps = true;
    metalTexture.premultiplyAlpha = false;
    metalTexture.unpackAlignment = 1;
    // useEnvironment automatically handles mapping and configures it as an environment map.
    // We can return it directly.
    return metalTexture;
};