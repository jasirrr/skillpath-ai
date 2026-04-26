"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Loader2, MessageSquare, ArrowLeft, User, Bot } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setHistory([
      { type: 'ai', text: "Hello! I've analyzed your resume against the job description. I can help you understand your skill gaps, suggest how to frame your experience, or give you advice on your learning journey. What's on your mind?" }
    ]);
  }, [user, authLoading, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    setHistory(prev => [...prev, { type: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', userMsg);
      const response = await api.post(`/chat/${sessionId}`, formData);
      setHistory(prev => [...prev, { type: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("Chat failed", error);
      setHistory(prev => [...prev, { type: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-150px)] flex flex-col space-y-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Career Coach AI</h2>
            <p className="text-xs text-slate-500">Knows your resume, JD, and gaps</p>
          </div>
        </div>
        <button 
          onClick={() => router.push(`/dashboard/${sessionId}`)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-grow bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/20">
          <AnimatePresence initial={false}>
            {history.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.type === 'ai' ? 'justify-start' : 'justify-end'} gap-3`}
              >
                {msg.type === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.type === 'ai' 
                    ? 'bg-white text-slate-800 border border-slate-100 shadow-sm' 
                    : 'bg-indigo-600 text-white shadow-indigo-100'
                }`}>
                  {msg.text}
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative">
            <textarea 
              className="w-full px-6 py-4 pr-16 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm bg-slate-50 focus:bg-white"
              placeholder="Ask anything about your profile or the JD..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button 
              onClick={handleSend}
              disabled={!message.trim() || loading}
              className={`absolute bottom-3.5 right-3.5 p-2.5 rounded-xl transition-all ${
                message.trim() && !loading ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
