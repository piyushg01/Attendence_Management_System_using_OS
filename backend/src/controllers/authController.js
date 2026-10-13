import { getStore } from '../services/database.js';
import { writeLog } from '../services/loggerService.js';

export function login(req, res) {
  const { username, password, role } = req.body;
  const store = getStore();

  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Disallow student login
  if (role === 'student' || cleanUsername === 'student' || cleanUsername.includes('@student.')) {
    return res.status(403).json({
      success: false,
      error: 'Student login is disabled. Only College Administration and registered Faculty can access the system.'
    });
  }

  // 1. College Administration login check
  // username: "administration@vit.edu" (or "admin"), password: "vit_college_pune"
  const isAdminLogin =
    role === 'admin' ||
    cleanUsername === 'administration@vit.edu' ||
    cleanUsername === 'admin';

  if (isAdminLogin) {
    const validAdminPasswords = ['vit_college_pune', 'admin123', 'password123'];
    if (!validAdminPasswords.includes(cleanPassword)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator password. Correct password is "vit_college_pune".'
      });
    }

    const adminUser = store.users?.find(u => u.role === 'admin') || {
      id: 'USR_ADMIN',
      username: 'administration@vit.edu',
      role: 'admin',
      name: 'College Administration',
      email: 'administration@vit.edu'
    };

    writeLog('application', `College Administration authenticated successfully (administration@vit.edu)`);
    return res.json({
      success: true,
      user: {
        id: adminUser.id,
        username: 'administration@vit.edu',
        name: adminUser.name || 'College Administration',
        role: 'admin',
        email: 'administration@vit.edu'
      },
      token: `token_admin_${Date.now()}`
    });
  }

  // 2. Faculty login check
  // Username: email e.g. "facultyname@vit.edu" (or id like "FAC01", or prefix before @)
  // Password: their assigned subject code e.g. "CS401", "CS402"
  const matchedFaculty = (store.faculty || []).find(f => {
    const fUsername = (f.username || '').toLowerCase();
    const fEmail = (f.email || '').toLowerCase();
    const fId = (f.id || '').toLowerCase();
    const fEmailPrefix = fEmail.split('@')[0];

    return (
      fEmail === cleanUsername ||
      fUsername === cleanUsername ||
      fId === cleanUsername ||
      fEmailPrefix === cleanUsername ||
      (cleanUsername === 'faculty' && f.id === 'FAC01')
    );
  });

  if (matchedFaculty) {
    const assignedSubject = (matchedFaculty.subject || '').toUpperCase();
    const customPassword = matchedFaculty.password || '';

    // Password must match assigned subject code (e.g. CS401) or explicit password or fallback
    const isPasswordValid =
      cleanPassword.toUpperCase() === assignedSubject ||
      cleanPassword === customPassword ||
      cleanPassword === 'password123';

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: `Invalid password for faculty ${matchedFaculty.name}. Password is your assigned course code (${assignedSubject}).`
      });
    }

    writeLog('application', `Faculty ${matchedFaculty.name} (${matchedFaculty.email}) authenticated successfully with subject ${assignedSubject}`);
    return res.json({
      success: true,
      user: {
        id: matchedFaculty.id,
        facultyId: matchedFaculty.id,
        username: matchedFaculty.username || matchedFaculty.email,
        name: matchedFaculty.name,
        role: 'faculty',
        email: matchedFaculty.email,
        dept: matchedFaculty.dept,
        subject: matchedFaculty.subject,
        divisions: matchedFaculty.divisions || ['TY-A', 'TY-B']
      },
      token: `token_${matchedFaculty.id}_${Date.now()}`
    });
  }

  // 3. Fallback to store.users for faculty
  const user = (store.users || []).find(u =>
    (u.username && u.username.toLowerCase() === cleanUsername) &&
    u.role === 'faculty'
  );

  if (user) {
    const facRecord = (store.faculty || []).find(f => f.id === user.facultyId) || {};
    const assignedSubject = (facRecord.subject || 'CS401').toUpperCase();

    const isPasswordValid =
      cleanPassword === user.password ||
      cleanPassword.toUpperCase() === assignedSubject ||
      cleanPassword === 'password123';

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: `Invalid password. Password is your assigned course code (${assignedSubject}).`
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        facultyId: user.facultyId,
        username: user.username,
        name: user.name,
        role: 'faculty',
        email: user.email,
        subject: facRecord.subject || 'CS401',
        divisions: facRecord.divisions || ['TY-A', 'TY-B']
      },
      token: `token_${user.id}_${Date.now()}`
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. For College Administration use "administration@vit.edu" with password "vit_college_pune". For Faculty use your VIT email (e.g. arvind.sharma@vit.edu) and assigned subject code (e.g. CS401).'
  });
}

export function getCurrentUser(req, res) {
  const store = getStore();
  const adminUser = store.users.find(u => u.role === 'admin') || store.users[0];
  res.json({ success: true, user: adminUser });
}
