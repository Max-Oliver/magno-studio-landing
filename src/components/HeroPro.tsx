'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment, AdaptiveDpr } from '@react-three/drei';
import { MeshTransmissionMaterial } from '@react-three/drei'; // vidrio
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const HeroCSS = dynamic(() => import('@/components/HeroCSS'), { ssr: false });

function CrackScanline() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#ff4ae6') },
        },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec2 vUv;uniform float uTime;uniform vec3 uColor;void main(){float x=fract(vUv.x+uTime*0.06);float band=smoothstep(0.49,0.5,x)-smoothstep(0.5,0.51,x);float core=band*1.0;float glow=smoothstep(0.0,0.33,band);vec3 col=uColor*(core*1.15+glow*0.4);gl_FragColor=vec4(col,(core+glow)*0.95);} `,
      }),
    []
  );
  useFrame((s) => {
    (mat.uniforms.uTime.value as number) = s.clock.getElapsedTime();
  });
  return (
    <mesh position={[0, 0.02, -0.12]} rotation={[0, 0, -0.12]}>
      <planeGeometry args={[2.9, 0.06]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function Plates() {
  const top = useRef<THREE.Group>(null!);
  const bot = useRef<THREE.Group>(null!);
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    if (top.current) top.current.position.y = 0.28 + Math.sin(t * 0.8) * 0.06;
    if (bot.current) bot.current.position.y = -0.28 + Math.cos(t * 0.95) * 0.06;
  });
  return (
    <group>
      <group
        ref={top}
        position={[0.25, 0.25, -0.2]}
        rotation={[0, -0.12, -0.12]}
      >
        <RoundedBox args={[2.5, 0.12, 1.7]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.33}
            metalness={0.02}
          />
        </RoundedBox>
      </group>
      <group
        ref={bot}
        position={[-0.25, -0.25, -0.2]}
        rotation={[0, 0.12, 0.12]}
      >
        <RoundedBox args={[2.5, 0.12, 1.7]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.33}
            metalness={0.02}
          />
        </RoundedBox>
      </group>
      <CrackScanline />
    </group>
  );
}

function GlassTube() {
  const geom = useMemo(() => {
    const pts = [
      new THREE.Vector3(-0.65, 0.85, 0.0),
      new THREE.Vector3(-0.15, 0.45, 0.1),
      new THREE.Vector3(0.15, 0.05, 0.12),
      new THREE.Vector3(0.7, -0.05, 0.0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 64, 0.16, 32, false);
  }, []);
  return (
    <mesh geometry={geom} position={[0.15, 0, 0]} rotation={[0, 0.1, 0]}>
      <MeshTransmissionMaterial
        thickness={0.9}
        ior={1.45}
        roughness={0.08}
        transmission={1}
        samples={6}
        resolution={128}
        anisotropy={0.1}
        chromaticAberration={0.005}
        distortion={0}
      />
    </mesh>
  );
}

function Coin() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    ref.current.rotation.y = t * 1.6;
    ref.current.position.y = 0.06 + Math.sin(t * 1.4) * 0.035;
  });
  return (
    <group position={[0.42, 0.02, 0]} rotation={[0, 0.25, 0]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 32]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={1}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.282, 0.282, 0.052, 32, 1, true]} />
        <meshStandardMaterial color="#caa84a" metalness={1} roughness={0.32} />
      </mesh>
    </group>
  );
}

export default function HeroPro() {
  const [lost, setLost] = useState(false);
  if (lost) return <HeroCSS />;
  return (
    <section className="relative h-[92vh] overflow-hidden">
      <div className="noise-overlay motion" />
      <div className="grain-procedural" />
      <div className="grain-tint" />
      <div className="absolute inset-0 hero-3d-mask">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            alpha: true,
          }}
          onCreated={({ gl }) => {
            const cvs = (gl.getContext() as WebGLRenderingContext)
              .canvas as HTMLCanvasElement;
            cvs.addEventListener(
              'webglcontextlost',
              (e) => {
                e.preventDefault();
                setLost(true);
              },
              { passive: false }
            );
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
          }}
        >
          <color attach="background" args={['#f6f5fa']} />
          <hemisphereLight args={[0xffffff, 0xdadada, 0.9]} />
          <directionalLight position={[3, 3, 3]} intensity={1.0} />
          <directionalLight
            position={[-3, 1, 2]}
            intensity={0.9}
            color={'#7d6bff'}
          />

          <group position={[1.12, 0.05, 0]} scale={0.95}>
            <Plates />
            <GlassTube />
            <Coin />
          </group>

          {/* Bloom leve (seguro) */}
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.95}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.25}
            />
          </EffectComposer>

          <Environment preset="studio" />
          <AdaptiveDpr pixelated />
        </Canvas>
      </div>

      {/* UI izq */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container max-w-[720px]">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-slate-900">
            Magno Studio
          </h1>
          <p className="mt-5 text-lg/7 text-slate-700/85">
            Diseño, web y automatizaciones con estética de alto impacto.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="#contacto"
              className="rounded-2xl px-5 py-3 bg-slate-900 text-white shadow-lg hover:opacity-90"
            >
              Agendar
            </a>
            <a
              href="#servicios"
              className="rounded-2xl px-5 py-3 bg-white/70 backdrop-blur border border-white/50 shadow"
            >
              Ver servicios
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
