'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  RoundedBox,
  MeshTransmissionMaterial,
  ContactShadows,
} from '@react-three/drei';
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const HeroCSS = dynamic(() => import('@/components/HeroCSS'), { ssr: false });

/* ---------- Grieta con scanline magenta (shader) ---------- */
function CrackGlow() {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ff4ae6') },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv; void main(){ vUv=uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
        void main(){
          // franja fina que barre en X
          float x = fract(vUv.x + uTime*0.06);
          float band = smoothstep(0.49,0.5,x) - smoothstep(0.5,0.51,x);
          float core = band*0.9;
          float outer = smoothstep(0.0,0.3,band);
          vec3 col = uColor * (core*1.2 + outer*0.35);
          gl_FragColor = vec4(col, (core+outer)*0.9);
        }
      `,
    });
    return m;
  }, []);

  useFrame((s) => {
    (mat.uniforms.uTime.value as number) = s.clock.getElapsedTime();
  });

  return (
    <mesh ref={ref} position={[0, 0.02, -0.12]} rotation={[0, 0, -0.12]}>
      <planeGeometry args={[2.9, 0.06]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* ---------- Placas biseladas en diagonal ---------- */
function Plates() {
  const top = useRef<THREE.Group>(null!);
  const bottom = useRef<THREE.Group>(null!);

  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    if (top.current) top.current.position.y = 0.28 + Math.sin(t * 0.8) * 0.06;
    if (bottom.current)
      bottom.current.position.y = -0.28 + Math.cos(t * 0.95) * 0.06;
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
            roughness={0.35}
            metalness={0.02}
          />
        </RoundedBox>
      </group>
      <group
        ref={bottom}
        position={[-0.25, -0.25, -0.2]}
        rotation={[0, 0.12, 0.12]}
      >
        <RoundedBox args={[2.5, 0.12, 1.7]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.35}
            metalness={0.02}
          />
        </RoundedBox>
      </group>
      <CrackGlow />
    </group>
  );
}

/* ---------- Anillo de vidrio (tubo sobre curva en S) ---------- */
function GlassTube() {
  const geom = useMemo(() => {
    const p: THREE.Vector3[] = [
      new THREE.Vector3(-0.9, 0.9, 0.0),
      new THREE.Vector3(-0.2, 0.4, 0.1),
      new THREE.Vector3(0.2, -0.1, 0.1),
      new THREE.Vector3(0.9, -0.2, 0.0),
    ];
    const curve = new THREE.CatmullRomCurve3(p, false, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 80, 0.16, 48, false);
  }, []);
  return (
    <mesh geometry={geom} position={[0.2, 0, 0]} rotation={[0, 0.1, 0]}>
      <MeshTransmissionMaterial
        thickness={1}
        ior={1.45}
        roughness={0.08}
        anisotropy={0.15}
        chromaticAberration={0.01}
        transmission={1}
        samples={4}
        resolution={96}
      />
    </mesh>
  );
}

/* ---------- Moneda dorada ---------- */
function Coin() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    ref.current.rotation.y = t * 1.6;
    ref.current.position.y = 0.06 + Math.sin(t * 1.4) * 0.035;
  });
  return (
    <group position={[0.45, 0.02, 0]} rotation={[0, 0.25, 0]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 32]} />
        <meshStandardMaterial
          color={'#d4af37'}
          metalness={1}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.282, 0.282, 0.052, 32, 1, true]} />
        <meshStandardMaterial
          color={'#caa84a'}
          metalness={1}
          roughness={0.32}
        />
      </mesh>
    </group>
  );
}

export default function HeroAICMRefined3D() {
  const [lost, setLost] = useState(false);
  if (lost) return <HeroCSS />;

  return (
    <section className="relative h-[92vh] overflow-hidden">
      <div className="noise-overlay motion" />
      <div className="grain-procedural" />
      <div className="grain-tint" />
      {/* Canvas a la derecha (máscara) */}
      <div className="absolute inset-0 hero-3d-mask">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          dpr={[1, 1.25]}
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
          }}
        >
          <color attach="background" args={['#f6f5fa']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={1.0} />
          <directionalLight
            position={[-3, 1, 2]}
            intensity={0.9}
            color={'#ff66ee'}
          />
          <group position={[1.15, 0.05, 0]} scale={0.95}>
            <Plates />
            <GlassTube />
            <Coin />
            <ContactShadows
              position={[0, -0.55, 0]}
              opacity={0.25}
              scale={8}
              blur={2.4}
              far={2.5}
            />
          </group>
          <Environment preset="studio" />
          {/* { <EffectComposer multisampling={0}>
            <Bloom
              intensity={1.05}
              luminanceThreshold={0.82}
              luminanceSmoothing={0.22}
            />
          </EffectComposer>} */}
        </Canvas>
      </div>

      {/* UI izquierda */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container max-w-[720px]">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-slate-900">
            Diseño & Web con{' '}
            <span className="text-fuchsia-500">impacto real</span>
          </h1>
          <p className="mt-5 text-lg/7 text-slate-700/85">
            Branding, sitios y automatizaciones que elevan tu marca.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="#contacto"
              className="rounded-2xl px-5 py-3 bg-slate-900 text-white shadow-lg hover:opacity-90"
            >
              Agendar reunión
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

      {/* Grain overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
    </section>
  );
}
