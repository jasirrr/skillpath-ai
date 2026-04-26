"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Loader2, CheckCircle2, ChevronRight, Brain, Trophy } from 'lucide-react';
import { startAssessment, submitAnswer } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssessmentPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const skill = decodeURIComponent(params.skill as string);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const q = await startAssessment(sessionId, skill);
        setCurrentQuestion(q);
        setHistory([
          { type: 'ai', text: `Welcome to the assessment for ${skill}. I'll ask you 3 questions of increasing complexity. Let's start with a ${q.difficulty} one.` }, 
          { type: 'ai', text: q.question }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId && skill) init();
  }, [sessionId, skill]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async () => {
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    const userAnswer = answer;
    setAnswer('');
    setHistory((prev: any) => [...prev, { type: 'user', text: userAnswer }]);

    try {
      const result = await submitAnswer({
        session_id: sessionId,
        skill: skill,
        question: currentQuestion.question,
        answer: userAnswer,
        difficulty: currentQuestion.difficulty,
        question_index: currentQuestion.question_index
      });

      setHistory((prev: any) => [...prev, { type: 'ai', text: `Score: ${result.score}/10. ${result.feedback}` }]);

      if (result.is_complete) {
        setIsComplete(true);
        setFinalResult(result);
        setHistory((prev: any) => [...prev, { type: 'ai', text: `Assessment complete! Final Score: ${result.final_score}%. Rank: ${result.skill_level}.` }]);
      } else {
        setCurrentQuestion(result.next_question);
        setHistory((prev: any) => [...prev, 
          { type: 'ai', text: `Next question (${result.next_question.difficulty}):` }, 
          { type: 'ai', text: result.next_question.question }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
      <p className="text-slate-600 font-medium text-lg text-center">AI is preparing your first question...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{skill} Assessment</h2>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 w-8 rounded-full ${i <= (currentQuestion?.question_index || 3) ? 'bg-primary-500' : 'bg-slate-200'}`}
                />
              ))}
              <span className="text-xs text-slate-500 ml-2">Question {currentQuestion?.question_index || 3}/3</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => router.push(`/dashboard/${sessionId}`)}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          Exit Assessment
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-grow bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          <AnimatePresence initial={false}>
            {history.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: msg.type === 'ai' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.type === 'ai' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.type === 'ai' 
                    ? 'bg-white text-slate-800 border border-slate-100' 
                    : 'bg-primary-600 text-white shadow-primary-200'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          {isComplete ? (
            <div className="flex flex-col items-center py-6 space-y-4">
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="p-4 bg-amber-100 rounded-full border-4 border-amber-200"
              >
                <Trophy className="text-amber-600" size={60} />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="font-black text-3xl text-slate-900">{finalResult?.final_score}% Mastery</p>
                <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest">
                  Level: {finalResult?.skill_level}
                </div>
                <p className="text-sm text-slate-500 mt-4">Your profile has been updated with these results.</p>
              </div>
              <button 
                onClick={() => router.push(`/dashboard/${sessionId}`)}
                className="btn-primary px-12 py-4 text-lg"
              >
                Return to Dashboard
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <textarea 
                className="w-full px-5 py-4 pr-14 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-sm bg-slate-50 focus:bg-white"
                placeholder="Type your answer here..."
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button 
                onClick={handleSend}
                disabled={!answer.trim() || submitting}
                className={`absolute bottom-4 right-4 p-2.5 rounded-xl transition-all ${
                  answer.trim() && !submitting ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-center text-[10px] uppercase font-bold text-slate-400 gap-8 tracking-widest py-2">
        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500"/> Correctness</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-primary-500"/> Depth</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-indigo-500"/> Applicability</span>
      </div>
    </div>
  );
}
