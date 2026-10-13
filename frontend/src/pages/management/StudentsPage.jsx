import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  X,
  GraduationCap,
  Mail,
  BookOpen
} from 'lucide-react';
import { api } from '../../services/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [division, setDivision] = useState('');
  const [status, setStatus] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (division) query.append('division', division);
        if (status) query.append('status', status);

        const res = await api.getStudents(query.toString());
        if (res.success && res.students) {
          setStudents(res.students);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [search, division, status]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Student Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Registered university students, current attendance standing, and academic eligibility
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
          <Users size={16} color="var(--primary)" />
          <span>{students.length} Students Listed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
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
              placeholder="Search by student name or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '34px' }}
            />
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="select"
            >
              <option value="">All Divisions (TY-A, B, C)</option>
              <option value="TY-A">Division TY-A</option>
              <option value="TY-B">Division TY-B</option>
              <option value="TY-C">Division TY-C</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select"
            >
              <option value="">All Status Categories</option>
              <option value="Eligible">Eligible (&ge;75%)</option>
              <option value="Warning">Warning (65% – 74%)</option>
              <option value="Critical">Critical (&lt;65%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Division</th>
                <th>Email Address</th>
                <th>Overall Attendance</th>
                <th>Eligibility</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    Loading student roster...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => {
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
                            color: 'var(--primary)',
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
                        <span className="badge badge-neutral">{student.division}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {student.email}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800 }}>{student.overallPercentage}%</span>
                          <div className="progress-track" style={{ width: '70px' }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${student.overallPercentage}%`,
                                backgroundColor: student.overallPercentage >= 75 ? 'var(--success)' : student.overallPercentage >= 65 ? 'var(--warning)' : 'var(--danger)'
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
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px' }}
                        >
                          <Eye size={13} />
                          <span>Report Card</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No students match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '16px'
        }}>
          <div className="card" style={{
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div className="card-header" style={{ backgroundColor: 'var(--bg-app)' }}>
              <div>
                <h3 style={{ fontSize: '16px' }}>Student Attendance Report</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Roll {selectedStudent.rollNumber} • {selectedStudent.division}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '18px'
                }}>
                  {selectedStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px' }}>{selectedStudent.name}</h4>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedStudent.email}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: selectedStudent.overallPercentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                    {selectedStudent.overallPercentage}%
                  </div>
                  <span className={`badge ${selectedStudent.status === 'Eligible' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Subject-wise Attendance Records:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedStudent.subjects ? (
                    Object.entries(selectedStudent.subjects).map(([code, subData]) => (
                      <div
                        key={code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-primary">{code}</span>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            {subData.attended || 0} / {subData.total || 0} attended
                          </span>
                        </div>
                        <span style={{
                          fontWeight: 700,
                          color: (subData.percentage || 0) >= 75 ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {subData.percentage || 0}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      textAlign: 'center'
                    }}>
                      Overall record: {selectedStudent.overallPercentage}% across all registered curriculum subjects.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary">
                  Close
                </button>
                <button
                  onClick={() => alert(`Official clearance certificate printed for ${selectedStudent.name}.`)}
                  className="btn btn-primary"
                >
                  Download Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
