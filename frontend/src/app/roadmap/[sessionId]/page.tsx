"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, CheckCircle, ExternalLink, ArrowLeft, Download, Bookmark, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get(`/generate-roadmap/${sessionId}`);
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchData();
  }, [sessionId, user, authLoading, router]);

  const handleToggleTask = async (week: number, topicIdx: number, task: string) => {
    setToggling(`${week}-${topicIdx}-${task}`);
    try {
      const formData = new FormData();
      formData.append('week', week.toString());
      formData.append('topic_idx', topicIdx.toString());
      formData.append('task', task);
      
      const response = await api.post(`/roadmap/${sessionId}/toggle-task`, formData);
      setData(response.data.roadmap);
    } catch (err) {
      console.error("Failed to toggle task", err);
    } finally {
      setToggling(null);
    }
  };

  const calculateProgress = () => {
    if (!data?.weeks) return 0;
    let totalTasks = 0;
    let completedTasks = 0;
    
    data.weeks.forEach((w: any) => {
      w.topics.forEach((t: any) => {
        totalTasks += t.tasks.length;
        completedTasks += t.completed_tasks?.length || 0;
      });
    });
    
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <Loader2 className="animate-spin text-primary-600" size={48} />
      <p className="text-slate-500 font-medium">Building your personalized roadmap...</p>
    </div>
  );

  const progress = calculateProgress();
  const activeWeekIdx = data?.weeks?.findIndex((w: any) => !w.is_completed) ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 animate-fade-in">
      {/* Header Section with Bento Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        <div className="md:col-span-8 flex flex-col justify-center space-y-4">
          <button 
            onClick={() => router.push(`/dashboard/${sessionId}`)}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to Analysis
          </button>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            {data.target_role}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
            Your personalized learning path built from your assessment. Focus on these modules to bridge the seniority gap.
          </p>
        </div>
        <div className="md:col-span-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Overall Progress</p>
              <h3 className="text-4xl font-black text-primary-600 mt-1">{progress}%</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            </div>
          </div>
          <div className="mt-8">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 transition-all duration-1000 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-slate-500 font-bold tracking-tight">
                {data?.weeks?.filter((w: any) => w.is_completed).length} of {data?.weeks?.length} modules completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Roadmap */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-100 z-0 rounded-full hidden md:block"></div>
        
        <div className="space-y-16 relative z-10">
          {data.weeks?.map((weekData: any, idx: number) => {
            const isCompleted = weekData.is_completed;
            const isActive = idx === activeWeekIdx;
            const isLocked = idx > activeWeekIdx;

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col md:flex-row gap-8 group ${isLocked ? 'opacity-50' : ''}`}
              >
                {/* Status Indicator Circle */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ring-8 ring-slate-50 shadow-lg z-20 relative">
                  {isCompleted ? (
                    <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                      <span className="material-symbols-outlined text-white text-3xl font-bold">check</span>
                    </div>
                  ) : isActive ? (
                    <div className="w-full h-full rounded-full bg-white border-4 border-primary-600 flex items-center justify-center shadow-xl">
                      <span className="text-primary-600 font-black text-2xl">{weekData.week.toString().padStart(2, '0')}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">lock</span>
                    </div>
                  )}
                </div>

                {/* Week Card */}
                <div className={`flex-1 bg-white border rounded-[2rem] p-8 transition-all relative overflow-hidden ${
                  isActive ? 'border-primary-600/30 shadow-2xl shadow-primary-600/10 ring-4 ring-primary-600/5 scale-[1.02]' : 
                  isCompleted ? 'border-emerald-100 bg-slate-50/50' : 'border-slate-200 shadow-sm'
                }`}>
                  {isActive && (
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-bl-full -mr-24 -mt-24 opacity-50 -z-10"></div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        {isActive && (
                          <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Active Now</span>
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                          Week {weekData.week.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <h4 className={`text-3xl font-black tracking-tight ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                        {weekData.sprint_goal}
                      </h4>
                    </div>
                    {!isLocked && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        {weekData.topics.reduce((acc: number, t: any) => acc + parseInt(t.time_to_mastery || "0"), 0)} hrs
                      </div>
                    )}
                  </div>

                  {!isLocked && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="md:col-span-2 space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curriculum Breakdown</p>
                        <div className="space-y-3">
                          {weekData.topics.map((topic: any, tIdx: number) => (
                            <div key={tIdx} className="space-y-3">
                              <h5 className="text-sm font-black text-slate-900 mt-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                                {topic.name}
                              </h5>
                              {topic.tasks.map((task: string, i: number) => {
                                const isDone = topic.completed_tasks?.includes(task);
                                return (
                                  <motion.div 
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                                      isDone ? 'bg-emerald-50/30 border-emerald-100 text-slate-400 grayscale' : 
                                      'bg-slate-50 border-slate-100 hover:border-primary-200 group/task'
                                    }`}
                                    onClick={() => handleToggleTask(weekData.week, tIdx, task)}
                                  >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                      isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white group-hover/task:border-primary-600'
                                    }`}>
                                      {isDone && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
                                      {toggling === `${weekData.week}-${tIdx}-${task}` && <Loader2 size={14} className="animate-spin text-primary-600" />}
                                    </div>
                                    <span className={`text-sm font-medium flex-1 ${isDone ? 'line-through' : ''}`}>{task}</span>
                                    <span className="material-symbols-outlined text-slate-300 group-hover/task:text-primary-600 transition-colors">info</span>
                                  </motion.div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-6 bg-primary-50 rounded-[2rem] border border-primary-100 relative overflow-hidden group">
                          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-8xl text-primary-600">terminal</span>
                          </div>
                          <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-3">Weekly Outcome</p>
                          <p className="text-sm font-bold text-slate-900 leading-relaxed italic italic">
                            "{weekData.topics[0]?.outcome || "Master the core concepts of this week's sprint."}"
                          </p>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Materials</p>
                           <div className="space-y-2">
                              {weekData.topics.flatMap((t: any) => t.recommended_resources || []).map((res: any, i: number) => (
                                <a 
                                  key={i} 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between group/res hover:border-primary-600 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/res:bg-primary-50 transition-colors">
                                      <span className="material-symbols-outlined text-slate-400 text-[18px] group-hover/res:text-primary-600">
                                        {res.type === 'Video' ? 'play_circle' : 'description'}
                                      </span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 group-hover/res:text-primary-600 transition-colors">{res.name}</span>
                                  </div>
                                  <span className="material-symbols-outlined text-slate-300 text-[16px] group-hover/res:text-primary-600">open_in_new</span>
                                </a>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Completion Element */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mt-24 p-10 bg-slate-900 text-white rounded-[3rem] flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-6 text-center md:text-left">
          <div>
            <h3 className="text-3xl font-black mb-3">Goal Mastery Streak</h3>
            <p className="text-slate-400 text-sm font-medium">Complete your active week to unlock the next level of seniority.</p>
          </div>
          <div className="flex justify-center md:justify-start gap-8">
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3 transition-colors ${progress > 25 ? 'border-primary-600 bg-primary-600/10 text-primary-600' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: progress > 25 ? "'FILL' 1" : "" }}>workspace_premium</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black">Foundation</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3 transition-colors ${progress > 50 ? 'border-primary-600 bg-primary-600/10 text-primary-600' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
                <span className="material-symbols-outlined">military_tech</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black">Advanced</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3 transition-colors ${progress > 90 ? 'border-primary-600 bg-primary-600/10 text-primary-600' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
                <span className="material-symbols-outlined">verified</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black">Expert</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-8 md:mt-0">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            Resume Week {(activeWeekIdx + 1).toString().padStart(2, '0')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
