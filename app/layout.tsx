import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const metadata: Metadata = {
 title: "Sairaj Jadhav | Computer Science Portfolio",
 description: "Sairaj Jadhav — Applied Computer Science student at Dalhousie University. Exploring cybersecurity, data science, analytics, and software development through hands-on projects.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {return <html lang="en"><body className={`${dm.variable} ${manrope.variable}`}>{children}</body></html>}
