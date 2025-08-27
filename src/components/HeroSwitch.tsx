"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const HeroAICM_Pro = dynamic(() => import("./HeroAICM_Pro"), { ssr: false });
const HeroCSS = dynamic(() => import("./HeroCSS"), { ssr: false });

export default function HeroSwitch() {
  const sp = useSearchParams();
  const mode = sp.get("mode");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  if (reduced) return <HeroCSS />;
  if (mode === "css") return <HeroCSS />;
  return <HeroAICM_Pro />;
}
