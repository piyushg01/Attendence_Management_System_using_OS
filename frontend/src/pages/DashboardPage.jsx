import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  UserCheck,
  CheckSquare,
  GraduationCap,
  Shield,
  Plus,
  Upload,
  FileText,
  X,
  Check,
  CalendarDays,
  Download
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({ user }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const facultySubject = user?.subject || 'CS401';
  const facultyDivisions = user?.divisions || ['TY-A', 'TY-B'];

  const [stats, setStats] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [timetableInfo, setTimetableInfo] = useState({
    fileName: 'Semester_VI_Master_Timetable.pdf',
    division: 'All Divisions',
    uploadedAt: new Date().toISOString(),
    status: 'Active & Allotted to Faculties'
  });
  const [loading, setLoading] = useState(true);

  // Timetable PDF Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [uploadDivision, setUploadDivision] = useState('All Divisions');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadNotification, setUploadNotification] = useState(null);

  // Day filter for timetable view
  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [activeDay, setActiveDay] = useState(validDays.includes(currentDayName) ? currentDayName : 'Monday');

  const loadDashboardData = async () => {
    try {
      const [statsRes, defRes, subRes, filesRes, facRes, ttRes] = await Promise.allSettled([
        api.getAttendanceStats(),
        api.getDefaulters(75),
        api.getSubjects(),
        api.getAttendanceFiles(),
        api.getFaculty(),
        api.getTimetable()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.stats);
      }
      if (defRes.status === 'fulfilled' && defRes.value?.success) {
        setDefaulters(defRes.value.defaulters || []);
      }
      if (subRes.status === 'fulfilled' && subRes.value?.success) {
        setSubjects(subRes.value.subjects || []);
      }
      if (filesRes.status === 'fulfilled' && filesRes.value?.success) {
        setRecentFiles(filesRes.value.files || []);
      }
      if (facRes.status === 'fulfilled' && facRes.value?.success) {
        setFacultyList(facRes.value.faculty || []);
      }
      if (ttRes.status === 'fulfilled' && ttRes.value?.success) {
        setTimetable(ttRes.value.timetable || []);
        if (ttRes.value.timetableInfo) {
          setTimetableInfo(ttRes.value.timetableInfo);
        }
      }
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Timetable PDF Upload with Chosen Division
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    const fileName = selectedPdfFile?.name || 'Semester_VI_Master_Timetable.pdf';
    const fileSize = selectedPdfFile ? `${(selectedPdfFile.size / 1024).toFixed(0)} KB` : '324 KB';

    setUploadingPdf(true);
    try {
      const res = await api.uploadTimetable({
        fileName,
        fileSize,
        division: uploadDivision
      });

      if (res.success) {
        setTimetable(res.timetable || []);
        setTimetableInfo(res.timetableInfo);
        setUploadNotification({
          type: 'success',
          msg: `Timetable PDF "${fileName}" uploaded successfully for ${uploadDivision}! Lecture time slots have been automatically allotted to each faculty member.`
        });
        setShowUploadModal(false);
        setSelectedPdfFile(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to upload timetable PDF.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Filter lectures for faculty or admin
  const filteredSchedule = timetable.filter(slot => {
    const matchesDay = activeDay === 'All Days' || slot.day === activeDay;
    if (!matchesDay) return false;

    if (isAdmin) {
      return true; // Admin views all allotted sessions
    }

    // Faculty only views their assigned course and their assigned divisions
    const matchesSubject = slot.subject === facultySubject;
    const matchesDivision = facultyDivisions.includes(slot.division);
    return matchesSubject && matchesDivision;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: isAdmin
          ? 'linear-gradient(135deg, #3730a3 0%, #1e1b4b 100%)'
          : 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 600,
            marginBottom: '10px',
            letterSpacing: '0.04em'
          }}>
            {isAdmin ? <Shield size={13} /> : <Calendar size={13} />}
            <span>{isAdmin ? 'College Administration' : `Course Instructor • ${facultySubject}`}</span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Welcome back, {user?.name || (isAdmin ? 'College Administrator' : 'Faculty Member')}
          </h1>

          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', marginTop: '6px', maxWidth: '640px' }}>
            {isAdmin
              ? 'Oversee academic rosters, upload master timetable PDFs by division to allot lecture slots, and track attendance records.'
              : `Assigned Course: ${facultySubject} • Divisions: ${facultyDivisions.join(', ')}. Your lecture schedule is automatically allotted from the College Master Timetable.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <Upload size={16} />
                <span>Upload Timetable PDF</span>
              </button>

              <a
                href="/Semester_VI_Master_Timetable.pdf"
                download="Semester_VI_Master_Timetable.pdf"
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  textDecoration: 'none'
                }}
              >
                <Download size={16} />
                <span>Download Timetable PDF</span>
              </a>

              <Link
                to="/faculty"
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <Plus size={16} />
                <span>Register Faculty</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/attendance/mark"
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <CheckSquare size={16} />
                <span>Mark My Attendance</span>
              </Link>

              <a
                href="/Semester_VI_Master_Timetable.pdf"
                download="Semester_VI_Master_Timetable.pdf"
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  textDecoration: 'none'
                }}
              >
                <Download size={15} />
                <span>Download Timetable PDF</span>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadNotification && (
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
            <span>{uploadNotification.msg}</span>
          </div>
          <button
            onClick={() => setUploadNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Students */}
        <div className="card stat-card">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Students</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {stats?.totalStudents || 105}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enrolled across 3 Divisions
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Registered Faculties (Admin) OR Assigned Course (Faculty) */}
        {isAdmin ? (
          <div className="card stat-card">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered Faculty</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {facultyList.length || 10}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <Link to="/faculty" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Manage & Register &rarr;
                </Link>
              </div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <GraduationCap size={22} />
            </div>
          </div>
        ) : (
          <div className="card stat-card">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Assigned Subject</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {facultySubject}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Divisions: {facultyDivisions.join(', ')}
              </div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <BookOpen size={22} />
            </div>
          </div>
        )}

        {/* Master Timetable Status Card */}
        <div className="card stat-card">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Master Timetable</div>
            <div style={{
              fontSize: '14.5px',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FileText size={16} color="var(--primary)" />
              <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {timetableInfo?.fileName || 'Semester_VI_Master_Timetable.pdf'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--success-text)', marginTop: '4px', fontWeight: 600 }}>
              &bull; Division: {timetableInfo?.division || 'All Divisions'}
            </div>
            <div style={{ marginTop: '8px' }}>
              <a
                href="/Semester_VI_Master_Timetable.pdf"
                download="Semester_VI_Master_Timetable.pdf"
                style={{
                  fontSize: '11.5px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={12} />
                <span>Download Timetable PDF</span>
              </a>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
            <CalendarDays size={22} />
          </div>
        </div>

        {/* Defaulters Alert */}
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger-text)' }}>Defaulters at Risk</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
              {defaulters.length || 14}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--danger-text)', marginTop: '4px', fontWeight: 600 }}>
              Attendance &lt; 75%
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Lectures (Allotted from Timetable) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* LECTURES SECTION */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '16px' }}>
                  {isAdmin ? "College Master Lecture Timetable" : "My Scheduled Lectures Today"}
                </h2>
                <span className="badge badge-primary">{filteredSchedule.length} Lectures</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isAdmin
                  ? `Uploaded Master Timetable: ${timetableInfo?.fileName} (${timetableInfo?.division || 'All Divisions'})`
                  : `Allotted for ${facultySubject} in your assigned divisions (${facultyDivisions.join(', ')})`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a
                href="/Semester_VI_Master_Timetable.pdf"
                download="Semester_VI_Master_Timetable.pdf"
                className="btn btn-secondary btn-sm"
                style={{ gap: '5px', textDecoration: 'none' }}
                title="Download the official Timetable PDF"
              >
                <Download size={13} />
                <span>PDF</span>
              </a>

              {isAdmin && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Upload size={14} />
                  <span>Upload Timetable PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* Day Filter Tabs */}
          <div style={{
            padding: '10px 18px',
            backgroundColor: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto'
          }}>
            {validDays.map(d => (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeDay === d ? 700 : 500,
                  backgroundColor: activeDay === d ? 'var(--primary)' : 'transparent',
                  color: activeDay === d ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Lectures List (Matching User's Screenshot Design) */}
          <div className="card-body" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredSchedule.length > 0 ? (
              filteredSchedule.map((cls, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    gap: '12px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '12px',
                      flexShrink: 0
                    }}>
                      {cls.subject}
                    </div>

                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {cls.subjectName || (cls.subject === 'CS401' ? 'Operating Systems' : 'Database Management Systems')}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          {cls.time}
                        </span>
                        <span>•</span>
                        <span className="badge badge-neutral" style={{ padding: '2px 8px', fontSize: '10.5px' }}>
                          {cls.division}
                        </span>
                        <span>•</span>
                        <span>{cls.room}</span>
                        {isAdmin && cls.facultyName && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{cls.facultyName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/attendance/mark?subject=${cls.subject}&division=${cls.division}`}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '4px', whiteSpace: 'nowrap', padding: '7px 14px' }}
                  >
                    <span>Mark</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                <Clock size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontWeight: 600, fontSize: '13px' }}>
                  No lectures allotted on {activeDay} for {facultySubject} ({facultyDivisions.join(', ')}).
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Select another weekday tab above or check the Master Timetable PDF.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Division Attendance Health Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '16px' }}>Division Attendance Health</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Overall compliance status across academic cohorts
              </p>
            </div>
            <Link to="/reports" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Full Analytics &rarr;
            </Link>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { div: 'Division TY-A', count: 35, pct: 85.2, status: 'Healthy', color: 'var(--success)' },
              { div: 'Division TY-B', count: 35, pct: 81.6, status: 'Good', color: 'var(--primary)' },
              { div: 'Division TY-C', count: 35, pct: 79.4, status: 'Moderate', color: 'var(--warning)' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>{d.div}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({d.count} Students)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: d.color }}>{d.pct}%</span>
                    <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>{d.status}</span>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}

            {/* Defaulter warning card */}
            <div style={{
              marginTop: '6px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="var(--danger)" />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--danger-text)' }}>
                    {defaulters.length || 14} Students Below 75%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--danger-text)', opacity: 0.9 }}>
                    Action required before examination eligibility clearance.
                  </div>
                </div>
              </div>
              <Link to="/attendance/defaulters" className="btn btn-danger btn-sm" style={{ whiteSpace: 'nowrap' }}>
                View List
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* UPLOAD TIMETABLE PDF MODAL FOR ADMINISTRATION WITH DIVISION SELECTOR */}
      {showUploadModal && (
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
            maxWidth: '540px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div className="card-header" style={{ backgroundColor: 'var(--bg-app)' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Upload College Timetable PDF</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Choose division and upload timetable to allot lecture timings
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePdfUpload} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* CHOOSE DIVISION WHILE UPLOADING PDF */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)'
              }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Choose Division for Timetable Allotment: *
                </label>
                <select
                  value={uploadDivision}
                  onChange={(e) => setUploadDivision(e.target.value)}
                  className="select"
                  style={{ backgroundColor: '#ffffff', fontWeight: 700 }}
                  required
                >
                  <option value="All Divisions">All Divisions (TY-A, TY-B, and TY-C)</option>
                  <option value="TY-A">Division TY-A (Hall 202 & Lab 2)</option>
                  <option value="TY-B">Division TY-B (Hall 201 & Lab 1)</option>
                  <option value="TY-C">Division TY-C (Hall 104 & Lab 3)</option>
                </select>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  &bull; The uploaded PDF timetable will configure and allot lecture slots for <strong>{uploadDivision}</strong>.
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                style={{
                  border: '2px dashed var(--primary-border)',
                  backgroundColor: 'var(--primary-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedPdfFile(e.target.files[0]);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />

                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <FileText size={24} />
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-text)' }}>
                  {selectedPdfFile ? selectedPdfFile.name : 'Click to Upload or Drag Timetable PDF'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--primary-text)', opacity: 0.8, marginTop: '4px' }}>
                  {selectedPdfFile
                    ? `${(selectedPdfFile.size / 1024).toFixed(0)} KB • Ready for Allotment to ${uploadDivision}`
                    : 'Official College Semester Timetable (.pdf)'}
                </div>
              </div>

              {/* Preset Selector */}
              <div>
                <label className="form-label">Or select Master Timetable PDF file:</label>
                <select
                  onChange={(e) => setSelectedPdfFile({ name: e.target.value, size: 7421 })}
                  className="select"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <option value="Semester_VI_Master_Timetable.pdf">
                    Semester_VI_Master_Timetable.pdf (Official College Syllabus)
                  </option>
                  <option value="Computer_Engineering_Division_Schedule.pdf">
                    Computer_Engineering_Division_Schedule.pdf
                  </option>
                  <option value="Department_Spring_Academic_Timetable.pdf">
                    Department_Spring_Academic_Timetable.pdf
                  </option>
                </select>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPdf}
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Upload size={15} />
                  <span>{uploadingPdf ? 'Allotting Slots...' : `Upload PDF for ${uploadDivision}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
