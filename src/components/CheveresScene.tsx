import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CheveresModelProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}

const CheveresModel: React.FC<CheveresModelProps> = ({ scrollFraction, mouse }) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftHalfRef = useRef<THREE.Group>(null);
    const rightHalfRef = useRef<THREE.Group>(null);

    // Shapes for Left and Right halves of the semi-circular empanada
    const leftEmpanadaShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-1.3, 0);
        shape.lineTo(0, 0);
        shape.lineTo(0, 1.3);
        shape.absarc(0, 0, 1.3, Math.PI / 2, Math.PI, false);
        return shape;
    }, []);

    const rightEmpanadaShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(1.3, 0);
        shape.absarc(0, 0, 1.3, 0, Math.PI / 2, false);
        shape.lineTo(0, 0);
        return shape;
    }, []);

    const extrudeSettings = useMemo(() => ({
        depth: 0.08,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 1,
        bevelSize: 0.12,
        bevelThickness: 0.18,
    }), []);

    // Pastel/Golden empanada crust material
    const empanadaMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xDF9C38, // Golden-yellow empanada crust
        roughness: 0.65,
        metalness: 0.02,
        clearcoat: 0.15,
        clearcoatRoughness: 0.4
    }), []);

    // Crimp angles for Left and Right rims
    const leftCrimpAngles = useMemo(() => {
        const crimps = [];
        const count = 8;
        for (let i = 0; i <= count; i++) {
            // angle from Math.PI / 2 to Math.PI
            crimps.push(Math.PI / 2 + (i / count) * (Math.PI / 2));
        }
        return crimps;
    }, []);

    const rightCrimpAngles = useMemo(() => {
        const crimps = [];
        const count = 8;
        for (let i = 0; i <= count; i++) {
            // angle from 0 to Math.PI / 2
            crimps.push((i / count) * (Math.PI / 2));
        }
        return crimps;
    }, []);

    // Exploding internal ingredients (meat, peas, potatoes, carrots)
    const fillingItems = useMemo(() => {
        const items = [];
        const colors = [0x5c321a, 0x4CAF50, 0xECA82C, 0xE65F2B]; // Meat (brown), Pea (green), Potato (yellow), Carrot (orange)
        for (let i = 0; i < 15; i++) {
            const type = i % 4;
            const color = colors[type];
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.15 + Math.random() * 0.5;
            const targetX = Math.cos(angle) * radius;
            const targetY = Math.sin(angle) * radius;
            const targetZ = (Math.random() - 0.5) * 0.25;
            items.push({
                color,
                type,
                targetX,
                targetY,
                targetZ,
                scale: 0.05 + Math.random() * 0.06
            });
        }
        return items;
    }, []);

    // Animate rotation and explosion based on scroll and mouse coordinates
    useFrame((state) => {
        if (!groupRef.current) return;

        // Diagonal hover tilt and slow automatic rotation
        const baseTiltX = 0.5;
        const baseTiltZ = -0.3;

        const targetRotX = baseTiltX + mouse.y * 0.35;
        const targetRotY = state.clock.getElapsedTime() * 0.12 + mouse.x * 0.35;
        const targetRotZ = baseTiltZ - scrollFraction * 0.5 + mouse.x * 0.15;

        groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
        groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * 0.05;

        // Separate the two halves along X-axis
        const separation = scrollFraction * 0.8;

        if (leftHalfRef.current) leftHalfRef.current.position.x = -separation;
        if (rightHalfRef.current) rightHalfRef.current.position.x = separation;

        // Scroll vertical parallax offset
        groupRef.current.position.y = -scrollFraction * 1.5;
    });

    return (
        <group ref={groupRef} rotation={[0.5, 0.4, -0.3]} scale={[1.3, 1.3, 1.3]}>
            {/* LEFT HALF OF EMPANADA */}
            <group ref={leftHalfRef}>
                <mesh castShadow receiveShadow>
                    <extrudeGeometry args={[leftEmpanadaShape, extrudeSettings]} />
                    <primitive object={empanadaMat} attach="material" />
                </mesh>
                {/* Left Rim Crimps (Pleats) */}
                {leftCrimpAngles.map((theta, i) => (
                    <mesh 
                        key={i} 
                        position={[Math.cos(theta) * 1.36, Math.sin(theta) * 1.36, 0.04]} 
                        rotation={[0.35, 0.2, theta + Math.PI / 4]}
                        castShadow
                    >
                        <sphereGeometry args={[0.13, 16, 12]} />
                        <primitive object={empanadaMat} attach="material" />
                    </mesh>
                ))}
            </group>

            {/* RIGHT HALF OF EMPANADA */}
            <group ref={rightHalfRef}>
                <mesh castShadow receiveShadow>
                    <extrudeGeometry args={[rightEmpanadaShape, extrudeSettings]} />
                    <primitive object={empanadaMat} attach="material" />
                </mesh>
                {/* Right Rim Crimps (Pleats) */}
                {rightCrimpAngles.map((theta, i) => (
                    <mesh 
                        key={i} 
                        position={[Math.cos(theta) * 1.36, Math.sin(theta) * 1.36, 0.04]} 
                        rotation={[0.35, 0.2, theta + Math.PI / 4]}
                        castShadow
                    >
                        <sphereGeometry args={[0.13, 16, 12]} />
                        <primitive object={empanadaMat} attach="material" />
                    </mesh>
                ))}
            </group>

            {/* FLOATING/EXPLODING FILLING IN THE GAP */}
            {fillingItems.map((item, i) => {
                // Scale up as empanada separates
                const scale = item.scale * Math.min(scrollFraction * 2.5, 1);
                // Disperse outwards
                const x = item.targetX * scrollFraction * 1.4;
                const y = item.targetY * scrollFraction * 1.4;
                const z = item.targetZ * scrollFraction * 1.4;

                return (
                    <mesh 
                        key={i} 
                        position={[x, y, z]} 
                        scale={[scale, scale, scale]}
                        castShadow
                    >
                        {item.type === 1 ? (
                            <sphereGeometry args={[1, 10, 10]} />
                        ) : (
                            <boxGeometry args={[1.2, 1.2, 1.2]} />
                        )}
                        <meshStandardMaterial 
                            color={item.color} 
                            roughness={0.7} 
                            metalness={0.1} 
                        />
                    </mesh>
                );
            })}
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
    return (
        <div style={{ width: '100%', height: '100%', outline: 'none', position: 'relative' }}>
            <Canvas
                shadows
                camera={{ position: [0, 0.1, 5.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
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
        </div>
    );
};

export default CheveresScene;
