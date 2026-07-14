import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, FileText, CheckCircle, AlertCircle, FileCode } from 'lucide-react';

export const UploadResume: React.FC = () => {
  const navigate = useNavigate();
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Only PDF and DOCX file types are supported.');
      setFile(null);
      return;
    }
    // Limit to 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setProgress(15);
    
    // Simulate upload stages
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 400);

    try {
      await api.upload('/resumes/upload', file);
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to parse the file. Please try another copy.');
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Upload Resume</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload your details to begin analyzing ATS compatibility</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs mb-5">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/45 text-emerald-450 text-xs mb-5 font-semibold">
          <CheckCircle size={18} />
          <span>Upload complete! Generating ATS dashboard...</span>
        </div>
      )}

      {/* Drag & Drop Card */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`glass-card rounded-3xl p-8 border-2 border-dashed text-center transition-all ${
          dragActive 
            ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-950/10' 
            : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
        }`}
      >
        <input 
          ref={inputRef}
          type="file" 
          onChange={handleChange}
          accept=".pdf,.docx" 
          className="hidden"
        />

        {file ? (
          <div className="py-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center mx-auto mb-4 text-indigo-500">
              <FileText size={32} />
            </div>
            <p className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-xs mx-auto">{file.name}</p>
            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            
            {!loading && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button 
                  onClick={() => setFile(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Change File
                </button>
                <button 
                  onClick={handleUpload}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 cursor-pointer" onClick={() => inputRef.current?.click()}>
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4 text-primary-550">
              <UploadCloud size={32} />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Drag and drop file here</h3>
            <p className="text-xs text-slate-500 dark:text-slate-405">or click to browse from folders</p>
            <span className="inline-block border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 mt-6 bg-slate-50 dark:bg-slate-900/40">
              PDF or DOCX (max 5MB)
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>{progress < 100 ? 'Parsing document content...' : 'Finalizing analysis...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-350"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadResume;
