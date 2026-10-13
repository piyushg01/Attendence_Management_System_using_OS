const BASE_URL = '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchJson('/auth/me'),

  // Attendance
  markAttendance: (payload) => fetchJson('/attendance/mark', { method: 'POST', body: JSON.stringify(payload) }),
  getAttendanceStats: () => fetchJson('/attendance/stats'),
  getDefaulters: (threshold = 75) => fetchJson(`/attendance/defaulters?threshold=${threshold}`),
  getAttendanceFiles: () => fetchJson('/attendance/files'),

  // Management
  getStudents: (params = '') => fetchJson(`/students?${params}`),
  getStudentById: (id) => fetchJson(`/students/${id}`),
  getSubjects: () => fetchJson('/students/subjects'),
  getFaculty: () => fetchJson('/students/faculty'),
  registerFaculty: (payload) => fetchJson('/students/faculty', { method: 'POST', body: JSON.stringify(payload) }),
  deleteFaculty: (id) => fetchJson(`/students/faculty/${id}`, { method: 'DELETE' }),
  getTimetable: () => fetchJson('/students/timetable'),
  uploadTimetable: (payload) => fetchJson('/students/timetable/upload', { method: 'POST', body: JSON.stringify(payload) })
};
