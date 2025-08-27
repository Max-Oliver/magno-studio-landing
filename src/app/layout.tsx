import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
title: "Magno Studio — Diseño & Web",
description: "Branding, sitios y automatizaciones que elevan tu marca.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="es" className="scroll-smooth">
<body className={inter.className}>{children}</body>
</html>
);
}