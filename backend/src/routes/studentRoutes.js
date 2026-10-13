import express from 'express';
import {
  getAllStudents,
  getStudentById,
  getSubjects,
  getFaculty,
  registerFaculty,
  deleteFaculty,
  getTimetable,
  uploadTimetable
} from '../controllers/studentController.js';

const router = express.Router();

router.get('/timetable', getTimetable);
router.post('/timetable/upload', uploadTimetable);

router.get('/', getAllStudents);
router.get('/subjects', getSubjects);
router.get('/faculty', getFaculty);
router.post('/faculty', registerFaculty);
router.delete('/faculty/:id', deleteFaculty);
router.get('/:id', getStudentById);

export default router;
