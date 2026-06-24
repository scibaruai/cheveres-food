import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CheveresModelProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}

const CheveresModel: React.FC<CheveresModelProps> = ({ scrollFraction, mouse }) => {
    const groupRef = useRef<THREE.Group>(null);
    const upperCheeseRef = useRef<THREE.Mesh>(null);
    const lowerCheeseRef = useRef<THREE.Mesh>(null);
    const cheesePullRef = useRef<THREE.Mesh>(null);
    const doughGroupRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);

    // 1. Materials Configuration
    const doughStripeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xdf9a44,     // Warm golden-brown
        roughness: 0.55,
        metalness: 0.05,
        clearcoat: 0.4,
        clearcoatRoughness: 0.25
    }), []);

    const cheeseMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xfff6cf,     // Mozzarella cheese color
        roughness: 0.35,
        metalness: 0.02,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15
    }), []);

    // 2. Torus wraps data (helical representation)
    const torusCount = 7;
    const torusPositions = useMemo(() => {
        const list = [];
        for (let i = 0; i < torusCount; i++) {
            list.push({
                yInit: -0.65 + i * 0.22,
                rotX: Math.PI / 2 + 0.22, // Slanted wrap
                rotY: 0.15 + i * 0.1,
                rotZ: (i % 2 === 0 ? 0.1 : -0.1)
            });
        }
        return list;
    }, []);

    // Torus meshes refs
    const torusesRef = useRef<Array<THREE.Mesh | null>>([]);

    // 3. Cheese cubes particles
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
                initialX: 0
            });
        }
        return list;
    }, []);

    const cubesRef = useRef<Array<THREE.Mesh | null>>([]);

    // 4. Sparkles particles setup
    const particleCount = 35;
    const [particlePositions, particleVelocities] = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            positions[idx] = (Math.random() - 0.5) * 6; // X
            positions[idx + 1] = (Math.random() - 0.5) * 6; // Y
            positions[idx + 2] = (Math.random() - 0.5) * 4; // Z
            velocities[idx + 1] = 0.008 + Math.random() * 0.02; // rise speed
        }
        return [positions, velocities];
    }, []);

    // 5. Animation loop Hook
    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // 1. Mouse cursor hover tilt & base rotation
        if (groupRef.current) {
            const targetRotY = t * 0.12 + mouse.x * 0.45;
            const targetRotX = 0.2 + mouse.y * 0.35;
            
            groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
            groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
        }

        // 2. Separation logic on scroll (packed at bottom, exploded at top/initial)
        // At scrollFraction = 0 (top of page), separation is 1.0 (fully exploded)
        // At scrollFraction = 1.0, it collapses together completely (separation = 0.0)
        const targetSeparation = Math.max(0.0, 1.0 - scrollFraction * 3.0);

        // Animate cheese split
        // Upper cheese cylinder moves up
        if (upperCheeseRef.current) {
            upperCheeseRef.current.position.y = 0.35 + targetSeparation * 1.1;
        }
        // Lower cheese cylinder moves down
        if (lowerCheeseRef.current) {
            lowerCheeseRef.current.position.y = -0.35 - targetSeparation * 1.1;
        }

        // Animate cheese pull connecting the two halves
        if (cheesePullRef.current) {
            const currentSep = targetSeparation * 1.1;
            if (currentSep > 0.05) {
                cheesePullRef.current.visible = true;
                
                // Scale Y to match length between ends
                const yLength = 0.7 + currentSep * 2.2;
                cheesePullRef.current.scale.y = yLength;
                
                // Thin out X & Z based on stretch distance
                const thinness = 1.0 / (1.0 + currentSep * 2.6);
                cheesePullRef.current.scale.x = thinness;
                cheesePullRef.current.scale.z = thinness;
            } else {
                cheesePullRef.current.visible = false;
            }
        }

        // Animate outer dough wraps (toruses)
        torusesRef.current.forEach((torus, i) => {
            if (!torus) return;
            const posData = torusPositions[i];
            if (!posData) return;
            
            const currentSep = targetSeparation * 1.1;
            
            // Radial expansion: torus slides outwards
            const angle = (i / torusCount) * Math.PI * 2;
            torus.position.x = Math.cos(angle) * currentSep * 0.75;
            torus.position.z = Math.sin(angle) * currentSep * 0.75;
            
            // Y separation
            torus.position.y = posData.yInit * (1.0 + currentSep * 1.25);
            
            // Slanted rotation updates
            torus.rotation.x = posData.rotX + t * 0.04 + currentSep * 0.15;
            torus.rotation.y = posData.rotY + t * 0.02 + currentSep * 0.15;
        });

        // 3. Animate drifting cheese cubes
        cubesRef.current.forEach((cube, i) => {
            if (!cube) return;
            const data = cubeData[i];
            cube.position.y += data.driftSpeed * 0.007;
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

        // 4. Animate floating golden sparkles
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
            particlesRef.current.rotation.y += 0.0005;
        }

        // Parallax height shift
        if (groupRef.current) {
            groupRef.current.position.y = 0.25 - scrollFraction * 1.3;
        }
    });

    return (
        <group ref={groupRef} scale={[1.15, 1.15, 1.15]} rotation={[0.2, 0.4, -0.2]}>
            {/* INNER MOZZARELLA CHEESE STICK */}
            {/* Upper Cheese Half */}
            <mesh ref={upperCheeseRef} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.7, 32]} />
                <primitive object={cheeseMat} attach="material" />
            </mesh>

            {/* Lower Cheese Half */}
            <mesh ref={lowerCheeseRef} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.7, 32]} />
                <primitive object={cheeseMat} attach="material" />
            </mesh>

            {/* Connecting Cheese Pull (Stretchy) */}
            <mesh ref={cheesePullRef} position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.3, 1.0, 32]} />
                <primitive object={cheeseMat} attach="material" />
            </mesh>

            {/* OUTER HELICAL DOUGH WRAPS */}
            <group ref={doughGroupRef}>
                {torusPositions.map((pos, idx) => (
                    <mesh
                        key={idx}
                        ref={(el) => { torusesRef.current[idx] = el; }}
                        position={[0, pos.yInit, 0]}
                        rotation={[pos.rotX, pos.rotY, pos.rotZ]}
                        castShadow
                        receiveShadow
                    >
                        <torusGeometry args={[0.35, 0.075, 12, 32]} />
                        <primitive object={doughStripeMat} attach="material" />
                    </mesh>
                ))}
            </group>

            {/* DRIFTING CHEESE CUBES */}
            {cubeData.map((cube, idx) => (
                <mesh
                    key={idx}
                    ref={(el) => { cubesRef.current[idx] = el; }}
                    position={cube.pos}
                    castShadow
                >
                    <boxGeometry args={[0.12, 0.12, 0.12]} />
                    <meshPhysicalMaterial
                        color={0xffbe00} // Mozzarella yellow
                        roughness={0.4}
                        metalness={0.05}
                        clearcoat={0.7}
                    />
                </mesh>
            ))}

            {/* HEAT FIRE/GOLDEN EMBER SPARKLES */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particlePositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color={0xff7a00} // Vibrant orange-gold sparks
                    size={0.07}
                    transparent
                    opacity={0.8}
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
                <directionalLight position={[-5, -4, 2]} intensity={0.9} color="#ff7a00" />
                
                <CheveresModel scrollFraction={scrollFraction} mouse={mouse} />
            </Canvas>
        </div>
    );
};

export default CheveresScene;
