"use client";
import { useEffect, useState } from "react";

export default function HeroCSS() {
  const [hasNoise, setHasNoise] = useState(false);
  useEffect(() => {
    fetch("/noise.png").then((r) => r.ok && setHasNoise(true));
  }, []);

  return (
    <section className="relative h-[92vh] overflow-hidden bg-gradient-to-br from-[#f3f2f6] to-[#fafafa]">
      {/* halo magenta */}
      <div
        className="absolute right-[8%] top-[28%] w-[36vw] max-w-[520px] aspect-square"
        style={{
          background:
            "radial-gradient(60% 60% at 60% 50%, rgba(246,0,255,.25), transparent 60%)",
          filter: "blur(40px)",
        }}
      />

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

      {hasNoise ? <div className="noise-overlay" /> : <div className="grain-procedural" />}
    </section>
  );
}
