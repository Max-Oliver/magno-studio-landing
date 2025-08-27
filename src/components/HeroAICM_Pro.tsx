'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  RoundedBox,
  MeshTransmissionMaterial,
  ContactShadows,
  AdaptiveDpr,
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

export const TUNING = {
  plateAmp: 0.06, // TODO: ajustar amplitud placas
  plateSpeedTop: 0.8, // TODO: velocidad placa superior
  plateSpeedBottom: 0.95, // TODO: velocidad placa inferior
  coinRotate: 1.6, // TODO: velocidad giro moneda
  coinBounce: 0.035, // TODO: altura bounce moneda
};

const DISABLE_BLOOM = process.env.NEXT_PUBLIC_DISABLE_BLOOM === '1';
const LOW_GPU = process.env.NEXT_PUBLIC_LOW_GPU === '1';

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
    if (top.current)
      top.current.position.y =
        0.28 + Math.sin(t * TUNING.plateSpeedTop) * TUNING.plateAmp;
    if (bottom.current)
      bottom.current.position.y =
        -0.28 + Math.cos(t * TUNING.plateSpeedBottom) * TUNING.plateAmp;
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
    const tubular = LOW_GPU ? 36 : 80; // TODO: refinar segmentos
    const radial = LOW_GPU ? 24 : 48; // TODO: refinar segmentos radiales
    return new THREE.TubeGeometry(curve, tubular, 0.16, radial, false);
  }, []);
  return (
    <mesh geometry={geom} position={[0.2, 0, 0]} rotation={[0, 0.1, 0]}>
      {LOW_GPU ? (
        <meshPhysicalMaterial
          transmission={0.95}
          thickness={0.9}
          roughness={0.15}
          ior={1.45}
        />
      ) : (
        <MeshTransmissionMaterial
          thickness={0.9}
          ior={1.45}
          roughness={0.08}
          transmission={1}
          samples={5}
          resolution={128}
        />
      )}
    </mesh>
  );
}

/* ---------- Moneda dorada ---------- */
function Coin() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    ref.current.rotation.y = t * TUNING.coinRotate;
    ref.current.position.y = 0.06 + Math.sin(t * 1.4) * TUNING.coinBounce;
  });
  const segs = LOW_GPU ? 24 : 32;
  return (
    <group position={[0.45, 0.02, 0]} rotation={[0, 0.25, 0]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, segs]} />
        <meshStandardMaterial
          color={'#d4af37'}
          metalness={1}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.282, 0.282, 0.052, segs, 1, true]} />
        <meshStandardMaterial
          color={'#caa84a'}
          metalness={1}
          roughness={0.32}
        />
      </mesh>
    </group>
  );
}

export default function HeroAICM_Pro() {
  const [lost, setLost] = useState(false);
  const [hasNoise, setHasNoise] = useState(false);
  useEffect(() => {
    fetch('/noise.png').then((r) => r.ok && setHasNoise(true));
  }, []);
  if (lost) return <HeroCSS />;

  return (
    <section className="relative h-[92vh] overflow-hidden">
      {/* Canvas a la derecha (máscara) */}
      <div className="absolute inset-0 hero-3d-mask pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
          onCreated={({ gl }) => {
            const cvs = (gl.getContext() as WebGLRenderingContext).canvas as HTMLCanvasElement;
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
          <AdaptiveDpr />
          <color attach="background" args={['#f6f5fa']} />
          <hemisphereLight intensity={0.9} />
          <directionalLight position={[3, 3, 3]} intensity={1.0} />
          <directionalLight position={[-3, 1, 2]} intensity={0.9} color={'#7d6bff'} />
          <group position={[1.12, 0.05, 0]} scale={0.95}>
            <Plates />
            <GlassTube />
            <Coin />
            <ContactShadows position={[0, -0.55, 0]} opacity={0.25} scale={8} blur={2.4} far={2.5} />
          </group>
          <Environment preset="studio" />
          {!DISABLE_BLOOM && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.9} luminanceThreshold={0.85} />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      {/* UI izquierda */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container max-w-[720px]">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-slate-900">
            Diseño & Web con <span className="text-fuchsia-500">impacto real</span>
          </h1>
          <p className="mt-5 text-lg/7 text-slate-700/85">Branding, sitios y automatizaciones que elevan tu marca.</p>
          <div className="mt-8 flex gap-3">
            <a href="#contacto" className="rounded-2xl px-5 py-3 bg-slate-900 text-white shadow-lg hover:opacity-90">
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
      {hasNoise ? <div className="noise-overlay" /> : <div className="grain-procedural" />}
    </section>
  );
}
