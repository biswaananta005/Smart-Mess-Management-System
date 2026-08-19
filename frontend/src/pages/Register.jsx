import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Lock, Mail, User, Hash, Home, BookOpen, ArrowRight, Code2 } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    roomNumber: '',
    department: 'Computer Science'
  });
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res?.success) {
      if (res.role === 'admin') navigate('/admin');
      else if (res.role === 'authority') navigate('/authority');
      else navigate('/student');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container register-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <UtensilsCrossed size={28} />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register for Smart Mess Access</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Account Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input select-input"
              >
                <option value="student">Student</option>
                <option value="admin">Mess Admin</option>
                <option value="authority">College Authority</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div className="form-group flex-1">
                <label className="form-label">Roll Number</label>
                <div className="input-with-icon">
                  <Hash size={18} className="input-icon" />
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    placeholder="Enter your registered roll number"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>

          {formData.role === 'student' && (
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">Room Number</label>
                <div className="input-with-icon">
                  <Home size={18} className="input-icon" />
                  <input
                    type="text"
                    name="roomNumber"
                    placeholder="B-304"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Department</label>
                <div className="input-with-icon">
                  <BookOpen size={18} className="input-icon" />
                  <input
                    type="text"
                    name="department"
                    placeholder="Enter your branch"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Creating Account...' : 'Register Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-link">
          <span>Already have an account? </span>
          <Link to="/login" className="link-text">Sign In</Link>
        </div>

        <div className="auth-dev-credit">
          <Code2 size={14} />
          <span>Developed by <strong>Biswa Ananta</strong></span>
        </div>
      </div>
    </div>
  );
};

export default Register;
