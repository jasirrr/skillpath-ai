"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, TrendingUp, Zap, Loader2, MessageSquare, Brain } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get(`/analyze-gap/${sessionId}`);
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchData();
  }, [sessionId, user, authLoading, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <Loader2 className="animate-spin text-primary-600" size={48} />
      <p className="text-slate-500 font-medium">Crunching your skill data...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">Skill Analysis Dashboard</h1>
          <p className="text-slate-600">Review your strengths and identify critical gaps.</p>
        </div>
        
        {/* Merit Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-slate-800 min-w-[240px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Overall Merit Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter">{data?.merit_score || '0.0'}</span>
              <span className="text-slate-500 font-bold">/ 10</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Primary Action Paths */}
      <div className="grid md:grid-cols-3 gap-6">
        <ActionCard 
          title="Chat with AI Agent" 
          description="Free-form discussion about your profile, the JD, and how to frame your experience."
          icon={<MessageSquare className="text-indigo-600" size={32} />}
          href={`/chat/${sessionId}`}
          btnText="Open Chat"
          color="bg-indigo-50 border-indigo-100"
        />
        <ActionCard 
          title="Skills Assessment" 
          description="Validate your real proficiency through interactive, role-specific technical probing."
          icon={<Brain className="text-primary-600" size={32} />}
          href="#skill-assessment"
          btnText="Assess Skills"
          color="bg-primary-50 border-primary-100"
        />
        <ActionCard 
          title="Learning Roadmap" 
          description="Follow a personalized 4-week growth plan designed to bridge your specific gaps."
          icon={<Zap className="text-amber-500" size={32} />}
          href={`/roadmap/${sessionId}`}
          btnText="View Roadmap"
          color="bg-amber-50 border-amber-100"
        />
      </div>

      <div id="skill-assessment" className="pt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Detailed Skill Gaps</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <SkillCard 
            title="Strong Matches" 
            skills={data.strong_matches} 
            icon={<CheckCircle2 className="text-emerald-500" />}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
          />
          <SkillCard 
            title="Partial Matches" 
            skills={data.partial_matches} 
            icon={<Zap className="text-amber-500" />}
            bgColor="bg-amber-50"
            borderColor="border-amber-100"
            sessionId={sessionId}
            canAssess
          />
          <SkillCard 
            title="Missing Skills" 
            skills={data.missing_skills} 
            icon={<AlertCircle className="text-rose-500" />}
            bgColor="bg-rose-50"
            borderColor="border-rose-100"
            sessionId={sessionId}
            canAssess
          />
        </div>
      </div>

    </div>
  );
}

const ActionCard = ({ title, description, icon, href, btnText, color }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${color} p-8 border flex flex-col justify-between items-center text-center space-y-6 hover:shadow-xl transition-all h-full`}
    >
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      <Link href={href} className="btn-primary w-full justify-center">
        {btnText}
        <ArrowRight size={18} />
      </Link>
    </motion.div>
  );
}

const SkillCard = ({ title, skills, icon, bgColor, borderColor, canAssess, sessionId }: any) => {
  const router = useRouter();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${bgColor} ${borderColor} p-6 border flex flex-col`}
    >
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <span className="ml-auto bg-white px-2 py-1 rounded-md text-xs font-bold text-slate-600 border border-slate-100 shadow-sm">
          {skills?.length || 0}
        </span>
      </div>
      
      <div className="flex-grow space-y-3">
        {skills?.length > 0 ? (
          skills.map((skill: string, i: number) => (
            <div key={i} className="flex items-center justify-between group">
              <span className="text-slate-700 font-medium">{skill}</span>
              {canAssess && (
                <button 
                  onClick={() => router.push(`/assessment/${sessionId}/${encodeURIComponent(skill)}`)}
                  className="opacity-0 group-hover:opacity-100 transition-all text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline"
                >
                  Assess <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-sm italic">None identified</p>
        )}
      </div>
    </motion.div>
  );
}
