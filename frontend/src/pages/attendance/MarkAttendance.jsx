import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Search,
  Send,
  CheckCheck,
  X,
  AlertCircle,
  Calendar,
  BookOpen,
  Users,
  CheckSquare,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';

export default function MarkAttendance({ user }) {
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);

  // Faculty role constraints: single subject & designated divisions
  const isFaculty = user?.role === 'faculty';
  const facultySubject = isFaculty ? (user.subject || 'CS401') : null;
  const facultyDivisions = isFaculty && user.divisions?.length > 0 ? user.divisions : ['TY-A', 'TY-B', 'TY-C'];

  const [selectedSubject, setSelectedSubject] = useState(
    facultySubject || searchParams.get('subject') || 'CS401'
  );
  const [selectedDivision, setSelectedDivision] = useState(
    facultyDivisions.includes(searchParams.get('division'))
      ? searchParams.get('division')
      : facultyDivisions[0] || 'TY-A'
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('Lecture');
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sync when user changes or subjects load
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.getSubjects();
        if (res.success && res.subjects?.length > 0) {
          setSubjects(res.subjects);
          if (facultySubject) {
            const requestedSub = searchParams.get('subject');
            if (requestedSub && requestedSub !== facultySubject) {
              setNotification({
                type: 'error',
                title: 'You are not assigned to that subject',
                message: `You are assigned to teach ${facultySubject}. You cannot record attendance for ${requestedSub}. Your roll call is restricted to your course (${facultySubject}).`
              });
            }
            setSelectedSubject(facultySubject);
          } else if (!searchParams.get('subject')) {
            setSelectedSubject(res.subjects[0].code);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    loadSubjects();
  }, [facultySubject, searchParams]);

  // Load students for chosen division
  useEffect(() => {
    async function fetchStudents() {
      if (!selectedDivision) return;
      setLoading(true);
      try {
        const res = await api.getStudents(`division=${selectedDivision}`);
        if (res.success && res.students) {
          setStudents(res.students);
          // Default all to PRESENT
          const initialMap = {};
          res.students.forEach(s => {
            initialMap[s.id] = 'PRESENT';
          });
          setAttendanceMap(initialMap);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [selectedDivision]);

  const toggleStatus = (id) => {
    setAttendanceMap(prev => ({
      ...prev,
      [id]: prev[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setNotification(null);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendanceMap[s.id] || 'PRESENT'
      }));

      const payload = {
        subjectCode: selectedSubject,
        division: selectedDivision,
        date: selectedDate,
        records,
        facultyId: user?.facultyId || user?.id || 'FAC01'
      };

      const res = await api.markAttendance(payload);
      if (res.success) {
        setNotification({
          type: 'success',
          title: 'Class Attendance Ledger Submitted!',
          message: `Recorded attendance for course ${selectedSubject} in Division ${selectedDivision} on ${selectedDate}. Present: ${res.result?.presentCount ?? presentCount}, Absent: ${res.result?.absentCount ?? absentCount}.`
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Submission Error',
        message: err.message || 'Failed to submit attendance records.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(v => v === 'ABSENT').length;
  const attendanceRate = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : 0;

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Mark Class Attendance</h1>
            {isFaculty && (
              <span className="badge badge-success">
                Faculty: {user?.name || 'Prof. Arvind Sharma'}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            {isFaculty
              ? `You are assigned to course ${selectedSubject}. Switch between your assigned divisions below.`
              : 'Select subject, division, and date to record student presence'}
          </p>
        </div>

        {/* Live Counters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 14px',
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="var(--success)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-text)' }}>
              Present: <strong>{presentCount}</strong>
            </span>
          </div>

          <div style={{
            padding: '8px 14px',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <XCircle size={16} color="var(--danger)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger-text)' }}>
              Absent: <strong>{absentCount}</strong>
            </span>
          </div>

          <div style={{
            padding: '8px 14px',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-text)' }}>
              Rate: {attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: notification.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          border: `1px solid ${notification.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          {notification.type === 'success' ? (
            <CheckCircle2 size={20} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} color="var(--danger)" style={{ marginTop: '2px', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: 700,
              fontSize: '13.5px',
              color: notification.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)'
            }}>
              {notification.title}
            </div>
            <div style={{
              fontSize: '12.5px',
              color: notification.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
              marginTop: '3px'
            }}>
              {notification.message}
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Control Configuration Bar */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'flex-end'
        }}>
          {/* ASSIGNED SUBJECT */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Assigned Course Subject</label>
              {isFaculty && (
                <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 6px' }}>
                  <Lock size={10} /> Single Subject Assigned
                </span>
              )}
            </div>

            {isFaculty ? (
              <div style={{
                padding: '9px 13px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 700,
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <span>{selectedSubject}: {(subjects.find(s => s.code === selectedSubject)?.name) || 'Operating Systems'}</span>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Fixed for Faculty</span>
              </div>
            ) : (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="select"
              >
                {subjects.map(sub => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code}: {sub.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ASSIGNED DIVISIONS (Multiple Divisions Available to Faculty) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Teaching Division</label>
              {isFaculty && (
                <span className="badge badge-neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                  {facultyDivisions.length} Divisions Assigned
                </span>
              )}
            </div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="select"
              style={{ fontWeight: 600 }}
            >
              {facultyDivisions.map(div => (
                <option key={div} value={div}>
                  Division {div} (35 Students)
                </option>
              ))}
            </select>
          </div>

          {/* Session Date */}
          <div>
            <label className="form-label">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="form-label">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="select"
            >
              <option value="Lecture">Regular Lecture (1 hr)</option>
              <option value="Lab">Practical Lab (2 hrs)</option>
              <option value="Tutorial">Tutorial Session</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List & Fast Batch Actions */}
      <div className="card">
        {/* Table Toolbar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '34px', fontSize: '12.5px' }}
            />
          </div>

          {/* Batch Tools */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => markAll('PRESENT')}
              className="btn btn-secondary btn-sm"
              title="Set all students to present"
            >
              <CheckCheck size={14} color="var(--success)" />
              <span>Mark All Present</span>
            </button>

            <button
              onClick={() => markAll('ABSENT')}
              className="btn btn-secondary btn-sm"
              title="Set all students to absent"
            >
              <X size={14} color="var(--danger)" />
              <span>Mark All Absent</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="btn btn-primary"
              style={{ minWidth: '160px', marginLeft: '6px' }}
            >
              <Send size={15} />
              <span>{submitting ? 'Submitting...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Overall Attendance %</th>
                <th>Exam Eligibility</th>
                <th style={{ textAlign: 'center' }}>Mark for Today's Class</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    Loading division students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const status = attendanceMap[student.id] || 'PRESENT';
                  const isPresent = status === 'PRESENT';

                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {student.rollNumber}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '11px'
                          }}>
                            {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{student.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{student.overallPercentage}%</span>
                          <div className="progress-track" style={{ width: '80px' }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${student.overallPercentage}%`,
                                backgroundColor: student.overallPercentage >= 75 ? 'var(--success)' : 'var(--danger)'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          student.status === 'Eligible' ? 'badge-success' :
                          student.status === 'Warning' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {student.status || 'Eligible'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleStatus(student.id)}
                          className={`btn ${isPresent ? 'btn-success' : 'btn-danger'} btn-sm`}
                          style={{
                            minWidth: '115px',
                            fontWeight: 700,
                            boxShadow: isPresent ? '0 1px 3px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No students match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
