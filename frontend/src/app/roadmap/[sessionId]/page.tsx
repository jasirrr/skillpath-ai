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

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-24 py-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push(`/dashboard/${sessionId}`)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="flex gap-3">
          <div className="hidden md:flex items-center gap-4 bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</div>
              <div className="text-lg font-black text-primary-600">{progress}%</div>
            </div>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-50 text-primary-700 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
          <Calendar size={16} />
          4-Week Accelerated Plan
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">Your Learning Roadmap</h1>
        <p className="text-slate-600 text-lg">Specifically tailored for: <span className="font-bold text-slate-900 text-primary-700 uppercase">{data.target_role}</span></p>
      </div>

      <div className="space-y-12 relative mt-16">
        <div className="absolute left-[39px] top-4 bottom-4 w-1 bg-slate-100 hidden md:block rounded-full" />

        {data.weeks?.map((weekData: any, idx: number) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex flex-col md:flex-row gap-8 relative ${weekData.is_completed ? 'opacity-80' : ''}`}
          >
            <div className="md:w-20 flex-shrink-0 flex md:flex-col items-center justify-center z-10">
              <div className={`w-20 h-20 bg-white border-4 ${weekData.is_completed ? 'border-emerald-500' : 'border-primary-500'} rounded-3xl flex flex-col items-center justify-center shadow-xl transition-colors`}>
                {weekData.is_completed ? (
                  <CheckCircle className="text-emerald-500 w-10 h-10" />
                ) : (
                  <>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Week</span>
                    <span className="text-4xl font-black text-primary-600 leading-none">{weekData.week}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-grow space-y-6">
              <div className={`px-4 py-2 rounded-lg inline-block text-xs font-bold uppercase tracking-widest ${weekData.is_completed ? 'bg-emerald-50 text-emerald-700' : 'bg-primary-50 text-primary-700'}`}>
                {weekData.is_completed ? 'Week Completed ✅' : `Sprint Goal: ${weekData.sprint_goal}`}
              </div>

              {weekData.topics?.map((topic: any, tIdx: number) => (
                <div key={tIdx} className={`card hover:border-primary-300 transition-all group bg-white shadow-sm border-slate-100 ${topic.is_completed ? 'border-emerald-100 bg-emerald-50/10' : ''}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h3 className={`text-2xl font-black flex items-center gap-3 transition-colors ${topic.is_completed ? 'text-emerald-700' : 'text-slate-900'}`}>
                      <span className={`w-2 h-8 rounded-full transition-colors ${topic.is_completed ? 'bg-emerald-500' : 'bg-primary-500'}`} />
                      {topic.name}
                    </h3>
                    <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                      Est: {topic.time_to_mastery}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <CheckCircle className={topic.is_completed ? 'text-emerald-500' : 'text-slate-300'} size={18} />
                        Actionable Tasks
                      </h4>
                      <ul className="space-y-3">
                        {topic.tasks?.map((task: string, i: number) => {
                          const isDone = topic.completed_tasks?.includes(task);
                          return (
                            <li 
                              key={i} 
                              className={`text-sm flex items-start gap-3 p-2 rounded-xl transition-all cursor-pointer hover:bg-slate-50 ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                              onClick={() => handleToggleTask(weekData.week, tIdx, task)}
                            >
                              <div className={`w-5 h-5 rounded-md border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                                {isDone && <CheckCircle size={14} className="text-white" />}
                                {toggling === `${weekData.week}-${tIdx}-${task}` && <Loader2 size={12} className="animate-spin text-primary-500" />}
                              </div>
                              {task}
                            </li>
                          );
                        })}
                      </ul>
                      <div className="pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outcome</p>
                        <p className="text-sm font-medium text-slate-700 italic">"{topic.outcome}"</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <ExternalLink className="text-primary-500" size={18} />
                        Curated Resources
                      </h4>
                      <div className="space-y-3">
                        {topic.recommended_resources?.map((res: any, i: number) => (
                          <a 
                            key={i} 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group/res hover:bg-white hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer block"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{res.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{res.type}</span>
                            </div>
                            <ExternalLink size={14} className="text-slate-300 group-hover/res:text-primary-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="card bg-slate-900 border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl"
      >
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black text-white">Module Completion Streak</h3>
          <p className="text-slate-400 text-sm">
            Keep checking off tasks to reach <span className="text-primary-400 font-bold">100% Mastery</span> and unlock your certificate.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
             <div className="text-3xl font-black text-primary-500">{progress}%</div>
             <div className="text-[10px] font-black text-slate-500 uppercase">Mastery</div>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-primary bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 font-black uppercase text-xs"
          >
            Keep Learning
          </button>
        </div>
      </motion.div>
    </div>
  );
}
