import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, defRes, subRes] = await Promise.all([
          api.getAttendanceStats(),
          api.getDefaulters(75),
          api.getSubjects()
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (defRes.success) setDefaulters(defRes.defaulters);
        if (subRes.success) setSubjects(subRes.subjects);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const divisionData = [
    { name: 'Division TY-A', count: 35, avg: 85.2, defaulters: 3, eligible: 32 },
    { name: 'Division TY-B', count: 35, avg: 81.6, defaulters: 5, eligible: 30 },
    { name: 'Division TY-C', count: 35, avg: 79.4, defaulters: 6, eligible: 29 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Attendance Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Comprehensive institutional attendance trends, division comparisons, and compliance metrics
          </p>
        </div>
        <button
          onClick={() => {
            alert('Exporting comprehensive semester attendance report (CSV/PDF)...');
          }}
          className="btn btn-secondary"
          style={{ gap: '6px' }}
        >
          <Download size={15} />
          <span>Export Semester Report</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <div className="card stat-card">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Overall University Average</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
              {stats?.overallAverage ? `${stats.overallAverage}%` : '82.4%'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
              +2.1% from previous month
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Enrolled Students</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
              {stats?.totalStudents || 105}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              3 Active Divisions (TY-A, B, C)
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Students Eligible (&ge;75%)</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)', marginTop: '6px' }}>
              {stats?.eligibleStudents || 91}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--success-text)', marginTop: '4px', fontWeight: 600 }}>
              86.7% Examination Clearance
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Defaulters at Risk (&lt;75%)</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--danger)', marginTop: '6px' }}>
              {defaulters?.length || 14}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--danger-text)', marginTop: '4px', fontWeight: 600 }}>
              Parent alerts pending
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Division Comparison Breakdown */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '16px' }}>Division-wise Attendance Compliance</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Comparative breakdown of attendance records across all third-year classes
            </p>
          </div>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Division Name</th>
                  <th>Total Enrolled</th>
                  <th>Average Attendance</th>
                  <th>Eligible Students</th>
                  <th>Defaulters</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {divisionData.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{d.name}</td>
                    <td>{d.count} Students</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, minWidth: '40px' }}>{d.avg}%</span>
                        <div className="progress-track" style={{ width: '100px' }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${d.avg}%`,
                              backgroundColor: d.avg >= 80 ? 'var(--success)' : 'var(--warning)'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">{d.eligible} Eligible</span>
                    </td>
                    <td>
                      <span className="badge badge-danger">{d.defaulters} At Risk</span>
                    </td>
                    <td>
                      <span className="badge badge-primary">Satisfactory</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Subject Breakdown */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '16px' }}>Subject-wise Lecture Delivery & Conducted Hours</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Verified academic curriculum modules and session counts
            </p>
          </div>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Name</th>
                  <th>Credits</th>
                  <th>Lectures Conducted</th>
                  <th>Faculty In-Charge</th>
                  <th>Attendance Target</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((sub) => (
                    <tr key={sub.code}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{sub.code}</td>
                      <td style={{ fontWeight: 600 }}>{sub.name}</td>
                      <td>{sub.credits} Credits</td>
                      <td><strong>{sub.conducted}</strong> sessions</td>
                      <td>{sub.facultyId || 'Faculty Dept'}</td>
                      <td>
                        <span className="badge badge-success">&ge; 75% Minimum</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                      Loading academic subject records...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
