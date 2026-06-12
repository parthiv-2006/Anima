import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Per-biome color configs
const BIOME = {
  volcanic: {
    ground: '#180a04',
    fogColor: '#0f0300',
    sparkle: '#fb923c',
    ambient: '#7c2d12',
    sun: [1.0, 0.4, 0.2],
  },
  ocean: {
    ground: '#06121f',
    fogColor: '#020810',
    sparkle: '#67e8f9',
    ambient: '#0c3555',
    sun: [0.2, 0.6, 1.0],
  },
  forest: {
    ground: '#0c1f0c',
    fogColor: '#060f06',
    sparkle: '#86efac',
    ambient: '#14451a',
    sun: [0.8, 0.9, 0.3],
  },
};

// ─── Ground ──────────────────────────────────────────────────────────────────
function Ground({ biome }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
      <planeGeometry args={[32, 32]} />
      <meshStandardMaterial color={BIOME[biome].ground} roughness={0.95} />
    </mesh>
  );
}

// ─── Flora per biome ─────────────────────────────────────────────────────────
function ForestTrees({ positions }) {
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.13, 0.9, 6]} />
            <meshStandardMaterial color="#3a2416" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow>
            <coneGeometry args={[0.5 + (i % 3) * 0.1, 1.35, 7]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(0.33 + (i % 6) * 0.008, 0.52, 0.2 + (i % 4) * 0.05)}
              roughness={0.75}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

function OceanCoral({ positions }) {
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.04 + (i % 3) * 0.025, 0.1, 0.75 + (i % 4) * 0.28, 8]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(0.5 + (i % 7) * 0.018, 0.72, 0.44)}
              emissive={new THREE.Color().setHSL(0.5 + (i % 7) * 0.018, 0.8, 0.16)}
              roughness={0.35}
              metalness={0.15}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

function VolcanicCrystals({ positions }) {
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh
            position={[0, 0.28 + (i % 3) * 0.14, 0]}
            rotation={[0, i * 1.3, 0.07 * ((i % 3) - 1)]}
            castShadow
          >
            <octahedronGeometry args={[0.17 + (i % 4) * 0.08, 0]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(0.05 + (i % 5) * 0.012, 0.92, 0.52)}
              emissive={new THREE.Color().setHSL(0.04 + (i % 5) * 0.012, 1, 0.2)}
              roughness={0.28}
              metalness={0.45}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Flora({ count, biome }) {
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      const shell = Math.floor(i / 8);
      const angle = (i / Math.max(count, 1)) * Math.PI * 2 + shell * 0.4;
      const r = 2.4 + shell * 0.95 + (i % 5) * 0.35;
      pos.push([Math.cos(angle) * r, 0, Math.sin(angle) * r]);
    }
    return pos;
  }, [count]);

  if (biome === 'forest') return <ForestTrees positions={positions} />;
  if (biome === 'ocean') return <OceanCoral positions={positions} />;
  return <VolcanicCrystals positions={positions} />;
}

// ─── Orbiting stat crystals ───────────────────────────────────────────────────
const CRYSTAL_COLORS = {
  str: new THREE.Color('#ef4444'),
  int: new THREE.Color('#818cf8'),
  spi: new THREE.Color('#34d399'),
};

function StatCrystals({ crystals }) {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.28;
  });

  return (
    <group ref={groupRef} position={[0, 1.7, 0]}>
      {Object.entries(crystals).map(([stat, scale], i) => {
        const angle = (i / 3) * Math.PI * 2;
        const color = CRYSTAL_COLORS[stat];
        return (
          <mesh
            key={stat}
            position={[Math.cos(angle) * 1.45, Math.sin(i * 0.95) * 0.28, Math.sin(angle) * 1.45]}
            scale={Math.max(0.12, scale)}
          >
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              roughness={0.22}
              metalness={0.55}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Full scene ───────────────────────────────────────────────────────────────
function SceneContent({ state }) {
  const {
    biome, sunInclination, skyTurbidity, skyRayleigh,
    fogNear, fogFar, floraCount, crystals,
    particleCount, particleSpeed,
  } = state;

  const cfg = BIOME[biome];

  const sunPos = useMemo(() => {
    const angle = sunInclination * Math.PI;
    return [Math.cos(angle * 1.1) * 0.8, Math.sin(angle), 0.45];
  }, [sunInclination]);

  return (
    <>
      <fog attach="fog" args={[cfg.fogColor, fogNear, fogFar]} />

      <ambientLight color={cfg.ambient} intensity={0.5} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={25}
      />

      <Sky
        turbidity={skyTurbidity}
        rayleigh={skyRayleigh}
        mieCoefficient={0.004}
        mieDirectionalG={0.82}
        sunPosition={sunPos}
      />

      <Ground biome={biome} />
      <Flora count={floraCount} biome={biome} />
      <StatCrystals crystals={crystals} />

      <Sparkles
        count={particleCount}
        scale={[9, 5, 9]}
        size={1.8}
        speed={particleSpeed}
        color={cfg.sparkle}
        opacity={0.72}
      />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3.8}
        maxDistance={9.5}
        target={[0, 0.7, 0]}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// ─── Export — lazy-loadable ───────────────────────────────────────────────────
export default function HabitatScene({ state }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.8, 7], fov: 58 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <SceneContent state={state} />
      </Suspense>
    </Canvas>
  );
}
