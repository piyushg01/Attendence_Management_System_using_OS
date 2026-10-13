import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Sliders,
  Mail,
  Download,
  AlertCircle,
  Users,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';

export default function DefaultersPage() {
  const [threshold, setThreshold] = useState(75);
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [divisionFilter, setDivisionFilter] = useState('ALL');

  useEffect(() => {
    async function fetchDefaulters() {
      setLoading(true);
      try {
        const res = await api.getDefaulters(threshold);
        if (res.success && res.defaulters) {
          setDefaulters(res.defaulters);
        }
      } catch (err) {
        console.error('Failed to load defaulters:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDefaulters();
  }, [threshold]);

  const filtered = defaulters.filter(d =>
    divisionFilter === 'ALL' || d.division === divisionFilter
  );

  const criticalCount = defaulters.filter(d => d.overallPercentage < 65).length;
  const warningCount = defaulters.filter(d => d.overallPercentage >= 65 && d.overallPercentage < threshold).length;

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Division', 'Attendance %', 'Status'];
    const rows = filtered.map(d => [d.rollNumber, d.name, d.division, `${d.overallPercentage}%`, d.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Defaulters_Below_${threshold}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Defaulter Watchlist & Attendance Risk</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Identify and intervene with students whose attendance falls below university minimum requirements
          </p>
        </div>

        {/* Threshold Adjustment Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <Sliders size={16} color="var(--primary)" />
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Threshold:
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger)' }}>
            {threshold}%
          </span>
          <input
            type="range"
            min="50"
            max="85"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: '100px', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Defaulters</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
              {defaulters.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Students below {threshold}%
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #b91c1c' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Critical Risk (&lt;65%)</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px', fontWeight: 600 }}>
              Immediate debarment risk
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Warning Category</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
              {warningCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--warning-text)', marginTop: '4px', fontWeight: 600 }}>
              Attendance 65% – {threshold}%
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Eligible Clear Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
              {105 - defaulters.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--success-text)', marginTop: '4px', fontWeight: 600 }}>
              {(((105 - defaulters.length) / 105) * 100).toFixed(1)}% compliant
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Table Filters & Export */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Division:</span>
            {['ALL', 'TY-A', 'TY-B', 'TY-C'].map(div => (
              <button
                key={div}
                onClick={() => setDivisionFilter(div)}
                className={`btn btn-sm ${divisionFilter === div ? 'btn-primary' : 'btn-secondary'}`}
              >
                {div}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => alert(`Notices queued: Email warnings dispatched to ${filtered.length} student guardians.`)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Mail size={14} />
              <span>Email Warning Notices</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV List</span>
            </button>
          </div>
        </div>

        {/* Defaulter Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Division</th>
                <th>Current %</th>
                <th>Shortage Estimate</th>
                <th>Academic Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    Scanning database for students below {threshold}%...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((s) => {
                  const isCritical = s.overallPercentage < 65;
                  // Approximate classes to attend to reach 75%
                  const neededClasses = Math.ceil((75 - s.overallPercentage) * 0.4);

                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {s.rollNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.email}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{s.division}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: isCritical ? 'var(--danger)' : 'var(--warning-text)' }}>
                            {s.overallPercentage}%
                          </span>
                          <div className="progress-track" style={{ width: '70px' }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${s.overallPercentage}%`,
                                backgroundColor: isCritical ? 'var(--danger)' : 'var(--warning)'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Needs ~<strong>{Math.max(1, neededClasses)}</strong> consecutive classes
                      </td>
                      <td>
                        <span className={`badge ${isCritical ? 'badge-danger' : 'badge-warning'}`}>
                          {isCritical ? 'Critical (<65%)' : 'Warning (<75%)'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => alert(`Direct warning notice sent to student ${s.name} (${s.email})`)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px' }}
                        >
                          <Mail size={12} />
                          <span>Notify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--success)' }}>
                    <CheckCircle2 size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    No students currently below the {threshold}% attendance threshold in this division.
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
