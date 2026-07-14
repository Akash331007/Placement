import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Key, 
  FileCheck,
  BookOpen,
  
} from 'lucide-react';

interface AnalysisResults {
  ats_score: number;
  structure_score: number;
  keyword_score: number;
  formatting_score: number;
  readability_score?: number; // fallback to 70 if missing
  missing_keywords: string[];
  weak_sections: string[];
}

export const ATSScore: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const fetchLatestAnalysis = async () => {
    try {
      const data = await api.get<AnalysisResults>('/analysis/latest');
      setAnalysis(data);
    } catch (err) {
      console.error("Error fetching ATS Score details:", err);
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

  if (!analysis) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={40} className="text-slate-400 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No ATS Score Data Available</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">Please upload your resume to generate scoring parameters.</p>
      </div>
    );
  }

  const readability = analysis.readability_score ?? 75;

  const scoreMetrics = [
    { 
      name: 'Resume Structure', 
      desc: 'Checks if sections like Experience, Education, and Skills exist.', 
      score: analysis.structure_score, 
      icon: Layers, 
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25',
      barColor: 'bg-indigo-500'
    },
      { 
      name: 'Keyword Overlap', 
      desc: 'Evaluates compatibility with modern technology keywords.', 
      score: analysis.keyword_score, 
      icon: Key, 
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/25',
      barColor: 'bg-purple-500'
    },
    { 
      name: 'Formatting Rules', 
      desc: 'Checks for contact information placeholders and proper spacing.', 
      score: analysis.formatting_score, 
      icon: FileCheck, 
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
      barColor: 'bg-emerald-500'
    },
    { 
      name: 'Readability Index', 
      desc: 'Analyzes paragraphs length and overall word density limits.', 
      score: readability, 
      icon: BookOpen, 
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/25',
      barColor: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ATS Score Details</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detailed sub-component breakdown of your resume compatibility</p>
      </div>

      {/* Main Gauge & Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Animated circle gauge card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-6">Overall Compatibility</span>
          <div className="relative w-44 h-44 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="stroke-slate-200 dark:stroke-slate-800" stroke-width="7" fill="transparent" />
              <circle 
                cx="50" cy="50" r="42" 
                stroke-width="7" fill="transparent" 
                className={`transition-all duration-1000 ${
                  analysis.ats_score >= 80 ? 'stroke-emerald-500' : analysis.ats_score >= 60 ? 'stroke-yellow-500' : 'stroke-red-500'
                }`}
                stroke-dasharray={`${2 * Math.PI * 42}`}
                stroke-dashoffset={`${2 * Math.PI * 42 * (1 - analysis.ats_score / 100)}`}
                stroke-linecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-slate-800 dark:text-white leading-none">{analysis.ats_score}</span>
              <span className="text-[10px] text-slate-450 font-bold uppercase mt-1">/ 100</span>
            </div>
          </div>
          <p className="text-xs text-slate-550 leading-relaxed max-w-[180px] mx-auto mt-2">
            Based on structural validation, keyword densities, and parsing standards.
          </p>
        </div>

        {/* Sub-component list */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-4">Core Components</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {scoreMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.name} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/10">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${metric.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{metric.name}</h4>
                      <span className="text-[10px] text-slate-450 leading-none">{metric.score}% Match</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div className={`h-full rounded-full ${metric.barColor}`} style={{ width: `${metric.score}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-405 leading-normal">{metric.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Missing Keywords & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Missing Keywords list */}
        <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
            <Key size={16} className="text-purple-500" />
            <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">Missing Industry Keywords</span>
          </div>
          
          {analysis.missing_keywords && analysis.missing_keywords.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs">
              <CheckCircle size={16} />
              <span>Full keyword density alignment matched!</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-550 mb-3">Adding these keywords helps your resume bypass automated filter templates:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 font-semibold border border-purple-200/10">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Improvement Action Checklist */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">Action Improvement checklist</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">1</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Optimize Job Title Matches</p>
                <p className="text-slate-500 mt-0.5">Use the Skill Gap tab to compare required target skills.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">2</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Convert achievements to numbers</p>
                <p className="text-slate-500 mt-0.5">Rewrite experience bullet points using percentages, hours saved, or counts.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default ATSScore;
