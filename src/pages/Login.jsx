import { useState } from 'react';
import './login.css';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  
  const handleLogin = (e) => {
    e.preventDefault();
    login({ email });
  };
  
  return (
    <div className="login-container">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-shape"></div>
          </div>
          <h1>Welcome to Vaultly</h1>
          <p>Sign in to your admin dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vaultly.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            <span>Sign In</span>
            <ArrowRight size={18} className="btn-icon" />
          </button>
        </form>
      </div>
      
      {/* Decorative background elements */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
    </div>
  );
}

export default Login;