'use client';
import { useCallback } from 'react';

export default function HeroVideo() {
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty('--spot-x', x + '%');
    el.style.setProperty('--spot-y', y + '%');
  }, []);

  return (
    <section
      onMouseMove={onMove}
      className="relative h-[92vh] overflow-hidden text-slate-900 spotlight"
    >
      <div className="grain-procedural" />
      <div className="grain-tint" />
      {/* Video BG */}
      <video
        className="motion-safe-only absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero.jpg"
      >
        <source src="/hero.webm" type="video/webm" />
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Tinte/Glow sutil */}
      <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-300/20 via-transparent to-transparent" />
      <div className="noise-overlay" />

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container max-w-[720px]">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Diseño & Web con{' '}
            <span className="text-fuchsia-500">impacto real</span>
          </h1>
          <p className="mt-5 text-lg/7 text-slate-800/80">
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
    </section>
  );
}
