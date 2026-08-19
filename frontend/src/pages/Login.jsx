import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Lock, UserCheck, ArrowRight, Code2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(identifier, password);
    setSubmitting(false);

    if (res?.success) {
      if (res.role === 'admin') navigate('/admin');
      else if (res.role === 'authority') navigate('/authority');
      else navigate('/student');
    }
  };

  const handleQuickFill = (demoInput, demoPass) => {
    setIdentifier(demoInput);
    setPassword(demoPass);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <UtensilsCrossed size={28} />
          </div>
          <h2 className="auth-title">Smart Mess Portal</h2>
          <p className="auth-subtitle">Sign in using your Email Address or Student ID</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address or Student ID (Roll No)</label>
            <div className="input-with-icon">
              <UserCheck size={18} className="input-icon" />
              <input
                type="text"
                required
                placeholder="student@mess.com or STU1001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="demo-accounts-section">
          <span className="demo-label">Quick Demo Access:</span>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="demo-btn student"
              onClick={() => handleQuickFill('STU1001', 'Password123')}
            >
              Student (Email/ID)
            </button>
            <button
              type="button"
              className="demo-btn admin"
              onClick={() => handleQuickFill('messadmin@gmail.com', 'mess@1234')}
            >
              Mess Admin
            </button>
            <button
              type="button"
              className="demo-btn authority"
              onClick={() => handleQuickFill('collegeauthority@gmail.com', 'authority@1234')}
            >
              College Authority
            </button>
          </div>
        </div>

        <div className="auth-footer-link">
          <span>New student? </span>
          <Link to="/register" className="link-text">Create Account</Link>
        </div>

        <div className="auth-dev-credit">
          <Code2 size={14} />
          <span>Developed by <strong>Biswa Ananta</strong></span>
        </div>
      </div>
    </div>
  );
};

export default Login;
