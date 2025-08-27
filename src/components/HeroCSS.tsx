'use client';
import { useCallback } from 'react';

export default function HeroCSS() {
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      '--x',
      (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%'
    );
    el.style.setProperty(
      '--y',
      (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%'
    );
  }, []);

  return (
    <section
      onMouseMove={onMove}
      className="relative h-[92vh] overflow-hidden text-slate-900"
    >
      <div className="noise-overlay motion" />
      <div className="grain-procedural" />
      <div className="grain-tint" />
      {/* Base */}
      <div className="absolute inset-0 bg-[#f3f2f6]" />
      {/* Placas con corte diagonal y glow */}
      <div className="absolute inset-0">
        <div
          className="absolute -left-10 top-20 w-[120%] h-[60%] bg-white shadow-2xl"
          style={{ clipPath: 'polygon(0% 0%,100% 0%,70% 100%,0% 100%)' }}
        />
        <div
          className="absolute left-10 bottom-6 w-[120%] h-[55%] bg-white shadow-2xl"
          style={{ clipPath: 'polygon(30% 0%,100% 0%,100% 100%,0% 100%)' }}
        />
        {/* grieta luminosa */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60rem 30rem at var(--x,70%) var(--y,40%), rgba(255,0,233,.25), transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
        <div className="absolute inset-x-[10%] top-1/2 h-8 -translate-y-1/2 bg-fuchsia-500/40 blur-2xl rounded-full" />
        <div className="absolute inset-x-[10%] top-1/2 h-[2px] -translate-y-1/2 bg-fuchsia-400/80" />
      </div>

      {/* Aro "vidrio" simulado */}
      <div className="absolute right-[8%] top-[28%] w-[36vw] max-w-[520px] aspect-square">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 210deg, rgba(255,255,255,.75), rgba(200,200,255,.2), rgba(255,255,255,.9))',
            WebkitMask:
              'radial-gradient(closest-side, transparent 62%, black 64%)',
            mask: 'radial-gradient(closest-side, transparent 62%, black 64%)',
            filter: 'blur(2px)',
          }}
        />
        {/* reflejo magenta */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(60% 60% at 60% 50%, rgba(246,0,255,.25), transparent 60%)',
            WebkitMask:
              'radial-gradient(closest-side, transparent 58%, black 61%)',
            mask: 'radial-gradient(closest-side, transparent 58%, black 61%)',
            filter: 'blur(6px)',
          }}
        />
      </div>

      {/* Grano */}
      <div className="noise-overlay" />

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container max-w-[720px]">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Magno Studio
          </h1>
          <p className="mt-4 text-lg/7 text-slate-700/85">
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
