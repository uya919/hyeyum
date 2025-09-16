import React from 'react';
import type { Class, ClassRecord } from '../types';

interface ClassListItemProps {
  classInfo: Class;
  record: ClassRecord;
  onAttendanceClick: (classInfo: Class) => void;
  onProgressClick: (classInfo: Class, record: ClassRecord) => void;
  onClassClick: (classInfo: Class) => void;
}

const ClassListItem: React.FC<ClassListItemProps> = ({ classInfo, record, onAttendanceClick, onProgressClick, onClassClick }) => {
  return (
    <li className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <div 
        className="flex items-start justify-between mb-3 cursor-pointer"
        onClick={() => onClassClick(classInfo)}
        onKeyPress={(e) => { if (e.key === 'Enter') onClassClick(classInfo); }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{classInfo.time}</span>
            <div className="flex items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{classInfo.name}</h3>
                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-md ml-2">
                    외 {classInfo.students.length}명
                </span>
            </div>
        </div>
        {record.isCompleted && <span className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">완료</span>}
      </div>
      
      <div 
        className="text-sm text-slate-500 dark:text-slate-400 space-y-1 mb-4 ml-10 cursor-pointer"
        onClick={() => onClassClick(classInfo)}
        onKeyPress={(e) => { if (e.key === 'Enter') onClassClick(classInfo); }}
        role="button"
        tabIndex={-1}
      >
        <p>진도: {record.progressTextbook} P{record.progressRange}</p>
        <p>숙제: {record.homeworkTextbook} P{record.homeworkRange}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
            onClick={() => onAttendanceClick(classInfo)}
            className="w-full py-2.5 rounded-lg text-sm font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
            출결
        </button>
        <button 
            onClick={() => onProgressClick(classInfo, record)}
            className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
            진도 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </li>
  );
};

export default ClassListItem;