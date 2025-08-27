"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";


const HeroCSS = dynamic(() => import("@/components/HeroCSS"), { ssr: false });
const HeroAICM = dynamic(() => import("@/components/HeroAICMRefined3D"), { ssr: false });
const HeroLite = dynamic(() => import("@/components/HeroAICM_Lite"), { ssr: false });
const HeroPro = dynamic(() => import("@/components/HeroPro"), { ssr: false });


export default function HeroSwitch(){
const sp = useSearchParams();
const mode = sp.get("mode"); // css | aicm | refined | pro
if (mode === "pro") return <HeroPro/>;
if (mode === "refined") return <HeroLite/>;
if (mode === "aicm") return <HeroAICM/>;
if (mode === "css") return <HeroCSS/>;
return <HeroLite/>; // por defecto: versión balanceada/ligera
}