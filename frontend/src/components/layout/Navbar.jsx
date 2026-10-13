import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, LogOut, User, Bell, ChevronDown } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const getRoleBadge = (role, subject) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="badge badge-primary">College Administrator</span>;
      case 'faculty':
        return <span className="badge badge-success">Faculty {subject ? `(${subject})` : ''}</span>;
      default:
        return <span className="badge badge-neutral">Staff</span>;
    }
  };

  return (
    <header style={{
      height: 'var(--navbar-height)',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-xs)'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
          }}>
            <CalendarCheck size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15
            }}>
              Attend<span style={{ color: 'var(--primary)' }}>Ease</span>
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>
              Attendance, made simple
            </div>
          </div>
        </Link>

        {/* Institution Badge */}
        <div style={{
          height: '24px',
          width: '1px',
          backgroundColor: 'var(--border-subtle)',
          margin: '0 4px'
        }} />
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontWeight: 500
        }}>
          VIT Pune Academic Portal
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Date indicator */}
        <div style={{
          fontSize: '12.5px',
          color: 'var(--text-secondary)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span>{todayStr}</span>
        </div>

        {/* User Card / Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px'
              }}>
                {user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
              </div>
              <div>
                <div style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  lineHeight: 1.2
                }}>
                  {user.name || 'Faculty User'}
                </div>
                <div style={{ marginTop: '2px' }}>
                  {getRoleBadge(user.role, user.subject)}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                navigate('/login');
              }}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
