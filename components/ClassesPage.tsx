import React, { useState, useMemo, useEffect } from 'react';
import type { Class, Student, ClassRecord, User } from '../types';
import ClassEditModal from './ClassEditModal';
import ClassDetailView from './ClassDetailView';

interface ClassesPageProps {
  classes: Class[];
  currentUser: User | null;
  users: User[];
  onAddClass: (classData: Omit<Class, 'id' | 'students' | 'records' | 'progressTextbooks' | 'homeworkTextbooks'>) => void;
  onUpdateClass: (classId: string, updatedData: Partial<Omit<Class, 'id' | 'students' | 'records' | 'progressTextbooks' | 'homeworkTextbooks'>>) => void;
  onDeleteClass: (classId: string) => void;
  onAddStudent: (classId: string, studentData: Omit<Student, 'id' | 'attendance'>) => void;
  onUpdateStudent: (classId: string, studentId: string, updatedData: Partial<Omit<Student, 'id' | 'attendance'>>) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  onAddRecord: (classId: string, newRecord: ClassRecord) => void;
  onUpdateRecord: (classId: string, recordDate: string, updatedData: Partial<Omit<ClassRecord, 'date'>>) => void;
  onDeleteRecord: (classId: string, recordDate: string) => void;
  onDeleteProgressTextbook: (classId: string, textbookName: string) => void;
  onDeleteHomeworkTextbook: (classId: string, textbookName: string) => void;
}

const ClassesPage: React.FC<ClassesPageProps> = ({ 
    classes, 
    currentUser,
    users,
    onAddClass, 
    onUpdateClass, 
    onDeleteClass, 
    onAddStudent, 
    onUpdateStudent, 
    onDeleteStudent,
    onAddRecord,
    onUpdateRecord,
    onDeleteRecord,
    onDeleteProgressTextbook,
    onDeleteHomeworkTextbook
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const selectedClass = useMemo(
    () => (selectedClassId ? classes.find(c => c.id === selectedClassId) : null),
    [classes, selectedClassId, users]
  );
  
  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return '미배정';
    return users.find(u => u.id === teacherId)?.name || '알 수 없음';
  };

  const handleOpenAddClassModal = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClassModal = (classInfo: Class) => {
    setEditingClass(classInfo);
    setIsClassModalOpen(true);
  };

  const handleDeleteClass = (classId: string) => {
    if (window.confirm('이 수업을 정말 삭제하시겠습니까? 모든 학생 및 진도 기록이 함께 삭제됩니다.')) {
      onDeleteClass(classId);
    }
  };
    
  const handleSaveClass = (classData: Omit<Class, 'id' | 'students' | 'records' | 'progressTextbooks' | 'homeworkTextbooks'>) => {
    if (editingClass) {
        onUpdateClass(editingClass.id, classData);
    } else {
        onAddClass(classData);
    }
    setIsClassModalOpen(false);
  };

  if (selectedClass) {
    const currentClassData = classes.find(c => c.id === selectedClass.id);
    if (!currentClassData) {
        setSelectedClassId(null);
        return null;
    }
    return <ClassDetailView 
        classInfo={currentClassData} 
        onBack={() => setSelectedClassId(null)}
        onAddStudent={onAddStudent}
        onUpdateStudent={onUpdateStudent}
        onDeleteStudent={onDeleteStudent}
        onAddRecord={onAddRecord}
        onUpdateRecord={onUpdateRecord}
        onDeleteRecord={onDeleteRecord}
        onDeleteProgressTextbook={onDeleteProgressTextbook}
        onDeleteHomeworkTextbook={onDeleteHomeworkTextbook}
    />;
  }

  return (
    <>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{currentUser?.role === 'director' ? '전체 수업 목록' : '내 수업 목록'}</h2>
            {(currentUser?.role === 'director' || currentUser?.role === 'teacher') && (
                <button onClick={handleOpenAddClassModal} className="px-4 py-2 text-sm font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600">
                    새 수업 추가
                </button>
            )}
        </div>
        <ul className="space-y-3">
            {classes.map(classInfo => {
                const canManageClass = currentUser?.role === 'director' || (currentUser?.role === 'teacher' && classInfo.teacherId === currentUser.id);

                return (
                    <li 
                        key={classInfo.id} 
                        className="group p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center"
                    >
                        <div 
                            className="flex-grow cursor-pointer"
                            onClick={() => setSelectedClassId(classInfo.id)}
                            onKeyPress={(e) => { if (e.key === 'Enter') setSelectedClassId(classInfo.id); }}
                            role="button"
                            tabIndex={0}
                        >
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{classInfo.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {classInfo.time} • {classInfo.students.length}명
                            {currentUser?.role === 'director' && (
                                <span className="ml-2 text-blue-500 font-medium">({getTeacherName(classInfo.teacherId)})</span>
                            )}
                        </p>
                        </div>
                        {canManageClass && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenEditClassModal(classInfo); }} 
                                    className="p-2 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                                    aria-label={`Edit ${classInfo.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClass(classInfo.id); }} 
                                    className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                                    aria-label={`Delete ${classInfo.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
        </div>
        <ClassEditModal 
            isOpen={isClassModalOpen}
            onClose={() => setIsClassModalOpen(false)}
            onSave={handleSaveClass}
            classToEdit={editingClass}
            currentUser={currentUser}
            users={users}
        />
    </>
  );
};

export default ClassesPage;