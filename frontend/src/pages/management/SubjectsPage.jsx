import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Clock,
  CheckSquare,
  Lock,
  AlertCircle,
  X,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';

export default function SubjectsPage({ user }) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unassignedAlert, setUnassignedAlert] = useState(null);

  const isFaculty = user?.role === 'faculty';
  const facultySubject = isFaculty ? (user.subject || 'CS401') : null;
  const isAdmin = !user || user.role === 'admin';

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.getSubjects();
        if (res.success && res.subjects) {
          setSubjects(res.subjects);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  const handleMarkAttendanceClick = (sub) => {
    // Check if faculty is assigned to this course
    if (isFaculty && facultySubject && sub.code !== facultySubject) {
      setUnassignedAlert({
        subjectCode: sub.code,
        subjectName: sub.name,
        assignedTo: sub.facultyId || 'Another Faculty Member',
        userSubject: facultySubject
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Allowed (assigned faculty or admin)
    navigate(`/attendance/mark?subject=${sub.code}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Courses & Academic Curriculum</h1>
            {isFaculty && (
              <span className="badge badge-success">
                My Assigned Course: {facultySubject}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Registered semester courses, credit weights, and conducted lecture tracking
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary-text)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12.5px',
          fontWeight: 600
        }}>
          <BookOpen size={16} color="var(--primary)" />
          <span>{subjects.length} Active Courses</span>
        </div>
      </div>

      {/* Prominent Unassigned Warning Banner */}
      {unassignedAlert && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--danger-light)',
          border: '1px solid var(--danger-border)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.12)'
        }}>
          <ShieldAlert size={22} color="var(--danger)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--danger-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>You are not assigned to that subject</span>
            </div>
            <div style={{
              fontSize: '12.5px',
              color: 'var(--danger-text)',
              marginTop: '4px',
              lineHeight: 1.5
            }}>
              You are assigned to teach <strong>{unassignedAlert.userSubject}</strong>. You cannot mark attendance for <strong>{unassignedAlert.subjectCode}: {unassignedAlert.subjectName}</strong>. Only the assigned faculty or College Administration can record attendance for this course.
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setUnassignedAlert(null);
                  navigate(`/attendance/mark?subject=${unassignedAlert.userSubject}`);
                }}
                className="btn btn-primary btn-sm"
              >
                Mark Attendance for My Course ({unassignedAlert.userSubject}) &rarr;
              </button>
              <button
                onClick={() => setUnassignedAlert(null)}
                className="btn btn-secondary btn-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => setUnassignedAlert(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-text)' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Courses Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading course syllabus...
          </div>
        ) : (
          subjects.map((sub) => {
            const isAssignedToThisFaculty = isFaculty && sub.code === facultySubject;
            const isUnassignedForThisFaculty = isFaculty && sub.code !== facultySubject;

            return (
              <div
                key={sub.code}
                className="card card-hover"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  border: isAssignedToThisFaculty ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '12px', fontWeight: 800, padding: '4px 10px' }}>
                      {sub.code}
                    </span>
                    {isAssignedToThisFaculty && (
                      <span className="badge badge-success" style={{ fontWeight: 700, fontSize: '10.5px' }}>
                        <CheckCircle2 size={11} /> My Subject
                      </span>
                    )}
                    {isUnassignedForThisFaculty && (
                      <span className="badge badge-neutral" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        <Lock size={10} /> Not Assigned
                      </span>
                    )}
                  </div>
                  <span className="badge badge-neutral">
                    {sub.credits} Credits
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {sub.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Faculty In-Charge: <strong style={{ color: 'var(--text-main)' }}>{sub.facultyId || 'Assigned Instructor'}</strong>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12.5px'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Conducted</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                      {sub.conducted} sessions
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Required</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                      &ge; 75%
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <span className="badge badge-success">
                    <CheckCircle2 size={11} />
                    Syllabus On Track
                  </span>

                  <button
                    type="button"
                    onClick={() => handleMarkAttendanceClick(sub)}
                    className={`btn btn-sm ${isUnassignedForThisFaculty ? 'btn-secondary' : 'btn-primary'}`}
                    style={{
                      gap: '6px',
                      opacity: isUnassignedForThisFaculty ? 0.75 : 1,
                      cursor: 'pointer'
                    }}
                    title={isUnassignedForThisFaculty ? 'You are not assigned to that subject' : 'Mark attendance for this subject'}
                  >
                    {isUnassignedForThisFaculty ? <Lock size={13} /> : <CheckSquare size={13} />}
                    <span>Mark Attendance</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
