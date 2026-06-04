import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, AlertCircle, ArrowRight, Settings } from 'lucide-react';
import ServerSettingsModal from '../components/ServerSettingsModal';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gym-dark px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-gym-card border border-gym-border/40 p-8 rounded-2xl shadow-xl relative">
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-4 right-4 text-gym-text-secondary hover:text-gym-text-primary hover:bg-gym-dark/55 p-2 rounded-xl border border-transparent hover:border-gym-border/60 transition duration-200 cursor-pointer"
          title="Server Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
          <div className="bg-gym-accent/15 p-3 rounded-full border border-gym-accent/30 text-gym-accent mb-3 flex items-center justify-center">
            <Zap className="h-8 w-8 text-gym-accent fill-gym-accent" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gym-text-primary">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gym-text-secondary">
            Keep your streak alive. Sign in to your account.
          </p>
        </div>

        {formError && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg text-rose-500 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gym-text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-text-secondary">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary placeholder-gym-text-secondary/50 focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition duration-200 text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gym-text-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-text-secondary">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary placeholder-gym-text-secondary/50 focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition duration-200 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-gym-dark bg-gym-accent hover:bg-gym-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gym-dark focus:ring-gym-accent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gym-dark border-t-transparent"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gym-text-secondary">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-gym-accent hover:underline transition duration-200"
            >
              Register Here
            </Link>
          </p>
        </div>
      </div>
      <ServerSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Login;
