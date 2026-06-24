import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CheveresModelProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}



const CheveresModel: React.FC<CheveresModelProps> = ({ scrollFraction, mouse }) => {
    const groupRef = useRef<THREE.Group>(null);
    const upperBreadRef = useRef<THREE.Group>(null);
    const lowerBreadRef = useRef<THREE.Group>(null);
    const lettuceRef = useRef<THREE.Group>(null);
    const cheeseRef = useRef<THREE.Group>(null);
    const hamRef = useRef<THREE.Group>(null);
    const tomatoRef = useRef<THREE.Group>(null);

    // Create tomato texture once
    const tomatoTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        // Tomato red base
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.fill();

        // Inside pulp pockets
        ctx.fillStyle = '#B71C1C';
        const pockets = 3;
        for (let i = 0; i < pockets; i++) {
            const startAngle = (i / pockets) * Math.PI * 2 + 0.25;
            const endAngle = ((i + 1) / pockets) * Math.PI * 2 - 0.25;
            ctx.beginPath();
            ctx.moveTo(64, 64);
            ctx.arc(64, 64, 50, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Seeds (Gold dots)
            ctx.fillStyle = '#FFD700';
            const midAngle = startAngle + (endAngle - startAngle) / 2;
            const seedX = 64 + Math.cos(midAngle) * 34;
            const seedY = 64 + Math.sin(midAngle) * 34;
            ctx.beginPath();
            ctx.arc(seedX, seedY, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Inner core
        ctx.fillStyle = '#E57373';
        ctx.beginPath();
        ctx.arc(64, 64, 16, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, []);

    // Materials Configuration
    const breadMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xB57C3E, // toasted golden-brown
        roughness: 0.65,
        metalness: 0.05,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3
    }), []);

    const crumbMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0xFDF5E6, // cream slash interior
        roughness: 0.9,
        metalness: 0.0
    }), []);

    const lettuceMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0x2A5D3F, // organic forest green
        roughness: 0.85,
        metalness: 0.0,
        clearcoat: 0.4
    }), []);

    const cheeseMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xFFC72C, // Cheddar yellow
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        metalness: 0.02
    }), []);

    const hamMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xE89898, // pink ham
        roughness: 0.45,
        clearcoat: 0.25,
        metalness: 0.01
    }), []);

    const tomatoMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xCD5C5C,
        map: tomatoTexture,
        roughness: 0.18,
        clearcoat: 0.95,
        clearcoatRoughness: 0.08,
        metalness: 0.05
    }), [tomatoTexture]);

    // Animate rotations and separation based on scroll and mouse
    useFrame((state) => {
        if (!groupRef.current) return;

        // Hover tilt and smooth base rotation
        const baseTiltX = 0.6;
        const baseTiltZ = -0.4;

        const targetRotX = baseTiltX + mouse.y * 0.4;
        const targetRotY = state.clock.getElapsedTime() * 0.12 + mouse.x * 0.4;
        const targetRotZ = baseTiltZ - scrollFraction * 0.6 + mouse.x * 0.2;

        groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
        groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * 0.05;

        // Interactive despiece: separation of bread and ingredients
        const sep = 0.45 + scrollFraction * 0.95;

        if (upperBreadRef.current) upperBreadRef.current.position.z = sep;
        if (lowerBreadRef.current) lowerBreadRef.current.position.z = -sep;

        // Distribute ingredients inside the gap dynamically based on scrollFraction
        if (lettuceRef.current) lettuceRef.current.position.z = 0;
        if (cheeseRef.current) cheeseRef.current.position.z = sep * (0.22 + scrollFraction * 0.25);
        if (hamRef.current) hamRef.current.position.z = -sep * (0.22 + scrollFraction * 0.25);
        if (tomatoRef.current) tomatoRef.current.position.z = sep * (0.45 + scrollFraction * 0.25);

        // Scroll vertical parallax offset
        groupRef.current.position.y = -scrollFraction * 1.5;
    });

    return (
        <group ref={groupRef} rotation={[0.6, 0.5, -0.4]} scale={[1.2, 1.2, 1.2]}>
            {/* UPPER BREAD (Top Baguette) */}
            <group ref={upperBreadRef} position={[0, 0, 0.45]} scale={[1.4, 1.0, 0.7]}>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.52, 0.52, 2.5, 32]} />
                    <primitive object={breadMat} attach="material" />
                </mesh>
                {/* Rounded Tips */}
                <mesh position={[0, 1.25, 0]} castShadow>
                    <sphereGeometry args={[0.52, 32, 16]} />
                    <primitive object={breadMat} attach="material" />
                </mesh>
                <mesh position={[0, -1.25, 0]} castShadow>
                    <sphereGeometry args={[0.52, 32, 16]} />
                    <primitive object={breadMat} attach="material" />
                </mesh>
                {/* Crust Slashes (Grignes) */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <mesh key={i} position={[0.15, -0.75 + i * 0.5, 0.49]} rotation={[0.2, 0, 0.65]}>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <primitive object={crumbMat} attach="material" />
                    </mesh>
                ))}
            </group>

            {/* LOWER BREAD (Bottom Baguette) */}
            <group ref={lowerBreadRef} position={[0, 0, -0.45]} scale={[1.4, 1.0, 0.7]}>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.52, 0.52, 2.5, 32]} />
                    <primitive object={breadMat} attach="material" />
                </mesh>
                <mesh position={[0, 1.25, 0]} castShadow>
                    <sphereGeometry args={[0.52, 32, 16]} />
                    <primitive object={breadMat} attach="material" />
                </mesh>
                <mesh position={[0, -1.25, 0]} castShadow>
                    <sphereGeometry args={[0.52, 32, 16]} />
                    <primitive object={breadMat} attach="material" />
                </mesh>
            </group>

            {/* LETTUCE (Green wavy layers in XY plane) */}
            <group ref={lettuceRef} position={[0, 0, 0]}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <mesh key={i} position={[0.18 * (i % 2 === 0 ? 1 : -1), -0.8 + i * 0.55, 0]} rotation={[0, 0, 0.25 * (i % 2 === 0 ? 1 : -1)]}>
                        <boxGeometry args={[1.45, 0.55, 0.03]} />
                        <primitive object={lettuceMat} attach="material" />
                    </mesh>
                ))}
            </group>

            {/* CHEESE (Yellow squares flat in XY plane) */}
            <group ref={cheeseRef} position={[0, 0, 0.15]}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <mesh key={i} position={[0.15 * (i % 2 === 0 ? -1 : 1), -0.7 + i * 0.7, 0]} rotation={[Math.PI / 2, 0, 0.25 * (i - 1)]}>
                        <boxGeometry args={[1.40, 0.02, 1.40]} />
                        <primitive object={cheeseMat} attach="material" />
                    </mesh>
                ))}
            </group>

            {/* HAM (Pink sheets flat in XY plane) */}
            <group ref={hamRef} position={[0, 0, -0.15]}>
                {Array.from({ length: 2 }).map((_, i) => (
                    <mesh key={i} position={[0.12 * (i % 2 === 0 ? 1 : -1), -0.5 + i * 1.0, 0]} rotation={[Math.PI / 2, 0, -0.15 + i * 0.3]}>
                        <boxGeometry args={[1.35, 0.03, 1.35]} />
                        <primitive object={hamMat} attach="material" />
                    </mesh>
                ))}
            </group>

            {/* TOMATOES (Red circular discs flat in XY plane) */}
            <group ref={tomatoRef} position={[0, 0, 0.3]}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <mesh key={i} position={[0.32 * (i % 2 === 0 ? 1 : -1), -0.75 + i * 0.75, 0]} rotation={[Math.PI / 2, 0, 0.2 * i]} castShadow>
                        <cylinderGeometry args={[0.48, 0.48, 0.12, 24]} />
                        <primitive object={tomatoMat} attach="material" />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

