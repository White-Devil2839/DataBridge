import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { validateEmail, validatePassword, validateRequired } from '../utils/validators';
import { cn } from '../utils/helpers';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) newErrors.email = emailResult.error;
    
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) newErrors.password = passwordResult.error;
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;
    
    setLoading(true);
    
    const result = await register(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    const result = validatePassword(password);
    
    const strengthColors = {
      weak: 'bg-danger-500',
      medium: 'bg-warning-500',
      strong: 'bg-success-500',
    };

    const strengthWidths = {
      weak: 'w-1/3',
      medium: 'w-2/3',
      strong: 'w-full',
    };

    return (
      <div className="mt-2">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              strengthColors[result.strength],
              strengthWidths[result.strength]
            )}
          />
        </div>
        <p className={cn(
          'text-xs mt-1 capitalize',
          result.strength === 'weak' && 'text-danger-400',
          result.strength === 'medium' && 'text-warning-400',
          result.strength === 'strong' && 'text-success-400',
        )}>
          {result.strength} password
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"
          style={{ animation: 'pulse 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          style={{ animation: 'pulse 10s ease-in-out infinite reverse' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-600/5 rounded-full blur-3xl"
          style={{ animation: 'pulse 12s ease-in-out infinite' }}
        />
      </div>

      {/* System status indicator */}
      <div className="absolute top-6 right-6 flex items-center gap-2 text-xs text-slate-500">
        <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
        System Operational
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 shadow-xl shadow-accent-500/20 mb-6"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            <span className="text-2xl font-bold text-white">D</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-slate-400 text-sm">
            A data orchestration layer for unreliable external APIs.
          </p>
        </div>

        {/* Register Card with float animation */}
        <div 
          className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        >
          {error && (
            <ErrorMessage 
              message={error} 
              className="mb-6"
              onDismiss={() => setError('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="Enter your email"
              required
              icon={({ className }) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              )}
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Create a password"
                required
                icon={({ className }) => (
                  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              />
              {getPasswordStrength()}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
              icon={({ className }) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full hover:shadow-lg hover:shadow-primary-500/20 transition-shadow"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Micro-Preview */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 px-1">
          {[
            'Connect external APIs in minutes',
            'Track data freshness & failures',
            'Schedule automatic syncs',
            'Export clean, normalized data',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
              <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </div>
          ))}
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-slate-600">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default Register;
