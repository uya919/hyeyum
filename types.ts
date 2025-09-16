export enum AttendanceStatus {
  Present = '출석',
  Absent = '결석',
  Late = '지각',
  Unchecked = '확인중',
}

export interface User {
  id: string;
  loginId: string;
  name: string;
  role: 'director' | 'teacher';
}

export interface Student {
  id: string;
  name: string;
  attendance: AttendanceStatus;
  lastAttended: string;
}

export interface ClassRecord {
  date: string; // YYYY-MM-DD
  progressTextbook: string;
  progressRange: string;
  homeworkTextbook: string;
  homeworkRange: string;
  memo: string;
  isCompleted: boolean;
}

export interface Class {
  id: string;
  name: string;
  time: string;
  teacherId?: string;
  students: Student[];
  records: ClassRecord[];
  progressTextbooks: string[];
  homeworkTextbooks: string[];
}

export interface AttendanceSummary {
  classId: string;
  className: string;
  time: string;
  present: number;
  absent: number;
  late: number;
}