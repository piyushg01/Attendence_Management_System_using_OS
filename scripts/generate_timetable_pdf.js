import fs from 'fs';
import path from 'path';

function createPdf() {
  const content = [];
  
  // Helper to draw text
  function text(str, x, y, size = 11, font = 'F1') {
    return `BT /${font} ${size} Tf ${x} ${y} Td (${str.replace(/[()\\]/g, '\\$&')}) Tj ET`;
  }

  // Helper to draw line
  function line(x1, y1, x2, y2, width = 1) {
    return `${width} w ${x1} ${y1} m ${x2} ${y2} l S`;
  }

  // Helper to draw filled rect
  function fillRect(x, y, w, h, r, g, b) {
    return `${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f 0 0 0 rg`;
  }

  // Page 1: Header and Timetable
  const streamLines = [
    // Background bar
    fillRect(40, 785, 532, 45, 0.31, 0.27, 0.89), // Indigo header
    `1 1 1 rg`,
    text("METROPOLITAN INSTITUTE OF TECHNOLOGY", 110, 808, 16, "F2"),
    text("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING", 130, 794, 11, "F1"),
    `0 0 0 rg`,

    // Title
    text("ACADEMIC MASTER TIMETABLE -- SPRING SEMESTER VI (2026)", 85, 760, 13, "F2"),
    text("Approved by: Academic Council & College Administration | Effective: Jan 2026", 115, 746, 9, "F1"),
    line(40, 738, 572, 738, 1.5),

    // Faculty Mapping Box
    fillRect(40, 680, 532, 50, 0.96, 0.97, 0.99),
    text("FACULTY COURSE ASSIGNMENT SUMMARY:", 48, 718, 10, "F2"),
    text("CS401: Operating Systems -- Prof. Arvind Sharma (TY-A, TY-B) | CS402: DBMS -- Dr. Priya Kulkarni (TY-B, TY-C)", 48, 703, 8.5, "F1"),
    text("CS403: Data Structures -- Prof. Rajesh Menon (TY-A, TY-C) | CS404: Networks -- Dr. Sunita Deshmukh (TY-B)", 48, 690, 8.5, "F1"),

    // DIVISION TY-A HEADER
    fillRect(40, 645, 532, 22, 0.92, 0.94, 0.98),
    text("DIVISION TY-A  |  Room: Hall 202 & Lab 2  |  Class Strength: 35 Students", 50, 652, 10, "F2"),

    // Table Header TY-A
    fillRect(40, 622, 532, 18, 0.88, 0.90, 0.96),
    text("DAY", 48, 627, 8.5, "F2"),
    text("09:30 - 10:30 AM", 110, 627, 8.5, "F2"),
    text("11:00 - 12:00 PM", 230, 627, 8.5, "F2"),
    text("01:30 - 02:30 PM", 350, 627, 8.5, "F2"),
    text("03:00 - 04:00 PM", 470, 627, 8.5, "F2"),

    // Rows for TY-A
    text("Monday", 48, 608, 8, "F2"),
    text("CS402: DBMS (Dr. Priya)", 110, 608, 7.5, "F1"),
    text("CS401: OS (Prof. Sharma)", 230, 608, 7.5, "F1"),
    text("CS403: DSA (Prof. Menon)", 350, 608, 7.5, "F1"),
    text("CS405: AI (Prof. Roy)", 470, 608, 7.5, "F1"),
    line(40, 602, 572, 602, 0.5),

    text("Tuesday", 48, 590, 8, "F2"),
    text("CS401: OS (Prof. Sharma)", 110, 590, 7.5, "F1"),
    text("CS403: DSA (Prof. Menon)", 230, 590, 7.5, "F1"),
    text("CS404: CN Lab (Dr. Sunita)", 350, 590, 7.5, "F1"),
    text("CS401: OS Tutorial", 470, 590, 7.5, "F1"),
    line(40, 584, 572, 584, 0.5),

    text("Wednesday", 48, 572, 8, "F2"),
    text("CS403: DSA (Prof. Menon)", 110, 572, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 230, 572, 7.5, "F1"),
    text("CS401: OS (Prof. Sharma)", 350, 572, 7.5, "F1"),
    text("Library / Seminar", 470, 572, 7.5, "F1"),
    line(40, 566, 572, 566, 0.5),

    text("Thursday", 48, 554, 8, "F2"),
    text("CS401: OS (Prof. Sharma)", 110, 554, 7.5, "F1"),
    text("CS404: CN (Dr. Sunita)", 230, 554, 7.5, "F1"),
    text("CS405: AI (Prof. Roy)", 350, 554, 7.5, "F1"),
    text("CS402: DBMS Lab", 470, 554, 7.5, "F1"),
    line(40, 548, 572, 548, 0.5),

    text("Friday", 48, 536, 8, "F2"),
    text("CS402: DBMS (Dr. Priya)", 110, 536, 7.5, "F1"),
    text("CS403: DSA (Prof. Menon)", 230, 536, 7.5, "F1"),
    text("CS401: OS Lab (Sharma)", 350, 536, 7.5, "F1"),
    text("Sports / Mentoring", 470, 536, 7.5, "F1"),
    line(40, 530, 572, 530, 1),

    // DIVISION TY-B HEADER
    fillRect(40, 495, 532, 22, 0.92, 0.94, 0.98),
    text("DIVISION TY-B  |  Room: Hall 201 & Lab 1  |  Class Strength: 35 Students", 50, 502, 10, "F2"),

    // Table Header TY-B
    fillRect(40, 472, 532, 18, 0.88, 0.90, 0.96),
    text("DAY", 48, 477, 8.5, "F2"),
    text("09:30 - 10:30 AM", 110, 477, 8.5, "F2"),
    text("11:00 - 12:00 PM", 230, 477, 8.5, "F2"),
    text("01:30 - 02:30 PM", 350, 477, 8.5, "F2"),
    text("03:00 - 04:00 PM", 470, 477, 8.5, "F2"),

    // Rows for TY-B
    text("Monday", 48, 458, 8, "F2"),
    text("CS401: OS (Prof. Sharma)", 110, 458, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 230, 458, 7.5, "F1"),
    text("CS404: CN (Dr. Sunita)", 350, 458, 7.5, "F1"),
    text("CS403: DSA (Prof. Menon)", 470, 458, 7.5, "F1"),
    line(40, 452, 572, 452, 0.5),

    text("Tuesday", 48, 440, 8, "F2"),
    text("CS402: DBMS (Dr. Priya)", 110, 440, 7.5, "F1"),
    text("CS401: OS (Prof. Sharma)", 230, 440, 7.5, "F1"),
    text("CS405: AI (Prof. Roy)", 350, 440, 7.5, "F1"),
    text("CS404: CN Lab", 470, 440, 7.5, "F1"),
    line(40, 434, 572, 434, 0.5),

    text("Wednesday", 48, 422, 8, "F2"),
    text("CS401: OS (Prof. Sharma)", 110, 422, 7.5, "F1"),
    text("CS404: CN (Dr. Sunita)", 230, 422, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 350, 422, 7.5, "F1"),
    text("CS401: OS Lab", 470, 422, 7.5, "F1"),
    line(40, 416, 572, 416, 0.5),

    text("Thursday", 48, 404, 8, "F2"),
    text("CS403: DSA (Prof. Menon)", 110, 404, 7.5, "F1"),
    text("CS401: OS (Prof. Sharma)", 230, 404, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 350, 404, 7.5, "F1"),
    text("Library / Seminar", 470, 404, 7.5, "F1"),
    line(40, 398, 572, 398, 0.5),

    text("Friday", 48, 386, 8, "F2"),
    text("CS401: OS (Prof. Sharma)", 110, 386, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 230, 386, 7.5, "F1"),
    text("CS404: CN (Dr. Sunita)", 350, 386, 7.5, "F1"),
    text("Mentoring / Projects", 470, 386, 7.5, "F1"),
    line(40, 380, 572, 380, 1),

    // DIVISION TY-C HEADER
    fillRect(40, 345, 532, 22, 0.92, 0.94, 0.98),
    text("DIVISION TY-C  |  Room: Hall 104 & Lab 3  |  Class Strength: 35 Students", 50, 352, 10, "F2"),

    // Table Header TY-C
    fillRect(40, 322, 532, 18, 0.88, 0.90, 0.96),
    text("DAY", 48, 327, 8.5, "F2"),
    text("09:30 - 10:30 AM", 110, 327, 8.5, "F2"),
    text("11:00 - 12:00 PM", 230, 327, 8.5, "F2"),
    text("01:30 - 02:30 PM", 350, 327, 8.5, "F2"),
    text("03:00 - 04:00 PM", 470, 327, 8.5, "F2"),

    // Rows for TY-C
    text("Monday", 48, 308, 8, "F2"),
    text("CS403: DSA (Prof. Menon)", 110, 308, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 230, 308, 7.5, "F1"),
    text("CS404: CN (Dr. Sunita)", 350, 308, 7.5, "F1"),
    text("CS405: AI (Prof. Roy)", 470, 308, 7.5, "F1"),
    line(40, 302, 572, 302, 0.5),

    text("Tuesday", 48, 290, 8, "F2"),
    text("CS404: CN (Dr. Sunita)", 110, 290, 7.5, "F1"),
    text("CS403: DSA (Prof. Menon)", 230, 290, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 350, 290, 7.5, "F1"),
    text("CS405: AI Lab", 470, 290, 7.5, "F1"),
    line(40, 284, 572, 284, 0.5),

    text("Wednesday", 48, 272, 8, "F2"),
    text("CS402: DBMS (Dr. Priya)", 110, 272, 7.5, "F1"),
    text("CS403: DSA (Prof. Menon)", 230, 272, 7.5, "F1"),
    text("CS405: AI (Prof. Roy)", 350, 272, 7.5, "F1"),
    text("CS404: CN Lab", 470, 272, 7.5, "F1"),
    line(40, 266, 572, 266, 0.5),

    text("Thursday", 48, 254, 8, "F2"),
    text("CS405: AI (Prof. Roy)", 110, 254, 7.5, "F1"),
    text("CS402: DBMS (Dr. Priya)", 230, 254, 7.5, "F1"),
    text("CS403: DSA (Prof. Menon)", 350, 254, 7.5, "F1"),
    text("Library / Seminar", 470, 254, 7.5, "F1"),
    line(40, 248, 572, 248, 0.5),

    text("Friday", 48, 236, 8, "F2"),
    text("CS403: DSA (Prof. Menon)", 110, 236, 7.5, "F1"),
    text("CS404: CN (Dr. Sunita)", 230, 236, 7.5, "F1"),
    text("CS402: DBMS Lab", 350, 236, 7.5, "F1"),
    text("Mentoring / Reviews", 470, 236, 7.5, "F1"),
    line(40, 230, 572, 230, 1),

    // Footer
    fillRect(40, 60, 532, 25, 0.96, 0.97, 0.99),
    text("Verified by Registrar & Dean of Academic Affairs | Metropolitan Institute of Technology", 95, 70, 8.5, "F1"),
    text("Attendance Requirement: Minimum 75% per course to qualify for University Final Examination", 92, 50, 7.5, "F2")
  ];

  const stream = streamLines.join('\n');
  const streamLength = Buffer.byteLength(stream, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /MediaBox [0 0 612 850]
   /Resources <<
     /Font <<
       /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
       /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
     >>
   >>
   /Contents 4 0 R
>>
endobj

4 0 obj
<< /Length ${streamLength} >>
stream
${stream}
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000306 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${370 + streamLength}
%%EOF`;

  return pdf;
}

const pdfData = createPdf();

// Save to frontend/public
const publicDir = path.resolve('frontend/public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'Semester_VI_Master_Timetable.pdf'), pdfData, 'utf-8');

// Save to data/reports
const reportsDir = path.resolve('data/reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(path.join(reportsDir, 'Semester_VI_Master_Timetable.pdf'), pdfData, 'utf-8');

console.log('Successfully generated official Semester_VI_Master_Timetable.pdf in frontend/public and data/reports!');
