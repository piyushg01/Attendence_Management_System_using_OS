import { getStore, persistDatabase } from '../services/database.js';
import { writeLog } from '../services/loggerService.js';

export function getAllStudents(req, res) {
  const { division, search, status } = req.query;
  const store = getStore();
  let list = store.students;

  if (division) {
    list = list.filter(s => s.division.toLowerCase() === division.toLowerCase());
  }

  if (status) {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    total: list.length,
    students: list
  });
}

export function getStudentById(req, res) {
  const { id } = req.params;
  const store = getStore();
  const student = store.students.find(s => s.id === id || s.rollNumber === id);

  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }

  res.json({ success: true, student });
}

export function getSubjects(req, res) {
  const store = getStore();
  res.json({ success: true, subjects: store.subjects });
}

export function getFaculty(req, res) {
  const store = getStore();
  const defaultDivisions = [
    ['TY-A', 'TY-B'],
    ['TY-B', 'TY-C'],
    ['TY-A', 'TY-C'],
    ['TY-A', 'TY-B', 'TY-C'],
    ['TY-A'],
  ];

  const enrichedFaculty = (store.faculty || []).map((f, i) => {
    const cleanName = (f.name || '').toLowerCase().replace(/^prof\.\s*|^dr\.\s*/i, '').trim().replace(/\s+/g, '.');
    const defaultEmail = cleanName ? `${cleanName}@vit.edu` : `faculty${i + 1}@vit.edu`;
    const facultyEmail = (f.email && f.email.includes('@vit.edu')) ? f.email : defaultEmail;
    const facultyUsername = (f.username && f.username.includes('@vit.edu')) ? f.username : facultyEmail;
    const facultyPassword = f.password || f.subject || 'CS401';

    return {
      ...f,
      email: facultyEmail,
      username: facultyUsername,
      password: facultyPassword,
      divisions: f.divisions && f.divisions.length > 0 ? f.divisions : (defaultDivisions[i % defaultDivisions.length] || ['TY-A', 'TY-B'])
    };
  });

  res.json({ success: true, faculty: enrichedFaculty });
}

export function registerFaculty(req, res) {
  const { name, email, dept, subject, divisions, username, password } = req.body;
  const store = getStore();

  if (!name || !subject || !divisions) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: Name, single Subject, and at least one Division are required.'
    });
  }

  const divList = Array.isArray(divisions) ? divisions : [divisions];
  if (divList.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please assign at least one division to this faculty.'
    });
  }

  const newId = `FAC${String((store.faculty || []).length + 1).padStart(2, '0')}`;
  const cleanName = name.toLowerCase().replace(/^prof\.\s*|^dr\.\s*/i, '').trim().replace(/\s+/g, '.');
  const assignedEmail = email && email.trim() ? email.trim() : `${cleanName || username || 'faculty'}@vit.edu`;
  const facultyUsername = username && username.trim() ? (username.includes('@vit.edu') ? username.trim() : `${username.trim()}@vit.edu`) : assignedEmail;
  const facultyPassword = password && password.trim() ? password.trim() : subject.trim();

  const newFaculty = {
    id: newId,
    name: name.trim(),
    email: assignedEmail,
    dept: dept ? dept.trim() : 'Computer Science & Engineering',
    role: 'faculty',
    subject: subject.trim(),
    divisions: divList,
    username: facultyUsername,
    password: facultyPassword
  };

  store.faculty.push(newFaculty);

  // Automatically allot timetable slots for newly registered faculty
  if (store.timetable) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['09:30 AM - 10:30 AM', '11:00 AM - 12:00 PM', '01:30 PM - 02:30 PM', '03:00 PM - 04:00 PM'];
    const rooms = ['Hall 201', 'Hall 202', 'Hall 203', 'Lab 1', 'Lab 2'];

    divList.forEach((div, divIdx) => {
      const day = days[divIdx % days.length];
      const time = times[(divIdx + 1) % times.length];
      const room = rooms[(divIdx + 2) % rooms.length];
      store.timetable.push({
        id: `TT_${newId}_${div}_${Date.now()}`,
        day,
        time,
        subject: newFaculty.subject,
        subjectName: (store.subjects?.find(s => s.code === newFaculty.subject)?.name) || 'Academic Course',
        division: div,
        facultyId: newId,
        facultyName: newFaculty.name,
        room
      });
    });
  }

  const userEntry = {
    id: `USR_${newId}`,
    username: username.trim(),
    role: 'faculty',
    facultyId: newId,
    name: name.trim(),
    email: newFaculty.email,
    password: password.trim()
  };

  const existingUserIndex = store.users.findIndex(u => u.username === username.trim());
  if (existingUserIndex >= 0) {
    store.users[existingUserIndex] = userEntry;
  } else {
    store.users.push(userEntry);
  }

  persistDatabase();
  writeLog('application', `Admin registered faculty ${newFaculty.name} (${newFaculty.id}) with subject ${newFaculty.subject}`);

  res.status(201).json({
    success: true,
    message: 'Faculty registered successfully by College Administration.',
    faculty: newFaculty
  });
}

