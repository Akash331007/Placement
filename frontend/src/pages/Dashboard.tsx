import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Sparkles, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  TrendingUp, 
  Layers, 
  Wrench, 
  Briefcase 
} from 'lucide-react';

interface DashboardStats {
  has_resume: boolean;
  resume_id?: number;
  ats_score: number;
  structure_score: number;
  keyword_score: number;
  formatting_score: number;
  readability_score: number;
  weak_sections: string[];
  skills_count: number;
  jobs_matched: number;
  history: Array<{ date: string; score: number }>;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get<DashboardStats>('/analysis/dashboard-stats');
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  // If no resume uploaded yet, render onboarding layout
  if (!stats || !stats.has_resume) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-12 py-12 px-6 glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary-600/10 blur-[80px]"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-600/10 blur-[80px]"></div>
        
        <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6 text-primary-500 animate-bounce-slow">
          <UploadCloud size={40} />
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white mb-3">Welcome to ResumeAI!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          Upload your resume in PDF or DOCX format to calculate your ATS Score, check keyword compatibility, and construct personalized learning roadmaps.
        </p>
        
        <Link 
          to="/upload" 
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
        >
          Upload Your Resume <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  // Dynamic colors for gauges
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 60) return 'text-yellow-500 stroke-yellow-500';
    return 'text-red-500 stroke-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const categoryScores = [
    { name: 'Structure', score: stats.structure_score, color: '#6366f1' },
    { name: 'Keywords', score: stats.keyword_score, color: '#a855f7' },
    { name: 'Formatting', score: stats.formatting_score, color: '#10b981' },
    { name: 'Readability', score: stats.readability_score, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome header with Sparks */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Analysis Hub</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time metrics for your parsed resume</p>
        </div>
        <Link 
          to="/upload" 
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <UploadCloud size={16} /> Re-upload Resume
        </Link>
      </div>

      {/* Grid: Top Score row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Circle Score Gauge Card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-6">ATS Score</span>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer Track */}
              <circle 
                cx="50" cy="50" r="42" 
                className="stroke-slate-200 dark:stroke-slate-800" 
                stroke-width="8" 
                fill="transparent" 
              />
              {/* Inner Progress */}
              <circle 
                cx="50" cy="50" r="42" 
                className={`transition-all duration-1000 ${getScoreColor(stats.ats_score)}`}
                stroke-width="8" 
                fill="transparent" 
                stroke-dasharray={`${2 * Math.PI * 42}`}
                stroke-dashoffset={`${2 * Math.PI * 42 * (1 - stats.ats_score / 100)}`}
                stroke-linecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white leading-none">{stats.ats_score}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">/ 100</span>
            </div>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold ${getScoreBg(stats.ats_score)}`}>
            {stats.ats_score >= 80 ? 'Optimized' : stats.ats_score >= 60 ? 'Needs Attention' : 'Not ATS Compatible'}
          </div>
        </div>

        {/* Quick Numbers Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-650 dark:text-primary-400 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div className="mt-8">
              <span className="text-2xl font-bold text-slate-800 dark:text-white block">{stats.skills_count}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Parsed Resume Skills</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-650 dark:text-purple-400 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div className="mt-8">
              <span className="text-2xl font-bold text-slate-800 dark:text-white block">{stats.jobs_matched}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Job Matches Found</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-650 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div className="mt-8">
              <span className="text-2xl font-bold text-slate-800 dark:text-white block">{stats.ats_score}%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Match Integrity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ATS score history area chart */}
        <div className="glass-card rounded-3xl p-6">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-6">Score Improvement Trend</span>
          <div className="h-64">
            {stats.history.length <= 1 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-450">
                Upload new resume edits to populate history chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category breakdown bar chart */}
        <div className="glass-card rounded-3xl p-6">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-6">Sub-component Scores</span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={36}>
                  {categoryScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Weak Areas & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weak sections list */}
        <div className="glass-card rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={18} className="text-yellow-500" />
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Identified Weak Areas</span>
          </div>
          
          {stats.weak_sections.length === 0 ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 text-xs">
              <CheckCircle size={16} />
              <span>Excellent! No formatting warnings or structural weaknesses detected.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.weak_sections.map((section, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-250/20 text-xs text-slate-700 dark:text-slate-350">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                  <span className="leading-normal">{section}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestion Highlights shortcuts */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Next Step suggestions</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Compare your current resume scores against custom job roles to view skill gaps and construct personalized learning lists.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link 
              to="/skill-gap" 
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 font-semibold"
            >
              <span>Analyze skill gaps</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            <Link 
              to="/roadmap" 
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 font-semibold border-t border-slate-100 dark:border-slate-800/40"
            >
              <span>View learning roadmap</span>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;
