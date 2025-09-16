import React, { useMemo, useState } from 'react';
import type { AttendanceSummary } from '../types';

const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];

const AttendancePage: React.FC<{ attendanceHistory: { [key: string]: AttendanceSummary[] } }> = ({ attendanceHistory }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Default to Sep 2025 for mock data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
    setSelectedDate(null);
  };

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
  const attendanceForSelectedDate = selectedDateKey ? attendanceHistory[selectedDateKey] : null;

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Previous month">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Next month">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-sm text-slate-500 dark:text-slate-400">
          {weekDays.map(day => <div key={day} className="font-medium h-8 flex items-center justify-center">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 text-center">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
          {daysInMonth.map((day, i) => {
             const dateKey = formatDateKey(day);
             const hasRecord = !!attendanceHistory[dateKey];
             const isSelected = selectedDate?.toDateString() === day.toDateString();
            return (
              <div key={i} onClick={() => setSelectedDate(day)} className="relative h-10 flex items-center justify-center">
                 <div className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center aspect-square transition-colors ${isSelected ? 'bg-blue-500 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                   {day.getDate()}
                 </div>
                 {hasRecord && <div className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full"></div>}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3">
          {selectedDate ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 출석 요약` : '날짜를 선택하세요'}
        </h3>
        {attendanceForSelectedDate ? (
            <ul className="space-y-3">
                {attendanceForSelectedDate.map(summary => (
                    <li key={summary.classId} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <p className="font-bold text-slate-700 dark:text-slate-200">{summary.className} ({summary.time})</p>
                        <div className="flex justify-start space-x-4 text-sm mt-1">
                            <span className="text-emerald-500">출석 {summary.present}</span>
                            <span className="text-rose-500">결석 {summary.absent}</span>
                            <span className="text-yellow-500">지각 {summary.late}</span>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
             <p className="text-slate-400 dark:text-slate-500 text-center py-4">
               {selectedDate ? '선택한 날짜에 출석 기록이 없습니다.' : '달력에서 날짜를 선택하여 출석 기록을 확인하세요.'}
            </p>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;