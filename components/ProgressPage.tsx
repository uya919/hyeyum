import React, { useState, useMemo, useEffect } from 'react';
import type { Class, ClassRecord } from '../types';
import ProgressRecordModal from './ProgressRecordModal';

interface ProgressPageProps {
  classes: Class[];
  onAddRecord: (classId: string, newRecord: ClassRecord) => void;
  onUpdateRecord: (classId: string, recordDate: string, updatedData: Partial<Omit<ClassRecord, 'date'>>) => void;
  onDeleteRecord: (classId: string, recordDate: string) => void;
  onDeleteProgressTextbook: (classId: string, textbookName: string) => void;
  onDeleteHomeworkTextbook: (classId: string, textbookName: string) => void;
}

const getWeeksOfMonth = (year: number, month: number) => { // month is 1-indexed
    const weeks = [];
    const firstDateOfMonth = new Date(year, month - 1, 1);
    const lastDateOfMonth = new Date(year, month, 0);

    let currentDate = new Date(firstDateOfMonth);
    let weekNumber = 1;

    while (currentDate <= lastDateOfMonth) {
        const dayOfWeek = currentDate.getDay(); // Sun: 0, Mon: 1
        const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() + offsetToMonday);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        weeks.push({
            weekNumber,
            start: weekStart,
            end: weekEnd,
        });
        
        currentDate = new Date(weekEnd);
        currentDate.setDate(currentDate.getDate() + 1);
        weekNumber++;
    }
    
    return weeks;
};

const getCurrentWeekNumber = (date: Date, weeks: { weekNumber: number; start: Date; end: Date }[]) => {
    for (const week of weeks) {
        if (date >= week.start && date <= week.end) {
            return week.weekNumber;
        }
    }
    return 'all';
};

