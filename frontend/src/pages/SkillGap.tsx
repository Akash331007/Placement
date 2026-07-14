import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Target, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  ChevronRight 
} from 'lucide-react';

interface JobRole {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
}

interface SkillGapResult {
  id: number;
  target_role: string;
  current_skills: string[];
  missing_skills: string[];
  suggested_skills: string[];
  priority_order: string[];
}

interface AnalysisBrief {
  id: number;
  ats_score: number;
  resume_id: number;
}

export const SkillGap: React.FC = () => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisBrief | null>(null);
  
  const [gapResult, setGapResult] = useState<SkillGapResult | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Get supported job roles
      const rolesData = await api.get<JobRole[]>('/jobs/roles');
      setRoles(rolesData);
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0].title);
      }

      // 2. Get user's latest analysis record
      const analysisData = await api.get<AnalysisBrief>('/analysis/latest');
      setLatestAnalysis(analysisData);
    } catch (err: any) {
      console.error("Failed to load initial data for Skill Gap:", err);
      setError("Please ensure you have uploaded a resume before running the skill gap analysis.");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!latestAnalysis || !selectedRole) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<SkillGapResult>('/jobs/skill-gap', {
        analysis_id: latestAnalysis.id,
        target_role: selectedRole
      });
      setGapResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute skill gap comparison.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  // Visual Graph data calculation
  const getGraphData = () => {
    if (!gapResult) return [];
    const total = gapResult.current_skills.length + gapResult.missing_skills.length;
    if (total === 0) return [];
    
    return [
      { name: 'Matched Skills', value: gapResult.current_skills.length, percentage: Math.round((gapResult.current_skills.length / total) * 100), color: '#10b981' },
      { name: 'Missing Gaps', value: gapResult.missing_skills.length, percentage: Math.round((gapResult.missing_skills.length / total) * 100), color: '#ef4444' }
    ];
  };

  const graphData = getGraphData();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Skill Gap Analysis</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select targeted roles to check matching competencies and skill requirements</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs mb-5">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Select Box Block */}
      <div className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Target Job Role</label>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={!latestAnalysis}
            className="w-full glass-input text-sm text-slate-700 dark:text-slate-200 py-3"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.title} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-white">{role.title}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleRunAnalysis}
          disabled={submitting || !latestAnalysis}
          className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 text-sm whitespace-nowrap"
        >
          {submitting ? 'Comparing Profile...' : 'Analyze Skill Gap'}
        </button>
      </div>

      {gapResult && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch animate-float-quick">
          
          {/* Overlap Summary Card & Chart */}
          <div className="glass-card rounded-3xl p-6 md:col-span-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-4">Competency Fit</span>
              <div className="text-center py-4">
                <span className="text-5xl font-black text-emerald-500">
                  {Math.round((gapResult.current_skills.length / (gapResult.current_skills.length + gapResult.missing_skills.length || 1)) * 100)}%
                </span>
                <p className="text-xs text-slate-400 mt-2 font-medium">Match Score for {gapResult.target_role}</p>
              </div>
            </div>
            
            <div className="h-32 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                  <Bar dataKey="percentage" radius={4} barSize={12}>
                    {graphData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Matches & Missing Skills split */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Matches list */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-455">
                <CheckCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Matching Skills ({gapResult.current_skills.length})</span>
              </div>
              {gapResult.current_skills.length === 0 ? (
                <p className="text-xs text-slate-400">No matching skills found in resume.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {gapResult.current_skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border border-emerald-250/10 font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing list */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4 text-red-500">
                <XCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Missing Skill Gaps ({gapResult.missing_skills.length})</span>
              </div>
              {gapResult.missing_skills.length === 0 ? (
                <p className="text-xs text-emerald-600 font-bold">Awesome! You possess all required technical skills for this role.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {gapResult.missing_skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-200/10 font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Priority Learning Roadmap block */}
          {gapResult.priority_order && gapResult.priority_order.length > 0 && (
            <div className="glass-card rounded-3xl p-6 md:col-span-12">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-indigo-500" />
                <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">Priority Upskilling Order</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Focus on learning these concepts in sequence to maximize your role compatibility index:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {gapResult.priority_order.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 flex-1">
                    <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-650 text-[10px] font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
export default SkillGap;
