/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useRef } from 'react';

function Scene() {
  const ref = useRef<any>(null);
  const { scene } = useGLTF('/hero.glb'); // exportado desde Blender
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) ref.current.rotation.y = Math.sin(t * 0.2) * 0.2;
  });
  return (
    <>
      <primitive object={scene} ref={ref} position={[0, -0.2, 0]} />
      <Environment preset="studio" />
      <EffectComposer>
        <Bloom
          intensity={1.35}
          luminanceThreshold={0.82}
          luminanceSmoothing={0.22}
        />
      </EffectComposer>
    </>
  );
}

export default function Hero3D() {
  return (
    <section className="relative h-[92vh] overflow-hidden text-slate-900 spotlight">
      <div className="grain-procedural" />
      <div className="grain-tint" />
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="noise-overlay" />
      <div className="absolute inset-0 flex items-center">
        <div className="container max-w-[720px]">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Diseño & Web con{' '}
            <span className="text-fuchsia-500">impacto real</span>
          </h1>
          <p className="mt-5 text-lg/7 text-slate-800/80">
            Branding, sitios y automatizaciones que elevan tu marca.
          </p>
        </div>
      </div>
    </section>
  );
}
