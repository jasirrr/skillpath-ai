"use client";

import Link from "next/link";
import { BrainCircuit, Upload, Map, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-primary-600 p-2 rounded-xl">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          AI Skill Planner
        </span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors">
          <Upload size={18}/> Analyze
        </Link>
        {user && (
          <Link href="/my-plans" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors">
            <Map size={18}/> Roadmaps
          </Link>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
              <UserIcon size={14} />
              {user.name || user.email}
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-primary py-2 px-6 text-sm">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
