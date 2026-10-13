import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function AttendanceHistory() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');

  useEffect(() => {
    async function loadFiles() {
      setLoading(true);
      try {
        const res = await api.getAttendanceFiles();
        if (res.success && res.files) {
          setFiles(res.files);
        }
      } catch (err) {
        console.error('Failed to load attendance files:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
  }, []);

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = selectedDivision === 'ALL' || f.name.includes(selectedDivision);
    return matchesSearch && matchesDivision;
  });

  const handleDownload = (fileName) => {
    alert(`Downloading verified attendance report: ${fileName}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Attendance Records & Session Ledgers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Permanent academic attendance archives, timestamped session records, and export files
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
          <FileSpreadsheet size={16} color="var(--primary)" />
          <span>{files.length} Session Files Archived</span>
        </div>
      </div>

      {/* Main Table Card */}
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
              placeholder="Search session file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '34px', fontSize: '12.5px' }}
            />
          </div>

          {/* Division Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Division:</span>
            {['ALL', 'TY-A', 'TY-B', 'TY-C'].map(div => (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`btn btn-sm ${selectedDivision === div ? 'btn-primary' : 'btn-secondary'}`}
              >
                {div}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Session Record</th>
                <th>Course Subject</th>
                <th>Division</th>
                <th>Session Date</th>
                <th>File Size</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    Loading attendance ledgers...
                  </td>
                </tr>
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((f, idx) => {
                  const parts = f.name.replace('.csv', '').split('_');
                  const subject = parts[1] || 'CS401';
                  const division = parts[2] || 'TY-B';
                  const dateStr = new Date(f.lastModified).toLocaleDateString();
                  const timeStr = new Date(f.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FileSpreadsheet size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{f.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified CSV Ledger</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{subject}</span>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{division}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{dateStr}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeStr}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {(f.sizeBytes / 1024).toFixed(1)} KB
                      </td>
                      <td>
                        <span className="badge badge-success">
                          <CheckCircle2 size={11} />
                          Archived
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleDownload(f.name)}
                            className="btn btn-secondary btn-sm"
                            title="Download CSV"
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No attendance session files found matching the criteria.
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
