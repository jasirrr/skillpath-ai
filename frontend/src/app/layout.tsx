import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrainCircuit, LayoutDashboard, Map, Upload } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Skill Planner",
  description: "Personalized learning roadmap powered by AI",
};

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-6 py-8">
            {children}
          </main>
          
          <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-100">
            &copy; 2024 AI Skill Assessment & Personalized Learning Planner. Built with ❤️ for future-proof careers.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
