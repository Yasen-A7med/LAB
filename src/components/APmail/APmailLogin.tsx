import React, { useState } from 'react';
import { useAPmail } from './APmailContext';
import { Mail, Key, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, ExternalLink } from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export const APmailLogin: React.FC<Props> = ({ onBack }) => {
  const { login, isLoading } = useAPmail();
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !appPassword.trim()) {
      setError('Enter your Gmail address and 16-character App Password');
      return;
    }
    const res = await login(email.trim(), appPassword.trim());
    if (!res.success) {
      setError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc] dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="w-full max-w-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to LAB</span>
          </button>
        )}

        <div className="bg-white dark:bg-[#181a20] rounded-2xl p-7 shadow-xl border border-gray-200/80 dark:border-gray-800">
          {/* Minimal Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center p-2 mb-3 border border-gray-100 dark:border-gray-700">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M22.5 12c0-.75-.07-1.47-.2-2.17H12v4.11h5.89c-.25 1.37-1.02 2.53-2.17 3.3v2.74h3.51c2.05-1.89 3.27-4.67 3.27-7.98z" />
                <path fill="#34A853" d="M12 22.7c2.9 0 5.33-.96 7.11-2.61l-3.51-2.74c-.96.65-2.2 1.03-3.6 1.03-2.77 0-5.11-1.87-5.95-4.39H2.38v2.83C4.16 20.35 7.82 22.7 12 22.7z" />
                <path fill="#FBBC05" d="M6.05 13.99c-.21-.65-.34-1.34-.34-2.05s.13-1.4.34-2.05V7.06H2.38C1.65 8.52 1.23 10.2 1.23 12s.42 3.48 1.15 4.94l3.67-2.95z" />
                <path fill="#EA4335" d="M12 5.62c1.57 0 2.98.54 4.09 1.6l3.07-3.07C17.32 2.36 14.89 1.3 12 1.3 7.82 1.3 4.16 3.65 2.38 7.06l3.67 2.83c.84-2.52 3.18-4.39 5.95-4.39z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">APmail</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sign in with your Google App Password
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-[#22242a] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="16-character App Password"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm font-mono bg-gray-50 dark:bg-[#22242a] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 placeholder:font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                How to get App Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Concise 3-Step Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-base mb-1">Get an App Password</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Requires Google 2-Step Verification.</p>
            
            <ol className="text-xs space-y-3 mb-5">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                <span>Open Google Security at <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-blue-600">myaccount.google.com/apppasswords</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                <span>Enter app name (e.g. <strong>APmail</strong>) and click <strong>Create</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                <span>Copy the 16-letter code into APmail.</span>
              </li>
            </ol>

            <div className="flex items-center justify-between gap-2">
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Google Security</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
