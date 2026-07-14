import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  Sparkles, 
  Target, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileSearch,
  BookOpen
} from 'lucide-react';

export const Landing: React.FC = () => {
  const [activePreviewTab, setActivePreviewTab] = useState<'resume' | 'analysis'>('resume');

  const features = [
    {
      title: "ATS Compatibility Scoring",
      desc: "Our advanced algorithm evaluates formatting, keyword match, formatting, structure, and text density, returning an objective score from 0 to 100.",
      icon: Target,
      color: "text-primary-500 bg-primary-500/10"
    },
    {
      title: "AI Resume Parsing",
      desc: "Instantly extracts structure: name, email, skills, experience, certifications, and education from uploaded PDF or Word documents.",
      icon: FileSearch,
      color: "text-indigo-500 bg-indigo-500/10"
    },
    {
      title: "Detailed Suggestions",
      desc: "Receive page-by-page instructions. Optimize technical terms, rewrite achievements using metrics, and fix spelling or duplicate action verbs.",
      icon: Sparkles,
      color: "text-purple-500 bg-purple-500/10"
    },
    {
      title: "Role Match & Gap Analysis",
      desc: "Select targeted job titles (like Full Stack Dev or AI Engineer) to compare resume keywords and identify exactly what skills you lack.",
      icon: Compass,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Personal Learning Roadmap",
      desc: "Generates custom step-by-step learning schedules, recommends certifications, and suggests practical projects matching target role gaps.",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "Performance Tracking",
      desc: "Monitor your resume scoring improvements over time. Keep updating and upload new versions to ensure maximum reach.",
      icon: TrendingUp,
      color: "text-orange-500 bg-orange-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 overflow-x-hidden font-sans relative">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary-600/15 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute top-[400px] right-20 w-96 h-96 rounded-full bg-purple-600/10 blur-[130px] animate-float"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-emerald-600/10 blur-[120px]"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/40 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-650 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary-600/20">
            A
          </div>
          <span className="font-bold text-xl text-white tracking-tight">
            Resume<span className="text-primary-500">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2">
            Login
          </Link>
          <Link 
            to="/register" 
            className="text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/20 hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/40 border border-primary-500/30 text-primary-400 text-xs font-semibold mb-6 animate-pulse-slow">
            <Sparkles size={14} /> Powered by Advanced Gemini AI models
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            Create an Outstanding Resume That <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-450 via-purple-500 to-indigo-500">Beats the ATS</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your resume, find score compatibility, analyze formatting errors, compare target job gaps, and get visual learning roadmaps instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-650 hover:from-primary-500 hover:to-indigo-550 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-primary-950/20 hover:scale-[1.03] transition-all"
            >
              Analyze Your Resume Now <ArrowRight size={18} />
            </Link>
            <a 
              href="#preview" 
              className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-350 hover:text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-slate-850 transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Interactive App Preview Widget */}
        <div id="preview" className="max-w-5xl mx-auto mt-20 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-2xl relative">
          <div className="absolute -top-4 left-10 px-3 py-1 rounded bg-indigo-600 text-[10px] uppercase font-bold tracking-wider text-white">
            Feature Preview
          </div>
          
          {/* Tab Selector */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-xl mb-3 border-b border-slate-850/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActivePreviewTab('resume')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activePreviewTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                1. Upload File
              </button>
              <button 
                onClick={() => setActivePreviewTab('analysis')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activePreviewTab === 'analysis' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                2. Score Analysis
              </button>
            </div>
          </div>

          {/* Interactive Tab Contents */}
          <div className="bg-slate-950/30 rounded-xl p-6 min-h-[350px] flex items-center justify-center text-left">
            {activePreviewTab === 'resume' ? (
              <div className="text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-primary-950/40 border border-primary-500/25 flex items-center justify-center mx-auto mb-4 text-primary-550 animate-bounce-slow">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Drag and drop your resume</h3>
                <p className="text-xs text-slate-500 mb-6">Supports PDF and DOCX files up to 5MB</p>
                <button 
                  onClick={() => setActivePreviewTab('analysis')}
                  className="bg-primary-650 hover:bg-primary-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-colors"
                >
                  Simulate Upload & Analysis
                </button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Column */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2">ATS Score</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-emerald-500 text-gradient-primary">82</span>
                      <span className="text-slate-500 text-sm">/ 100</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-primary-500 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  <div className="mt-6 text-xs text-slate-400">
                    <CheckCircle2 size={14} className="text-emerald-500 inline mr-2 align-text-bottom" /> Excellent formatting & structure.
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-850 md:col-span-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-3">Key Highlights</span>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3 text-xs leading-relaxed">
                      <span className="text-red-500 font-bold">MISSING:</span>
                      <div>
                        <p className="text-slate-300 font-semibold">Docker, CI/CD Pipeline</p>
                        <p className="text-slate-500 text-[11px]">Required keywords matching 84% of senior developer listings.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs leading-relaxed border-t border-slate-850 pt-3">
                      <span className="text-yellow-500 font-bold">WEAKNESS:</span>
                      <div>
                        <p className="text-slate-300 font-semibold">Lack of metrics in experience listings</p>
                        <p className="text-slate-500 text-[11px]">Convert descriptions to quantified achievements (e.g. 'Reduced load times by 30%').</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs leading-relaxed border-t border-slate-850 pt-3">
                      <span className="text-emerald-500 font-bold">STRENGTH:</span>
                      <div>
                        <p className="text-slate-300 font-semibold">Perfect chronological order & contact layout</p>
                        <p className="text-slate-500 text-[11px]">All sections parsed correctly with high-fidelity formatting.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">Complete AI Professional Package</h2>
          <p className="text-slate-450 leading-relaxed text-sm">Everything you need to bypass filters, structure qualifications, and find your next role.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-850 hover:border-slate-800 transition-all group hover:scale-[1.01]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${feat.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-primary-400 transition-colors">{feat.title}</h3>
                <p className="text-sm text-slate-450 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 mb-24 text-center bg-gradient-to-b from-primary-950/20 to-slate-950 rounded-3xl border border-primary-500/10 relative z-10 overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary-600/10 blur-[80px]"></div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to accelerate your career?</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">Join thousands of job seekers who have improved their ATS scores and landed interviews at top tech companies.</p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-white text-slate-950 hover:bg-slate-100 font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl hover:scale-[1.02]"
          >
            Create Your Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 text-center text-slate-500 text-xs relative z-10">
        <p>&copy; {new Date().getFullYear()} ResumeAI. Made with Gemini LLM models.</p>
      </footer>
    </div>
  );
};
export default Landing;