const DriftingParticles: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 35;
    const positions = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 8; // X
            positions[i + 1] = (Math.random() - 0.5) * 8; // Y
            positions[i + 2] = (Math.random() - 0.5) * 8; // Z
        }
        return positions;
    }, []);

    useFrame(() => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
            pointsRef.current.rotation.x += 0.0005;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color={0xffaa00} // Orange gold particles
                size={0.12}
                transparent
                opacity={0.6}
            />
        </points>
    );
};

interface CheveresSceneProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}

const CheveresScene: React.FC<CheveresSceneProps> = ({ scrollFraction, mouse }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        // Measure initially
        updateSize();

        // Listen for layout changes (which are transform-independent)
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            const observer = new ResizeObserver(() => {
                updateSize();
            });
            observer.observe(containerRef.current);
            return () => observer.disconnect();
        } else {
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }
    }, []);

    const canvasProps = {
        shadows: true,
        camera: { position: [0, 0.1, 5.5], fov: 45 },
        gl: { antialias: true, alpha: true },
        size: size
    } as any;

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', outline: 'none', position: 'relative' }}>
            {size.width > 0 && size.height > 0 && (
                <Canvas {...canvasProps}>
                    <ambientLight intensity={0.7} />
                    <directionalLight 
                        position={[5, 8, 4]} 
                        intensity={1.4} 
                        castShadow 
                        shadow-mapSize-width={1024} 
                        shadow-mapSize-height={1024} 
                    />
                    <directionalLight position={[-5, -4, 2]} intensity={0.9} color="#ff5500" />
                    
                    <CheveresModel scrollFraction={scrollFraction} mouse={mouse} />
                    <DriftingParticles />
                </Canvas>
            )}
        </div>
    );
};

export default CheveresScene;
