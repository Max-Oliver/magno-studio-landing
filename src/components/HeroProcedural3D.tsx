'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';

function GlassTorus() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.25) * 0.25;
  });
  return (
    <mesh ref={ref} position={[0.8, 0.2, 0]} rotation={[0.2, 0.2, 0]}>
      <torusGeometry args={[0.7, 0.12, 64, 256]} />
      <meshPhysicalMaterial
        transmission={1}
        roughness={0.08}
        thickness={0.9}
        ior={1.45}
        metalness={0}
        envMapIntensity={1.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function Plate({ flip = false }: { flip?: boolean }) {
  return (
    <mesh
      position={[flip ? 0.2 : -0.2, flip ? -0.25 : 0.25, -0.2]}
      rotation={[0, flip ? 0.08 : -0.08, 0]}
    >
      <boxGeometry args={[2.2, 0.02, 1.6]} />
      <meshStandardMaterial
        color={new THREE.Color(0xffffff)}
        roughness={0.3}
        metalness={0.0}
      />
    </mesh>
  );
}

function EmissiveCrack() {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ff44ee'),
    transparent: true,
    opacity: 0.8,
  });
  return (
    <mesh position={[0, 0, -0.1]}>
      <boxGeometry args={[2.4, 0.02, 0.05]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export default function HeroProcedural3D() {
  return (
    <section className="relative h-[92vh] overflow-hidden text-slate-900">
      <div className="grain-procedural" />
      <div className="grain-tint" />
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <color attach="background" args={['#f3f2f6']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <directionalLight
          position={[-3, 1, 2]}
          intensity={0.7}
          color={'#ff66ee'}
        />

        <Plate />
        <Plate flip />
        <EmissiveCrack />
        <GlassTorus />

        <Environment preset="studio" />
        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.2}
          />
        </EffectComposer>
      </Canvas>

      <div className="noise-overlay" />

      <div className="absolute inset-0 flex items-center">
        <div className="container max-w-[720px]">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Magno Studio
          </h1>
          <p className="mt-4 text-lg/7 text-slate-700/85">
            Hero 3D procedural sin assets externos.
          </p>
        </div>
      </div>
    </section>
  );
}
