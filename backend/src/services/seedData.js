export function generateSeedData() {
  const subjects = [
    { code: 'CS401', name: 'Operating Systems', credits: 4, conducted: 40, facultyId: 'FAC01' },
    { code: 'CS402', name: 'Database Management Systems', credits: 4, conducted: 38, facultyId: 'FAC02' },
    { code: 'CS403', name: 'Data Structures & Algorithms', credits: 4, conducted: 42, facultyId: 'FAC03' },
    { code: 'CS404', name: 'Computer Networks', credits: 3, conducted: 36, facultyId: 'FAC04' },
    { code: 'CS405', name: 'Artificial Intelligence & ML', credits: 3, conducted: 35, facultyId: 'FAC05' }
  ];

  const faculty = [
    { id: 'FAC01', name: 'Prof. Arvind Sharma', email: 'arvind.sharma@vit.edu', dept: 'Computer Science', role: 'faculty', subject: 'CS401', username: 'arvind.sharma@vit.edu', password: 'CS401', divisions: ['TY-A', 'TY-B'] },
    { id: 'FAC02', name: 'Dr. Priya Kulkarni', email: 'priya.kulkarni@vit.edu', dept: 'Computer Science', role: 'faculty', subject: 'CS402', username: 'priya.kulkarni@vit.edu', password: 'CS402', divisions: ['TY-B', 'TY-C'] },
    { id: 'FAC03', name: 'Prof. Rajesh Menon', email: 'rajesh.menon@vit.edu', dept: 'Information Tech', role: 'faculty', subject: 'CS403', username: 'rajesh.menon@vit.edu', password: 'CS403', divisions: ['TY-A', 'TY-C'] },
    { id: 'FAC04', name: 'Dr. Sunita Deshmukh', email: 'sunita.deshmukh@vit.edu', dept: 'Computer Science', role: 'faculty', subject: 'CS404', username: 'sunita.deshmukh@vit.edu', password: 'CS404', divisions: ['TY-A', 'TY-B', 'TY-C'] },
    { id: 'FAC05', name: 'Prof. Vikram Roy', email: 'vikram.roy@vit.edu', dept: 'Data Science', role: 'faculty', subject: 'CS405', username: 'vikram.roy@vit.edu', password: 'CS405', divisions: ['TY-A'] },
    { id: 'FAC06', name: 'Dr. Ananya Sen', email: 'ananya.sen@vit.edu', dept: 'Computer Science', role: 'faculty', subject: 'CS401', username: 'ananya.sen@vit.edu', password: 'CS401', divisions: ['TY-C'] },
    { id: 'FAC07', name: 'Prof. Suresh Nair', email: 'suresh.nair@vit.edu', dept: 'Information Tech', role: 'faculty', subject: 'CS402', username: 'suresh.nair@vit.edu', password: 'CS402', divisions: ['TY-A'] },
    { id: 'FAC08', name: 'Dr. Neha Kapoor', email: 'neha.kapoor@vit.edu', dept: 'Computer Science', role: 'faculty', subject: 'CS403', username: 'neha.kapoor@vit.edu', password: 'CS403', divisions: ['TY-B'] },
    { id: 'FAC09', name: 'Prof. Tanmay Bhat', email: 'tanmay.bhat@vit.edu', dept: 'Computer Science', role: 'faculty', subject: 'CS404', username: 'tanmay.bhat@vit.edu', password: 'CS404', divisions: ['TY-B', 'TY-C'] },
    { id: 'FAC10', name: 'Dr. Rohit Joshi', email: 'rohit.joshi@vit.edu', dept: 'Artificial Intelligence', role: 'faculty', subject: 'CS405', username: 'rohit.joshi@vit.edu', password: 'CS405', divisions: ['TY-B', 'TY-C'] }
  ];

  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Rudra', 'Aryan', 'Ayush', 'Kabir', 'Ananya', 'Diya', 'Gauri', 'Isha',
    'Kavya', 'Khushi', 'Mira', 'Navya', 'Pari', 'Prisha', 'Riya', 'Saanvi', 'Tanvi', 'Vanya',
    'Abhinav', 'Advait', 'Dhruv', 'Harsh', 'Manav', 'Pranav', 'Rohan', 'Samarth', 'Siddharth', 'Yash'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Joshi', 'Kulkarni', 'Deshmukh', 'Mehta', 'Nair', 'Menon', 'Gupta',
    'Iyer', 'Bhat', 'Rao', 'Chavan', 'Pawar', 'More', 'Shinde', 'Gaikwad', 'Jadhav', 'Bhosale'
  ];

  const divisions = ['TY-A', 'TY-B', 'TY-C'];
  const students = [];

  // Generate 105 realistic students
  let count = 0;
  for (let d = 0; d < divisions.length; d++) {
    const div = divisions[d];
    for (let i = 1; i <= 35; i++) {
      count++;
      const fn = firstNames[(count * 7) % firstNames.length];
      const ln = lastNames[(count * 13) % lastNames.length];
      const roll = `TY${div.slice(-1)}${String(i).padStart(2, '0')}`;
      const id = `STU${1000 + count}`;

      // Distribute attendance realistic pattern:
      // ~70% good (>= 75%), ~15% warning (65-74%), ~15% critical defaulter (< 65%)
      let attendedFactor;
      if (count % 7 === 0) {
        attendedFactor = 0.52 + ((count % 10) * 0.01); // Critical defaulter (52% - 61%)
      } else if (count % 5 === 0) {
        attendedFactor = 0.67 + ((count % 7) * 0.01); // Warning defaulter (67% - 73%)
      } else {
        attendedFactor = 0.78 + ((count % 18) * 0.01); // Eligible (78% - 95%)
      }

      const subjectAttendance = {};
      let totalAttended = 0;
      let totalConducted = 0;

      subjects.forEach(sub => {
        // slight jitter per subject
        const jitter = ((count + sub.credits) % 5 - 2) * 0.03;
        const subFactor = Math.min(0.98, Math.max(0.40, attendedFactor + jitter));
        const att = Math.round(sub.conducted * subFactor);
        subjectAttendance[sub.code] = {
          attended: att,
          conducted: sub.conducted,
          percentage: Number(((att / sub.conducted) * 100).toFixed(1))
        };
        totalAttended += att;
        totalConducted += sub.conducted;
      });

      const overallPercentage = Number(((totalAttended / totalConducted) * 100).toFixed(1));
      let status = 'Eligible';
      if (overallPercentage < 65) status = 'Critical';
      else if (overallPercentage < 75) status = 'Warning';

      students.push({
        id,
        rollNumber: roll,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.vit.edu`,
        division: div,
        totalClassesConducted: totalConducted,
        totalClassesAttended: totalAttended,
        overallPercentage,
        status,
        subjectAttendance
      });
    }
  }

  // Sample Users for Role-based Access
  const users = [
    { id: 'USR_ADMIN', username: 'administration@vit.edu', role: 'admin', name: 'College Administration', email: 'administration@vit.edu', password: 'vit_college_pune' },
    ...faculty.map(f => ({
      id: `USR_${f.id}`,
      username: f.username,
      role: 'faculty',
      facultyId: f.id,
      name: f.name,
      email: f.email,
      password: f.password
    }))
  ];

  return { subjects, faculty, students, users, divisions };
}
