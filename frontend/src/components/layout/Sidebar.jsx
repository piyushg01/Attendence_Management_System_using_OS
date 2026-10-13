import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Calendar,
  CheckCircle2,
  Shield,
  Clock
} from 'lucide-react';

export default function Sidebar({ user }) {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const navSections = [
    {
      category: 'Attendance Core',
      items: [
        {
          to: '/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          exact: true
        },
        {
          to: '/attendance/mark',
          label: 'Mark Attendance',
          icon: CheckSquare,
          badge: isAdmin ? null : 'My Classes'
        },
        {
          to: '/attendance/history',
          label: 'Attendance Records',
          icon: FileSpreadsheet
        },
        {
          to: '/attendance/defaulters',
          label: 'Defaulter Watchlist',
          icon: AlertTriangle,
          badge: '<75%',
          badgeType: 'warning'
        }
      ]
    },
    {
      category: isAdmin ? 'Administration Console' : 'Academic Management',
      items: [
        {
          to: '/faculty',
          label: isAdmin ? 'Faculty Registration' : 'Faculty Directory',
          icon: GraduationCap,
          badge: isAdmin ? 'Admin' : null,
          badgeType: 'primary'
        },
        {
          to: '/students',
          label: 'Student Directory',
          icon: Users
        },
        {
          to: '/subjects',
          label: 'Courses & Curriculum',
          icon: BookOpen
        },
        {
          to: '/reports',
          label: 'Reports & Analytics',
          icon: BarChart3
        }
      ]
    }
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '20px 14px',
      gap: '24px',
      overflowY: 'auto'
    }}>
      {/* Current Academic Term banner */}
      <div style={{
        padding: '12px 14px',
        backgroundColor: 'var(--bg-app)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isAdmin ? <Shield size={16} /> : <Calendar size={16} />}
        </div>
        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            {isAdmin ? 'Administration' : 'Faculty Portal'}
          </div>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>
            Semester VI • 2026
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {navSections.map((sec, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              padding: '0 10px 6px 10px'
            }}>
              {sec.category}
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: item.badgeType === 'warning' ? 'var(--warning-light)' : 'var(--primary)',
                      color: item.badgeType === 'warning' ? 'var(--warning-text)' : '#ffffff',
                      border: item.badgeType === 'warning' ? '1px solid var(--warning-border)' : 'none'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Role specific helper box */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isAdmin ? 'var(--primary-light)' : 'var(--success-light)',
        border: `1px solid ${isAdmin ? 'var(--primary-border)' : 'var(--success-border)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: isAdmin ? 'var(--primary-text)' : 'var(--success-text)',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {isAdmin ? <Shield size={14} /> : <CheckCircle2 size={14} />}
          <span>{isAdmin ? 'Administrator Mode' : `Assigned: ${user?.subject || 'CS401'}`}</span>
        </div>
        <p style={{
          fontSize: '11px',
          color: isAdmin ? 'var(--primary-text)' : 'var(--success-text)',
          opacity: 0.85,
          lineHeight: 1.4
        }}>
          {isAdmin
            ? 'Authorized to register faculties and manage course assignments.'
            : `Assigned divisions: ${(user?.divisions || ['TY-A', 'TY-B']).join(', ')}.`}
        </p>
      </div>
    </aside>
  );
}
