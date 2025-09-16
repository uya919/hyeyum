import React, { useState, useEffect, useCallback } from 'react';
import type { Student } from '../types';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id' | 'attendance'>) => void;
  studentToEdit: Student | null;
}

const StudentEditModal: React.FC<StudentEditModalProps> = ({ isOpen, onClose, onSave, studentToEdit }) => {
  const [name, setName] = useState('');
  const [lastAttended, setLastAttended] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (studentToEdit) {
        setName(studentToEdit.name);
        setLastAttended(studentToEdit.lastAttended);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setName('');
        setLastAttended(today);
      }
    }
  }, [isOpen, studentToEdit]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      setError('학생 이름을 입력해주세요.');
      return;
    }
    if (!lastAttended) {
      setError('마지막 출석일을 입력해주세요.');
      return;
    }
    setError('');
    onSave({ name, lastAttended });
  }, [name, lastAttended, onSave]);

  if (!isOpen) {
    return null;
  }
  
  const isEditing = !!studentToEdit;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEditing ? '학생 정보 수정' : '새 학생 추가'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>
            <input
              type="text"
              id="studentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastAttended" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">마지막 출석일</label>
            <input
              type="date"
              id="lastAttended"
              value={lastAttended}
              onChange={(e) => setLastAttended(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        <button
          onClick={handleSave}
          className="w-full px-6 py-3 rounded-lg text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default StudentEditModal;
