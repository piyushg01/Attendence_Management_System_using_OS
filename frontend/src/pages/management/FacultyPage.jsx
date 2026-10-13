import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Users,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Copy,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';

export default function FacultyPage({ user }) {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [notification, setNotification] = useState(null);

  // Registration Form State
  const [name, setName] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [email, setEmail] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('CS401');
  const [selectedDivisions, setSelectedDivisions] = useState(['TY-A', 'TY-B']);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableDivisions = ['TY-A', 'TY-B', 'TY-C'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [facRes, subRes] = await Promise.all([
        api.getFaculty(),
        api.getSubjects()
      ]);
      if (facRes.success && facRes.faculty) {
        setFaculty(facRes.faculty);
      }
      if (subRes.success && subRes.subjects) {
        setSubjects(subRes.subjects);
        if (subRes.subjects.length > 0) {
          setSelectedSubject(subRes.subjects[0].code);
        }
      }
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDivisionToggle = (div) => {
    if (selectedDivisions.includes(div)) {
      if (selectedDivisions.length === 1) {
        alert('Each faculty must be assigned to at least one division.');
        return;
      }
      setSelectedDivisions(selectedDivisions.filter(d => d !== div));
    } else {
      setSelectedDivisions([...selectedDivisions, div]);
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    const cleanName = val.toLowerCase().replace(/^prof\.\s*|^dr\.\s*/i, '').trim().replace(/[^a-z0-9]/g, '.');
    if (cleanName) {
      const vitEmail = `${cleanName}@vit.edu`;
      setUsername(vitEmail);
      setEmail(vitEmail);
      setPassword(selectedSubject || 'CS401');
    }
  };

  const handleRegisterFaculty = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    if (selectedDivisions.length === 0) {
      alert('Please assign at least one division.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || `${username.trim()}@college.edu`,
        dept: dept.trim(),
        subject: selectedSubject, // Single subject assignment
        divisions: selectedDivisions, // Multiple division assignment
        username: username.trim(),
        password: password.trim()
      };

      const res = await api.registerFaculty(payload);
      if (res.success) {
        setNotification({
          type: 'success',
          msg: `Faculty ${res.faculty.name} successfully registered with single subject ${res.faculty.subject} across divisions (${res.faculty.divisions.join(', ')}). Issued username: "${res.faculty.username}".`
        });
        setShowModal(false);
        // Reset form
        setName('');
        setUsername('');
        setPassword('');
        setEmail('');
        setSelectedDivisions(['TY-A', 'TY-B']);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to register faculty.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, facName) => {
    if (!window.confirm(`Are you sure you want to unregister faculty member "${facName}" (${id})?`)) {
      return;
    }
    try {
      const res = await api.deleteFaculty(id);
      if (res.success) {
        setNotification({
          type: 'success',
          msg: `Faculty ${facName} was successfully removed from the institution register.`
        });
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to unregister faculty member.');
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyCredentials = (u, p) => {
    navigator.clipboard.writeText(`Username: ${u}\nPassword: ${p}`);
    alert(`Credentials copied to clipboard:\nUsername: ${u}\nPassword: ${p}`);
  };

  const isAdmin = !user || user.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Faculty Management & Assignments</h1>
            <span className="badge badge-primary">College Administration</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Register academic faculties, assign one subject across multiple divisions, and issue login credentials
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ gap: '8px' }}
          >
            <Plus size={16} />
            <span>Register New Faculty</span>
          </button>
        )}
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--success-light)',
          border: '1px solid var(--success-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          color: 'var(--success-text)',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Institutional Assignment Rules Summary */}
      <div style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              1. Centralized Administrator Registration
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Only College Administration can register faculties and issue login credentials.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              2. Single Subject Policy
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Each faculty is specialized and teaches exactly <strong>one course subject</strong>.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--warning-light)',
            color: 'var(--warning-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              3. Multiple Division Teaching
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Faculty can be assigned to teach their subject to <strong>multiple divisions</strong> (e.g., TY-A, TY-B).
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Directory Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '16px' }}>Registered Academic Faculty Directory</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Total {faculty.length} faculty instructors registered with login credentials
            </p>
          </div>
          <span className="badge badge-success">
            {faculty.length} Active Accounts
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Faculty Instructor</th>
                  <th>Department</th>
                  <th>Assigned Subject (One)</th>
                  <th>Teaching Divisions (Multiple)</th>
                  <th>Issued Login Credentials</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Admin Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      Loading registered faculty list...
                    </td>
                  </tr>
                ) : faculty.length > 0 ? (
                  faculty.map((f) => {
                    const divisions = f.divisions || ['TY-A', 'TY-B'];
                    const isPassVisible = showPasswords[f.id];
                    const pwd = f.password || f.subject || 'CS401';
                    const uname = f.username || f.email || `${(f.name || '').toLowerCase().replace(/^prof\.\s*|^dr\.\s*/i, '').trim().replace(/[^a-z0-9]/g, '.')}@vit.edu`;

                    return (
                      <tr key={f.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px'
                            }}>
                              {f.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{f.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.id} • {f.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {f.dept || 'Computer Science'}
                        </td>

                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge-primary" style={{ fontWeight: 800 }}>
                              {f.subject}
                            </span>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                              {(subjects.find(s => s.code === f.subject)?.name) || 'Course Module'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {divisions.map((d, i) => (
                              <span key={i} className="badge badge-neutral" style={{ fontWeight: 700 }}>
                                {d}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 10px',
                            backgroundColor: 'var(--bg-app)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '11.5px',
                            fontFamily: 'monospace'
                          }}>
                            <span><strong>user:</strong> {uname}</span>
                            <span style={{ color: 'var(--border-medium)' }}>|</span>
                            <span>
                              <strong>pass:</strong> {isPassVisible ? pwd : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(f.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                              title={isPassVisible ? 'Hide password' : 'Show password'}
                            >
                              {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              onClick={() => copyCredentials(uname, pwd)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}
                              title="Copy username and password"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>

                        {isAdmin && (
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDelete(f.id, f.name)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                              title="Unregister faculty"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No faculty members registered. Click "Register New Faculty" to add instructors.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Registration Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div className="card-header" style={{ backgroundColor: 'var(--bg-app)' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Register New Faculty Member</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Assign single course, select multiple divisions, and issue login credentials
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterFaculty} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Faculty Full Name */}
              <div>
                <label className="form-label">Faculty Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Kulkarni"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* Department & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="form-label">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="facultyname@vit.edu"
                  />
                </div>
              </div>

              {/* ASSIGNED SUBJECT (Single Subject Rule) */}
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-border)'
              }}>
                <label className="form-label" style={{ color: 'var(--primary-text)' }}>
                  Assigned Subject (Faculty teaches exactly ONE subject) *
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    const subCode = e.target.value;
                    setSelectedSubject(subCode);
                    setPassword(subCode); // Automatically set password to assigned subject code
                  }}
                  className="select"
                  style={{ backgroundColor: '#ffffff', fontWeight: 600 }}
                  required
                >
                  {subjects.map(sub => (
                    <option key={sub.code} value={sub.code}>
                      {sub.code} — {sub.name} ({sub.credits} Credits)
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: 'var(--primary-text)', marginTop: '6px', opacity: 0.9 }}>
                  &bull; This faculty will teach only <strong>{selectedSubject}</strong> to all their assigned divisions.
                </div>
              </div>

              {/* ASSIGNED DIVISIONS (Multiple Divisions Rule) */}
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <label className="form-label">
                  Assigned Divisions (Faculty can teach multiple divisions) *
                </label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  {availableDivisions.map(div => {
                    const isChecked = selectedDivisions.includes(div);
                    return (
                      <label
                        key={div}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isChecked ? 'var(--primary-light)' : '#ffffff',
                          border: `1px solid ${isChecked ? 'var(--primary-border)' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? 'var(--primary)' : 'var(--text-main)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleDivisionToggle(div)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Division {div}</span>
                      </label>
                    );
                  })}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Selected: {selectedDivisions.join(', ')} ({selectedDivisions.length * 35} students enrolled)
                </div>
              </div>

              {/* LOGIN CREDENTIALS GIVEN BY ADMIN */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <KeyRound size={15} color="var(--primary)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 700 }}>
                    Issue Faculty Login Credentials
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Faculty Username (VIT Email) *</label>
                    <input
                      type="text"
                      placeholder="e.g. ramesh.kulkarni@vit.edu"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Assigned Password (Subject Code) *</label>
                    <input
                      type="text"
                      placeholder="e.g. CS401"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  The faculty instructor will log in using their VIT email as username and assigned course code as password.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <CheckCircle2 size={15} />
                  <span>{submitting ? 'Registering...' : 'Register Faculty & Issue Login'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
