import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Class, Student } from '../types';
import { AttendanceStatus } from '../types';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classId: string, students: Student[]) => void;
  classData: Class | null;
}

const statusConfig = {
    [AttendanceStatus.Present]: { label: '출석', color: 'bg-emerald-500', next: AttendanceStatus.Late },
    [AttendanceStatus.Late]: { label: '지각', color: 'bg-yellow-500', next: AttendanceStatus.Absent },
    [AttendanceStatus.Absent]: { label: '결석', color: 'bg-rose-500', next: AttendanceStatus.Unchecked },
    [AttendanceStatus.Unchecked]: { label: '확인중', color: 'bg-slate-400', next: AttendanceStatus.Present },
};


const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, onSave, classData }) => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (isOpen && classData) {
      setStudents(classData.students);
    }
  }, [isOpen, classData]);

  const handleSave = useCallback(() => {
    if (classData) {
      onSave(classData.id, students);
    }
  }, [classData, students, onSave]);

  const handleStudentStatusChange = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const currentStatus = s.attendance;
        const nextStatus = statusConfig[currentStatus].next;
        return { ...s, attendance: nextStatus };
      }
      return s;
    }));
  };
  
  const handleMarkAllPresent = () => {
      setStudents(prev => prev.map(s => ({ ...s, attendance: AttendanceStatus.Present })));
  };

  const summary = useMemo(() => {
      return students.reduce((acc, student) => {
          if(student.attendance === AttendanceStatus.Present) acc.present++;
          else if(student.attendance === AttendanceStatus.Absent) acc.absent++;
          else if(student.attendance === AttendanceStatus.Late) acc.late++;
          return acc;
      }, { present: 0, absent: 0, late: 0 });
  }, [students]);

  if (!isOpen || !classData) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
        `}</style>

        <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{classData.name} 출결체크</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <button 
            onClick={handleMarkAllPresent}
            className="w-full py-2.5 mb-4 rounded-lg text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors"
        >
            전체 출석 처리
        </button>

        <div className="mb-4 flex justify-between items-center text-sm font-medium">
            <h3 className="text-slate-600 dark:text-slate-300">{classData.name} ({classData.time})</h3>
            <div className="flex space-x-3">
                <span className="text-emerald-500">출석 {summary.present}</span>
                <span className="text-rose-500">결석 {summary.absent}</span>
                <span className="text-yellow-500">지각 {summary.late}</span>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
            {students.map(student => (
                <div key={student.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{student.name}</span>
                    <button 
                        onClick={() => handleStudentStatusChange(student.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-md flex items-center space-x-1 ${
                            student.attendance === AttendanceStatus.Unchecked 
                            ? 'text-slate-500 bg-white border border-slate-300 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200' 
                            : 'text-white'
                        } ${statusConfig[student.attendance].color}`}
                    >
                         {student.attendance === AttendanceStatus.Unchecked && <span className="text-red-500 font-bold mr-1">?</span>}
                         <span>{statusConfig[student.attendance].label}</span>
                    </button>
                </div>
            ))}
        </div>
        
        <button
          onClick={handleSave}
          className="w-full px-6 py-3 rounded-lg text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
        >
          출석 저장하기
        </button>
      </div>
    </div>
  );
};

export default AttendanceModal;