import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, 
  BookOpen, 
  Wrench, 
  Briefcase, 
  Award, 
  Globe,
  Sparkles,
  AlertCircle,
  HelpCircle,
  FolderDot,
  CheckCircle
} from 'lucide-react';

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  education: Array<{ degree: string; institution: string; year: string }>;
  skills: string[];
  projects: Array<{ title: string; description: string; technologies: string[] }>;
  certifications: string[];
  experience: Array<{ role: string; company: string; duration: string; description: string }>;
  languages: string[];
}

interface AnalysisResults {
  ats_score: number;
  structure_score: number;
  keyword_score: number;
  formatting_score: number;
  missing_skills: string[];
  weak_sections: string[];
  repeated_words: string[];
  grammar_issues: string[];
  missing_keywords: string[];
  suggestions: {
    summary: string;
    projects: string;
    skills: string;
    experience: string;
    achievements: string;
    keywords: string;
  };
}

export const ResumeAnalysis: React.FC = () => {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeResumeTab, setActiveResumeTab] = useState<'details' | 'experience' | 'projects'>('details');

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const fetchLatestAnalysis = async () => {
    try {
      // 1. Get latest analysis
      const analysisData = await api.get<AnalysisResults>('/analysis/latest');
      setAnalysis(analysisData);
      
      // 2. Fetch the corresponding resume to show details
      const resumeId = (analysisData as any).resume_id;
      if (resumeId) {
        const resumeData = await api.get(`/resumes/${resumeId}`);
        setResume(resumeData.parsed_json);
      }
    } catch (err) {
      console.error("Error loading resume analysis details:", err);
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
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No Analysis Available</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">Please upload a resume first to view parsing results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resume Analysis</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review extracted resume components alongside AI-powered optimizations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Pane: Parsed Resume Structure */}
        <div className="lg:col-span-7 glass-card rounded-3xl overflow-hidden flex flex-col min-h-[550px]">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 px-4 pt-3 gap-2">
            <button 
              onClick={() => setActiveResumeTab('details')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x border-transparent transition-all ${
                activeResumeTab === 'details' 
                  ? 'bg-white dark:bg-slate-900 text-primary-650 border-slate-200 dark:border-slate-800' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              General Profile
            </button>
            <button 
              onClick={() => setActiveResumeTab('experience')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x border-transparent transition-all ${
                activeResumeTab === 'experience' 
                  ? 'bg-white dark:bg-slate-900 text-primary-650 border-slate-200 dark:border-slate-800' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Experience & Education
            </button>
            <button 
              onClick={() => setActiveResumeTab('projects')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x border-transparent transition-all ${
                activeResumeTab === 'projects' 
                  ? 'bg-white dark:bg-slate-900 text-primary-650 border-slate-200 dark:border-slate-800' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Projects & Certifications
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 flex-grow bg-white dark:bg-slate-900/40">
            {resume ? (
              <>
                {/* Details Tab */}
                {activeResumeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Full Name</span>
                      <h3 className="text-lg font-bold text-slate-850 dark:text-white">{resume.name || 'Candidate Name'}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Email Address</span>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">{resume.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Phone Number</span>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">{resume.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench size={16} className="text-primary-500" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills Extracted</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills && resume.skills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-300 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {resume.languages && resume.languages.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Globe size={16} className="text-indigo-500" />
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Languages</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {resume.languages.map((lang, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 font-medium border border-indigo-200/20">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience & Education Tab */}
                {activeResumeTab === 'experience' && (
                  <div className="space-y-6">
                    {/* Experience list */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={16} className="text-primary-500" />
                        <span className="text-xs font-bold text-slate-550 uppercase tracking-wider">Professional Experience</span>
                      </div>
                      {resume.experience && resume.experience.length > 0 ? (
                        <div className="space-y-4">
                          {resume.experience.map((exp, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                              <h4 className="text-sm font-bold text-slate-850 dark:text-white">{exp.role}</h4>
                              <p className="text-xs text-primary-600 font-semibold mt-0.5">{exp.company} | {exp.duration}</p>
                              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No experience records parsed.</p>
                      )}
                    </div>

                    {/* Education list */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-slate-550 uppercase tracking-wider">Education</span>
                      </div>
                      {resume.education && resume.education.length > 0 ? (
                        <div className="space-y-4">
                          {resume.education.map((edu, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                              <h4 className="text-sm font-bold text-slate-850 dark:text-white">{edu.degree}</h4>
                              <p className="text-xs text-emerald-600 font-semibold mt-0.5">{edu.institution} | {edu.year}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No education records parsed.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects & Certifications Tab */}
                {activeResumeTab === 'projects' && (
                  <div className="space-y-6">
                    {/* Projects */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <FolderDot size={16} className="text-purple-500" />
                        <span className="text-xs font-bold text-slate-550 uppercase tracking-wider">Key Projects</span>
                      </div>
                      {resume.projects && resume.projects.length > 0 ? (
                        <div className="space-y-4">
                          {resume.projects.map((proj, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                              <h4 className="text-sm font-bold text-slate-850 dark:text-white">{proj.title}</h4>
                              <p className="text-xs text-slate-500 mt-2 leading-relaxed mb-3">{proj.description}</p>
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {proj.technologies.map((t, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No projects parsed.</p>
                      )}
                    </div>

                    {/* Certifications */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Award size={16} className="text-orange-500" />
                        <span className="text-xs font-bold text-slate-550 uppercase tracking-wider">Certifications</span>
                      </div>
                      {resume.certifications && resume.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {resume.certifications.map((cert, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-xl border border-orange-250/20 bg-orange-50/30 dark:bg-orange-950/10 text-xs font-semibold text-slate-700 dark:text-orange-300">
                              {cert}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No certifications parsed.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">No parsed data structure found.</div>
            )}
          </div>
        </div>

        {/* Right Pane: AI Analysis & Suggestions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Key Score Checks */}
          <div className="glass-card rounded-3xl p-6">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-4">ATS Checks Summary</span>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">Formatting Strength</span>
                <span className="text-xs font-bold text-emerald-500">{analysis.formatting_score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">Keyword Density</span>
                <span className="text-xs font-bold text-indigo-500">{analysis.keyword_score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">Structural Layout</span>
                <span className="text-xs font-bold text-purple-500">{analysis.structure_score}%</span>
              </div>
            </div>
          </div>

          {/* Grammar & Repeated words issues */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-yellow-500" />
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Style & Quality Reviews</span>
            </div>
            
            <div className="space-y-4">
              {/* Repeated words */}
              {analysis.repeated_words && analysis.repeated_words.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Repeated Verbs / Words</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.repeated_words.map((word, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 text-[10px] font-semibold">
                        {word}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">Vary your choice of verbs to make accomplishments sound fresh and independent.</p>
                </div>
              )}

              {/* Grammar / Bullet recommendations */}
              {analysis.grammar_issues && analysis.grammar_issues.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Structure Suggestions</span>
                  <div className="space-y-2">
                    {analysis.grammar_issues.map((issue, idx) => (
                      <p key={idx} className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/30">
                        {issue}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Page Suggestions details */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Deep AI Optimizations</span>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {analysis.suggestions.summary && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">Professional Summary</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{analysis.suggestions.summary}</p>
                </div>
              )}
              {analysis.suggestions.experience && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border-t border-slate-100 dark:border-slate-800/40">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">Work Bullet Points</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{analysis.suggestions.experience}</p>
                </div>
              )}
              {analysis.suggestions.achievements && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border-t border-slate-100 dark:border-slate-800/40">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">Measurable Achievements</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{analysis.suggestions.achievements}</p>
                </div>
              )}
              {analysis.suggestions.projects && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border-t border-slate-100 dark:border-slate-800/40">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">Projects Optimization</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{analysis.suggestions.projects}</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default ResumeAnalysis;
