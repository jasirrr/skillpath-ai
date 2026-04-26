"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Briefcase, ArrowRight, Loader2, TrendingUp, Zap, CheckCircle, BrainCircuit } from 'lucide-react';
import { uploadResume } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const steps = [
    "Extracting core resume keywords...",
    "Parsing job description requirements...",
    "Identifying technical & soft skill gaps...",
    "Calculating knowledge proximity for adjacent skills...",
    "Tailoring your 4-week accelerated roadmap..."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!file && !jd) return;

    setLoading(true);
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    const formData = new FormData();
    if (file) formData.append('resume', file);
    formData.append('jd_text', jd);
    formData.append('user_id', user.id);

    try {
      const data = await uploadResume(formData);
      setTimeout(() => {
        clearInterval(interval);
        router.push(`/dashboard/${data.id}`);
      }, 1000);
    } catch (error) {
      clearInterval(interval);
      console.error("Upload failed", error);
      alert("Something went wrong. Please check your backend connection.");
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    const formData = new FormData();
    formData.append('resume_text', 'Full Stack Developer with 5 years of experience in React, Node.js, and Python. Worked on various scalable web applications and cloud infrastructure.');
    formData.append('jd_text', 'Senior Software Engineer role requiring expertise in Python, React, and system design. Experience with AI integrations is a plus.');
    formData.append('user_id', user.id);

    try {
      const data = await uploadResume(formData);
      setTimeout(() => {
        clearInterval(interval);
        router.push(`/dashboard/${data.id}`);
      }, 1000);
    } catch (error) {
      clearInterval(interval);
      console.error("Demo failed", error);
      alert("Something went wrong. Please check your backend connection.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-fade-in py-12 relative">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center space-y-12"
          >
            <div className="relative w-24 h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-slate-100 border-t-primary-600 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="text-primary-600 w-10 h-10" />
              </div>
            </div>

            <div className="space-y-6 w-full max-w-md px-6">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: i <= currentStep ? 1 : 0.3, 
                    x: 0,
                    scale: i === currentStep ? 1.05 : 1
                  }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    i < currentStep ? 'bg-primary-600 border-primary-600' : 
                    i === currentStep ? 'border-primary-600' : 'border-slate-200'
                  }`}>
                    {i < currentStep && <CheckCircle className="text-white w-4 h-4" />}
                    {i === currentStep && <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${
                    i <= currentStep ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="text-center space-y-2">
              <p className="text-primary-600 font-black tracking-widest uppercase text-xs animate-pulse">
                AI Reasoning in Progress
              </p>
              <p className="text-slate-400 text-sm italic">This usually takes about 10 seconds...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight"
        >
          Supercharge Your <span className="text-primary-600">Career Path</span>
        </motion.h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload your resume and job description. Our AI will analyze your gaps and guide you through a personalized skill assessment.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resume Upload */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="card flex flex-col items-center justify-center space-y-6 text-center border-dashed border-2 border-primary-200 bg-primary-50/30"
        >
          <div className="p-4 bg-primary-50 rounded-full">
            <Upload className="text-primary-600 w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Resume</h3>
            <p className="text-sm text-slate-500">Upload your PDF or Text resume</p>
          </div>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden" 
            id="resume-upload" 
          />
          <label 
            htmlFor="resume-upload" 
            className="btn-secondary w-full cursor-pointer hover:border-primary-300"
          >
            {file ? file.name : "Select File"}
          </label>
        </motion.div>

        {/* Job Description Input */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="card flex flex-col space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Briefcase className="text-indigo-600 w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Job Description</h3>
          </div>
          <textarea 
            placeholder="Paste the job description here..."
            className="input-field h-40 resize-none text-sm bg-slate-50 focus:bg-white"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          ></textarea>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button 
          onClick={handleSubmit}
          disabled={loading || (!file && !jd)}
          className={`btn-primary w-full md:w-auto px-12 py-4 text-lg font-bold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              AI is Analyzing...
            </>
          ) : user ? (
            <>
              Start Analysis
              <ArrowRight size={20} />
            </>
          ) : (
            <>
              Login to Analyze
              <ArrowRight size={20} />
            </>
          )}
        </button>

        <button 
          onClick={handleDemo}
          disabled={loading}
          className="btn-secondary w-full md:w-auto px-12 py-4 text-lg font-bold border-2 border-primary-100 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="text-amber-500 fill-amber-500" size={20} />
          Try a Quick Demo
        </button>
      </div>

      {/* Trust Badges / Stats */}
      <div className="grid grid-cols-3 gap-4 pt-12 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">10k+</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Skills Mapped</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">98%</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">AI Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">GPT-4o</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Powered Logic</div>
        </div>
      </div>
    </div>
  );
}