const ProgressDetailView: React.FC<{ 
    classInfo: Class; 
    onBack: () => void;
    onAddRecord: (classId: string, newRecord: ClassRecord) => void;
    onUpdateRecord: (classId: string, recordDate: string, updatedData: Partial<Omit<ClassRecord, 'date'>>) => void;
    onDeleteRecord: (classId: string, recordDate: string) => void;
    onDeleteProgressTextbook: (classId: string, textbookName: string) => void;
    onDeleteHomeworkTextbook: (classId: string, textbookName: string) => void;
}> = ({ classInfo, onBack, onAddRecord, onUpdateRecord, onDeleteRecord, onDeleteProgressTextbook, onDeleteHomeworkTextbook }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ClassRecord | null>(null);

    const [filterMonth, setFilterMonth] = useState('');
    const [filterWeek, setFilterWeek] = useState('');

    const availableMonths = useMemo(() => {
        const months = new Set(classInfo.records.map(r => r.date.substring(0, 7))); // YYYY-MM
        return Array.from(months).sort().reverse();
    }, [classInfo.records]);

    const availableWeeks = useMemo(() => {
        if (!filterMonth || filterMonth === 'all') return [];
        const [year, month] = filterMonth.split('-').map(Number);
        return getWeeksOfMonth(year, month);
    }, [filterMonth]);

    useEffect(() => {
        const today = new Date();
        const currentMonthKey = today.toISOString().substring(0, 7);
        const weeksForCurrentMonth = getWeeksOfMonth(today.getFullYear(), today.getMonth() + 1);
        const currentWeek = getCurrentWeekNumber(today, weeksForCurrentMonth);

        setFilterMonth(currentMonthKey);
        setFilterWeek(String(currentWeek));
    }, []);

    const filteredAndSortedRecords = useMemo(() => {
        const selectedWeekData = filterWeek !== 'all' && availableWeeks
            ? availableWeeks.find(w => w.weekNumber === parseInt(filterWeek, 10))
            : null;

        return [...classInfo.records]
            .filter(record => {
                if (filterMonth !== 'all' && !record.date.startsWith(filterMonth)) {
                    return false;
                }
                if (selectedWeekData) {
                    const recordDate = new Date(record.date + 'T00:00:00');
                    const startDate = selectedWeekData.start;
                    const endDate = selectedWeekData.end;
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                    return recordDate >= startDate && recordDate <= endDate;
                }
                return true;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [classInfo.records, filterMonth, filterWeek, availableWeeks]);


    const handleOpenAddModal = () => {
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (record: ClassRecord) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleDeleteRecord = (recordDate: string) => {
        if (window.confirm(`'${recordDate}' 기록을 정말 삭제하시겠습니까?`)) {
            onDeleteRecord(classInfo.id, recordDate);
        }
    };
    
    const handleSaveRecord = (recordData: ClassRecord) => {
        if (editingRecord) {
            const { date, ...updatedData } = recordData;
            onUpdateRecord(classInfo.id, date, updatedData);
        } else {
            onAddRecord(classInfo.id, recordData);
        }
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    return (
        <>
            <div className="flex flex-col space-y-4">
                <div className="relative flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <button 
                        onClick={onBack} 
                        className="absolute left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label="Back to class list"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center flex-grow">{classInfo.name} 진도 기록</h2>
                </div>

                <div className="flex justify-between items-center px-4 flex-wrap gap-2 -mb-2">
                    <div className="flex items-center space-x-2">
                         <select 
                            value={filterMonth} 
                            onChange={(e) => { setFilterMonth(e.target.value); setFilterWeek('all'); }}
                            className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            aria-label="월 필터"
                         >
                            <option value="all">전체 월</option>
                            {availableMonths.map(month => <option key={month} value={month}>{month.substring(2, 4)}년 {month.substring(5, 7)}월</option>)}
                         </select>
                         <select 
                            value={filterWeek} 
                            onChange={(e) => setFilterWeek(e.target.value)}
                            disabled={!availableWeeks.length}
                            className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            aria-label="주차 필터"
                         >
                            <option value="all">전체 주</option>
                            {availableWeeks.map(week => <option key={week.weekNumber} value={week.weekNumber}>{week.weekNumber}주차</option>)}
                         </select>
                    </div>
                    <button 
                        onClick={handleOpenAddModal} 
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
                    >
                        새 기록 추가
                    </button>
                </div>
                
                {filteredAndSortedRecords.length > 0 ? (
                    <ul className="space-y-3">
                        {filteredAndSortedRecords.map((record) => (
                            <li key={record.date} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm group">
                                 <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-md text-slate-700 dark:text-slate-200">{record.date}</h3>
                                    <div className="flex items-center space-x-2">
                                      {record.isCompleted && <span className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">완료</span>}
                                       <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                            <button onClick={() => handleOpenEditModal(record)} className="p-1.5 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                            </button>
                                            <button onClick={() => handleDeleteRecord(record.date)} className="p-1.5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                 </div>
                                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                                    <p><span className="font-semibold text-slate-600 dark:text-slate-300">진도:</span> {record.progressTextbook} P{record.progressRange}</p>
                                    <p><span className="font-semibold text-slate-600 dark:text-slate-300">숙제:</span> {record.homeworkTextbook} P{record.homeworkRange}</p>
                                    {record.memo && <p><span className="font-semibold text-slate-600 dark:text-slate-300">메모:</span> {record.memo}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="text-center py-6 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                      <p>해당 조건에 맞는 진도 기록이 없습니다.</p>
                    </div>
                )}
            </div>
            <ProgressRecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRecord}
                recordToEdit={editingRecord}
                classInfo={classInfo}
                onDeleteProgressTextbook={onDeleteProgressTextbook}
                onDeleteHomeworkTextbook={onDeleteHomeworkTextbook}
            />
        </>
    );
};

const ProgressPage: React.FC<ProgressPageProps> = ({ classes, onAddRecord, onUpdateRecord, onDeleteRecord, onDeleteProgressTextbook, onDeleteHomeworkTextbook }) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // This ensures that the detail view always gets the most up-to-date class data
  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find(c => c.id === selectedClassId) || null;
  }, [selectedClassId, classes]);

  if (selectedClass) {
    return <ProgressDetailView 
        classInfo={selectedClass} 
        onBack={() => setSelectedClassId(null)} 
        onAddRecord={onAddRecord}
        onUpdateRecord={onUpdateRecord}
        onDeleteRecord={onDeleteRecord}
        onDeleteProgressTextbook={onDeleteProgressTextbook}
        onDeleteHomeworkTextbook={onDeleteHomeworkTextbook}
    />;
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
      <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">진도 기록 보기</h2>
      <ul className="space-y-3">
        {classes.map(classInfo => (
          <li 
            key={classInfo.id} 
            onClick={() => setSelectedClassId(classInfo.id)} 
            className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex justify-between items-center"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter') setSelectedClassId(classInfo.id) }}
          >
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{classInfo.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{classInfo.records.length}개의 기록</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressPage;