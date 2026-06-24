import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CheveresModelProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}

const CheveresModel: React.FC<CheveresModelProps> = ({ scrollFraction, mouse }) => {
    const groupRef = useRef<THREE.Group>(null);
    const upperGroupRef = useRef<THREE.Group>(null);
    const lowerGroupRef = useRef<THREE.Group>(null);
    const cheesePullRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);

    // 1. Materials Configuration
    const doughMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xdf9a44,     // Warm golden fried dough
        roughness: 0.45,
        metalness: 0.02,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2
    }), []);

    const cheeseMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xfff6cf,     // Mozzarella cheese color
        roughness: 0.35,
        metalness: 0.02,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15
    }), []);

    // 2. Cheese cubes particles
    const cubeCount = 12;
    const cubeData = useMemo(() => {
        const list = [];
        for (let i = 0; i < cubeCount; i++) {
            list.push({
                pos: [
                    (Math.random() - 0.5) * 5.5,
                    (Math.random() - 0.5) * 5.5,
                    (Math.random() - 0.5) * 3.5
                ] as [number, number, number],
                rotSpeed: [
                    (Math.random() - 0.5) * 0.03,
                    (Math.random() - 0.5) * 0.03
                ] as [number, number],
                driftSpeed: 0.15 + Math.random() * 0.35,
            });
        }
        return list;
    }, []);

    const cubesRef = useRef<Array<THREE.Mesh | null>>([]);

    // 3. Sparkles particles setup (clean glowing white/yellow magic dots instead of fire embers)
    const particleCount = 45;
    const [particlePositions, particleVelocities] = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            positions[idx] = (Math.random() - 0.5) * 6; // X
            positions[idx + 1] = (Math.random() - 0.5) * 6; // Y
            positions[idx + 2] = (Math.random() - 0.5) * 4; // Z
            velocities[idx + 1] = 0.006 + Math.random() * 0.015; // rise speed
        }
        return [positions, velocities];
    }, []);

    // 4. Crimp teeth calculations for round pastelito
    const crimpCount = 36;
    const crimps = useMemo(() => {
        const list = [];
        for (let i = 0; i < crimpCount; i++) {
            const angle = (i / crimpCount) * Math.PI * 2;
            const r = 0.95;
            list.push({
                x: Math.cos(angle) * r,
                z: Math.sin(angle) * r,
                rotationY: -angle
            });
        }
        return list;
    }, []);

    // 5. Animation loop Hook
    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // 1. Mouse cursor hover tilt & base rotation
        if (groupRef.current) {
            const targetRotY = t * 0.15 + mouse.x * 0.45;
            const targetRotX = 0.2 + mouse.y * 0.35;
            
            groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
            groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
        }

        // 2. Separation logic on scroll
        const targetSeparation = Math.max(0.0, 1.0 - scrollFraction * 2.8);

        // Animate upper group (top shell of pastelito)
        if (upperGroupRef.current) {
            upperGroupRef.current.position.y = 0.08 + targetSeparation * 1.35;
            // Slight tilt as it separates
            upperGroupRef.current.rotation.z = targetSeparation * 0.15;
            upperGroupRef.current.rotation.x = targetSeparation * 0.08;
        }

        // Animate lower group (bottom shell of pastelito)
        if (lowerGroupRef.current) {
            lowerGroupRef.current.position.y = -0.08 - targetSeparation * 1.35;
            lowerGroupRef.current.rotation.z = -targetSeparation * 0.15;
            lowerGroupRef.current.rotation.x = -targetSeparation * 0.08;
        }

        // Animate cheese pull connecting the two halves
        if (cheesePullRef.current) {
            const currentSep = targetSeparation * 1.35;
            if (currentSep > 0.05) {
                cheesePullRef.current.visible = true;
                
                // Scale Y to match length between ends
                const yLength = 0.16 + currentSep * 2.7;
                cheesePullRef.current.scale.y = yLength;
                
                // Thin out X & Z based on stretch distance
                const thinness = 1.0 / (1.0 + currentSep * 3.5);
                cheesePullRef.current.scale.x = thinness * 0.85;
                cheesePullRef.current.scale.z = thinness * 0.85;
            } else {
                cheesePullRef.current.visible = false;
            }
        }

        // 3. Animate drifting cheese cubes
        cubesRef.current.forEach((cube, i) => {
            if (!cube) return;
            const data = cubeData[i];
            cube.position.y += data.driftSpeed * 0.008;
            cube.position.x = data.pos[0] + Math.sin(t * data.driftSpeed) * 0.15;
            cube.rotation.x += data.rotSpeed[0];
            cube.rotation.y += data.rotSpeed[1];
            
            // Recycle
            if (cube.position.y > 3) {
                cube.position.y = -3;
                cube.position.x = (Math.random() - 0.5) * 5.5;
                data.pos[0] = cube.position.x;
            }
        });

        // 4. Animate floating clean sparkles
        if (particlesRef.current) {
            const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
            const positions = posAttr.array as Float32Array;
            for (let i = 0; i < particleCount; i++) {
                const idx = i * 3 + 1; // Y coordinate
                positions[idx] += particleVelocities[idx];
                if (positions[idx] > 3) {
                    positions[idx] = -3; // Loop back
                }
            }
            posAttr.needsUpdate = true;
            particlesRef.current.rotation.y += 0.0008;
        }

        // Parallax height shift
        if (groupRef.current) {
            groupRef.current.position.y = 0.2 - scrollFraction * 1.2;
        }
    });

    return (
        <group ref={groupRef} scale={[1.4, 1.4, 1.4]} rotation={[0.15, 0.4, -0.1]}>
            {/* STRETCHY CHEESE PULL IN CENTER */}
            <mesh ref={cheesePullRef} position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.42, 0.42, 1.0, 32]} />
                <primitive object={cheeseMat} attach="material" />
            </mesh>

            {/* UPPER PASTELITO HALF */}
            <group ref={upperGroupRef}>
                {/* Upper Puffed Dough Dome */}
                <mesh position={[0, 0.04, 0]} scale={[1, 0.35, 1]} castShadow receiveShadow>
                    <sphereGeometry args={[0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <primitive object={doughMat} attach="material" />
                </mesh>
                
                {/* Upper Rim Plate (Flat seal border) */}
                <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[1.0, 1.0, 0.04, 32]} />
                    <primitive object={doughMat} attach="material" />
                </mesh>

                {/* Upper Crimp teeth around border */}
                {crimps.map((crimp, idx) => (
                    <mesh 
                        key={idx} 
                        position={[crimp.x, 0.03, crimp.z]} 
                        rotation={[0, crimp.rotationY, 0]}
                        castShadow
                    >
                        <boxGeometry args={[0.05, 0.02, 0.08]} />
                        <primitive object={doughMat} attach="material" />
                    </mesh>
                ))}

                {/* Inner cheese showing at separation point */}
                <mesh position={[0, -0.01, 0]} castShadow>
                    <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
                    <primitive object={cheeseMat} attach="material" />
                </mesh>
            </group>

            {/* LOWER PASTELITO HALF */}
            <group ref={lowerGroupRef}>
                {/* Lower Puffed Dough Dome */}
                <mesh position={[0, -0.04, 0]} scale={[1, 0.35, 1]} castShadow receiveShadow>
                    <sphereGeometry args={[0.9, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                    <primitive object={doughMat} attach="material" />
                </mesh>

                {/* Lower Rim Plate (Flat seal border) */}
                <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[1.0, 1.0, 0.04, 32]} />
                    <primitive object={doughMat} attach="material" />
                </mesh>

                {/* Lower Crimp teeth around border */}
                {crimps.map((crimp, idx) => (
                    <mesh 
                        key={idx} 
                        position={[crimp.x, -0.03, crimp.z]} 
                        rotation={[0, crimp.rotationY, 0]}
                        castShadow
                    >
                        <boxGeometry args={[0.05, 0.02, 0.08]} />
                        <primitive object={doughMat} attach="material" />
                    </mesh>
                ))}

                {/* Inner cheese showing at separation point */}
                <mesh position={[0, 0.01, 0]} castShadow>
                    <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
                    <primitive object={cheeseMat} attach="material" />
                </mesh>
            </group>

            {/* DRIFTING CHEESE CUBES */}
            {cubeData.map((cube, idx) => (
                <mesh
                    key={idx}
                    ref={(el) => { cubesRef.current[idx] = el; }}
                    position={cube.pos}
                    castShadow
                >
                    <boxGeometry args={[0.13, 0.13, 0.13]} />
                    <meshPhysicalMaterial
                        color={0xffbe00} // Cheese yellow
                        roughness={0.4}
                        metalness={0.05}
                        clearcoat={0.7}
                    />
                </mesh>
            ))}

            {/* FLOATING MAGIC SPARKS (Yellow-White glow points instead of fire embers) */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particlePositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color={0xfff2b2} // Light cheese yellow glow
                    size={0.06}
                    transparent
                    opacity={0.7}
                />
            </points>
        </group>
    );
};

interface CheveresSceneProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}

const CheveresScene: React.FC<CheveresSceneProps> = ({ scrollFraction, mouse }) => {
    return (
        <div style={{ width: '100%', height: '100%', outline: 'none' }}>
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
                <directionalLight position={[-5, -4, 2]} intensity={0.9} color="#ffffff" />
                
                <CheveresModel scrollFraction={scrollFraction} mouse={mouse} />
            </Canvas>
        </div>
    );
};

export default CheveresScene;
