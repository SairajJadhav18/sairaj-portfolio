import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const title = "Sairaj Jadhav | Computer Science Portfolio";
const description = "Sairaj Jadhav — Applied Computer Science student at Dalhousie University. Exploring cybersecurity, data science, analytics, and software development through hands-on projects.";
export const metadata: Metadata = {
 title,
 description,
 authors: [{ name: "Sairaj Jadhav" }],
 keywords: ["Sairaj Jadhav", "Computer Science", "Dalhousie University", "Cybersecurity", "Data Science", "Software Development", "Portfolio"],
 openGraph: { title, description, type: "website", locale: "en_CA", images: [{ url: "/about-portrait.jpg", alt: "Sairaj Jadhav" }] },
 twitter: { card: "summary", title, description },
};
export const viewport: Viewport = { themeColor: "#101b24", colorScheme: "dark light" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {return <html lang="en"><body className={`${dm.variable} ${manrope.variable}`}>{children}</body></html>}