export function deleteFaculty(req, res) {
  const { id } = req.params;
  const store = getStore();

  const index = (store.faculty || []).findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Faculty not found' });
  }

  const removed = store.faculty.splice(index, 1)[0];
  store.users = store.users.filter(u => u.facultyId !== id && u.username !== removed.username);
  if (store.timetable) {
    store.timetable = store.timetable.filter(t => t.facultyId !== id);
  }

  persistDatabase();
  writeLog('application', `Admin removed faculty ${removed.name} (${id})`);

  res.json({
    success: true,
    message: `Faculty ${removed.name} unregistered successfully.`
  });
}

// ---------------- Timetable Allotment Engine ---------------- //

function generateInitialTimetable(faculties, subjects) {
  const timeSlots = [
    '09:30 AM - 10:30 AM',
    '11:00 AM - 12:00 PM',
    '01:30 PM - 02:30 PM',
    '03:00 PM - 04:00 PM'
  ];
  const rooms = ['Hall 201', 'Hall 202', 'Hall 203', 'Lab 1', 'Lab 2', 'Lab 3'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const slots = [];
  let idCount = 1;

  faculties.forEach((fac, facIdx) => {
    const subObj = subjects.find(s => s.code === fac.subject) || { code: fac.subject, name: 'Core Course' };
    const divisions = fac.divisions || ['TY-A', 'TY-B'];

    divisions.forEach((div, divIdx) => {
      // Allot 2 distinct lecture sessions across the week for each division
      [0, 2].forEach((offset) => {
        const day = days[(facIdx + divIdx + offset) % days.length];
        const time = timeSlots[(facIdx + divIdx + offset) % timeSlots.length];
        const room = rooms[(facIdx + divIdx) % rooms.length];

        slots.push({
          id: `TT_${String(idCount++).padStart(3, '0')}`,
          day,
          time,
          subject: fac.subject,
          subjectName: subObj.name,
          division: div,
          facultyId: fac.id,
          facultyName: fac.name,
          room
        });
      });
    });
  });

  return slots;
}

export function getTimetable(req, res) {
  const store = getStore();

  if (!store.timetable || store.timetable.length === 0) {
    store.timetable = generateInitialTimetable(store.faculty || [], store.subjects || []);
    store.timetableInfo = {
      fileName: 'Semester_VI_Official_Academic_Timetable.pdf',
      fileSize: '320 KB',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'College Administration',
      status: 'Active & Allotted to Faculties'
    };
    persistDatabase();
  }

  res.json({
    success: true,
    timetable: store.timetable,
    timetableInfo: store.timetableInfo || {
      fileName: 'Semester_VI_Official_Academic_Timetable.pdf',
      fileSize: '320 KB',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'College Administration',
      status: 'Active & Allotted to Faculties'
    }
  });
}

export function uploadTimetable(req, res) {
  const { fileName, fileSize, division = 'All Divisions', customSlots } = req.body;
  const store = getStore();

  store.timetableInfo = {
    fileName: fileName || 'Semester_VI_Master_Timetable.pdf',
    fileSize: fileSize || '342 KB',
    division: division || 'All Divisions',
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'College Administration',
    status: `Verified & Allotted for ${division}`
  };

  const allGeneratedSlots = generateInitialTimetable(store.faculty || [], store.subjects || []);

  if (customSlots && Array.isArray(customSlots) && customSlots.length > 0) {
    store.timetable = customSlots;
  } else if (division && division !== 'All Divisions') {
    // Retain existing slots for other divisions and replace for this division
    const otherDivisionSlots = (store.timetable || []).filter(s => s.division !== division);
    const newDivisionSlots = allGeneratedSlots.filter(s => s.division === division);
    store.timetable = [...otherDivisionSlots, ...newDivisionSlots];
  } else {
    // Regenerate and allot slots for all divisions
    store.timetable = allGeneratedSlots;
  }

  persistDatabase();
  writeLog('application', `College Administration uploaded Timetable PDF: ${store.timetableInfo.fileName} for division ${division}`);

  res.json({
    success: true,
    message: `Timetable PDF "${store.timetableInfo.fileName}" uploaded successfully for ${division}. Lecture slots allotted to faculties.`,
    timetable: store.timetable,
    timetableInfo: store.timetableInfo
  });
}
