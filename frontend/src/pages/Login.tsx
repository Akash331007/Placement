import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Key, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, googleLogin, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery States
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // Mock google login payload
      await googleLogin({
        email: 'google.candidate@example.com',
        name: 'Google Candidate'
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setInfoMessage(`Reset instructions sent! Copy your recovery token: ${res.reset_token}`);
      setResetToken(res.reset_token);
      setMode('reset');
    } catch (err: any) {
      setError(err.message || 'ForgotPassword request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      await resetPassword({
        email,
        token: resetToken,
        new_password: newPassword
      });
      setInfoMessage('Password reset successful! You can now log in.');
      setMode('login');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex items-center justify-center p-6 bg-grid relative">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary-600/10 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-indigo-650/15 blur-[120px]"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary-650/30 mb-3">
            A
          </div>
          <span className="font-bold text-xl text-white">
            Resume<span className="text-primary-500">AI</span>
          </span>
          <p className="text-xs text-slate-500 mt-1">AI-Powered Resume ATS Optimization</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs mb-5">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs mb-5 leading-normal">
            {infoMessage}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  required
                  className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => setMode('forgot')}
                  className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-650 to-indigo-650 hover:from-primary-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Recover Password</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Enter your email and we'll supply a verification token to reset your password.</p>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  required
                  className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all text-sm mt-2"
            >
              {loading ? 'Sending...' : 'Send Recovery Token'}
            </button>

            <button 
              type="button" 
              onClick={() => setMode('login')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-350 mt-2 font-medium"
            >
              Back to Login
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Reset Password</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Recovery Token</label>
              <input 
                type="text" 
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste mock reset token here" 
                required
                className="w-full glass-input text-sm py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full glass-input text-sm py-2.5"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all text-sm mt-2"
            >
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        )}

        {mode === 'login' && (
          <>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-dark-950 px-3 text-slate-500 font-bold">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-all text-xs inline-flex items-center justify-center gap-2"
            >
              {/* Simple inline Google SVG Icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google Sign-In
            </button>
          </>
        )}

        <div className="text-center text-xs text-slate-500 mt-8 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:underline font-bold">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
