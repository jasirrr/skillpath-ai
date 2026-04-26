"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Loader2, Briefcase, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchSessions = async () => {
      try {
        const response = await api.get(`/user/sessions/${user.id}`);
        setSessions(response.data);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, authLoading, router]);

  if (loading || authLoading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <Loader2 className="animate-spin text-primary-600" size={48} />
      <p className="text-slate-500 font-medium">Fetching your roadmaps...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900">My Roadmaps</h1>
          <p className="text-slate-500">Your personalized growth journey, all in one place.</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="btn-primary"
        >
          New Analysis
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length > 0 ? sessions.map((session, idx) => (
          <motion.div 
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card bg-white hover:border-primary-300 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Briefcase className="text-indigo-600" size={18} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Calendar size={12} />
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {session.job_title || "Software Engineer"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">ID: {session.id.slice(0, 8)}...</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {session.skill_gaps?.missing_skills?.slice(0, 3).map((s: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                    {s}
                  </span>
                ))}
                {session.skill_gaps?.missing_skills?.length > 3 && (
                  <span className="px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-slate-400">
                    +{session.skill_gaps.missing_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between">
              <button 
                onClick={() => router.push(`/dashboard/${session.id}`)}
                className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
              >
                View Dashboard
                <ArrowRight size={14} />
              </button>
              <button className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Briefcase size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">No plans yet</h3>
              <p className="text-slate-500">Upload your first resume and JD to start building your roadmap!</p>
            </div>
            <button onClick={() => router.push('/')} className="btn-secondary">Get Started</button>
          </div>
        )}
      </div>
    </div>
  );
}
