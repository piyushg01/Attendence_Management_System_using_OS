import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Shield, GraduationCap, ArrowRight, Lock, CheckCircle2, AlertCircle, KeyRound, UserCheck, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [username, setUsername] = useState('administration@vit.edu');
  const [password, setPassword] = useState('vit_college_pune');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const demoAccounts = {
    admin: {
      username: 'administration@vit.edu',
      password: 'vit_college_pune',
      label: 'College Administration',
      desc: 'Dean & Registrar • Registers faculties, assigns subjects, uploads master timetable',
      icon: Shield
    },
    faculty: {
      username: 'arvind.sharma@vit.edu',
      password: 'CS401',
      label: 'Registered Faculty Member',
      desc: 'Course Instructor • Username is official VIT email & Password is assigned subject code',
      icon: GraduationCap
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUsername(demoAccounts[role].username);
    setPassword(demoAccounts[role].password);
    setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ username: username.trim(), password: password.trim(), role: selectedRole });
      if (res.success && res.user) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-app)'
    }}>
      <div className="card" style={{
        maxWidth: '490px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '36px 32px 24px 32px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-app)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
          }}>
            <CalendarCheck size={28} strokeWidth={2.2} />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Attend<span style={{ color: 'var(--primary)' }}>Ease</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            College Administration & Faculty Attendance Portal
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px 32px' }}>
          {error && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--danger-text)',
              fontSize: '12.5px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection Tabs (ADMIN and FACULTY ONLY - NO STUDENT LOGIN) */}
          <div style={{ marginBottom: '22px' }}>
            <label className="form-label" style={{ marginBottom: '8px' }}>Select Portal Login Type:</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              padding: '4px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              {Object.entries(demoAccounts).map(([r, data]) => {
                const Icon = data.icon;
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={18} strokeWidth={isSelected ? 2.4 : 1.8} />
                    <span>{data.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Description Card */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: selectedRole === 'admin' ? 'var(--primary-light)' : 'var(--success-light)',
            border: `1px solid ${selectedRole === 'admin' ? 'var(--primary-border)' : 'var(--success-border)'}`,
            borderRadius: 'var(--radius-md)',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            {selectedRole === 'admin' ? (
              <Shield size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            ) : (
              <UserCheck size={18} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
            )}
            <div>
              <div style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: selectedRole === 'admin' ? 'var(--primary-text)' : 'var(--success-text)'
              }}>
                {selectedRole === 'admin' ? 'College Administration' : 'Faculty Access'}
              </div>
              <div style={{
                fontSize: '11px',
                color: selectedRole === 'admin' ? 'var(--primary-text)' : 'var(--success-text)',
                opacity: 0.9,
                marginTop: '2px'
              }}>
                {demoAccounts[selectedRole].desc}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">
                {selectedRole === 'admin' ? 'Administrator Username' : 'Faculty Username (VIT Email)'}
              </label>
              <input
                type="text"
                placeholder={selectedRole === 'admin' ? 'administration@vit.edu' : 'facultyname@vit.edu'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="form-label">
                {selectedRole === 'admin' ? 'Administrator Password' : 'Password (Assigned Subject Code)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={selectedRole === 'admin' ? 'vit_college_pune' : 'e.g. CS401'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '6px' }}
            >
              <span>{loading ? 'Signing in...' : `Sign in as ${selectedRole === 'admin' ? 'Administrator' : 'Faculty'}`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Helper Hint */}
          <div style={{
            marginTop: '20px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            {selectedRole === 'admin' ? (
              <span>College Administration Credentials: <strong>administration@vit.edu</strong> / <strong>vit_college_pune</strong></span>
            ) : (
              <span>Faculty Member Credentials: Username: <strong>facultyname@vit.edu</strong> / Password: <strong>Assigned Subject Code (e.g. CS401)</strong></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
