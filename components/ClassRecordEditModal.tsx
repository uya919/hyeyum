import React, { useState, useEffect, useCallback } from 'react';
import type { Class, ClassRecord } from '../types';

interface ClassRecordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classId: string, recordDate: string, updatedData: Partial<Omit<ClassRecord, 'date'>>) => void;
  classInfo: Class | null;
  record: ClassRecord | null;
  onDeleteProgressTextbook: (classId: string, textbookName: string) => void;
  onDeleteHomeworkTextbook: (classId: string, textbookName: string) => void;
}

const ClassRecordEditModal: React.FC<ClassRecordEditModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    classInfo, 
    record, 
    onDeleteProgressTextbook,
    onDeleteHomeworkTextbook
}) => {
  const [progressTextbook, setProgressTextbook] = useState('');
  const [isManualProgressTextbook, setIsManualProgressTextbook] = useState(false);
  const [progressStartPage, setProgressStartPage] = useState('');
  const [progressEndPage, setProgressEndPage] = useState('');
  
  const [homeworkTextbook, setHomeworkTextbook] = useState('');
  const [isManualHomeworkTextbook, setIsManualHomeworkTextbook] = useState(false);
  const [homeworkStartPage, setHomeworkStartPage] = useState('');
  const [homeworkEndPage, setHomeworkEndPage] = useState('');
  
  const [memo, setMemo] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const [managingTextbookType, setManagingTextbookType] = useState<'progress' | 'homework' | null>(null);

  useEffect(() => {
    if (isOpen && record && classInfo) {
      // Progress fields
      const isProgressTextbookInList = classInfo.progressTextbooks.includes(record.progressTextbook);
      setProgressTextbook(record.progressTextbook || '');
      setIsManualProgressTextbook(!isProgressTextbookInList && !!record.progressTextbook);
      
      const pRange = record.progressRange || '';
      const pMatch = pRange.match(/(\d+)-?(\d*)/i);
      setProgressStartPage(pMatch ? pMatch[1] : '');
      setProgressEndPage(pMatch ? (pMatch[2] || pMatch[1]) : '');

      // Homework fields
      const isHomeworkTextbookInList = classInfo.homeworkTextbooks.includes(record.homeworkTextbook);
      setHomeworkTextbook(record.homeworkTextbook || '');
      setIsManualHomeworkTextbook(!isHomeworkTextbookInList && !!record.homeworkTextbook);

      const hRange = record.homeworkRange || '';
      const hMatch = hRange.match(/(\d+)-?(\d*)/i);
      setHomeworkStartPage(hMatch ? hMatch[1] : '');
      setHomeworkEndPage(hMatch ? (hMatch[2] || hMatch[1]) : '');

      // Other fields
      setMemo(record.memo || '');
      setIsCompleted(record.isCompleted || false);
    }
  }, [isOpen, record, classInfo]);
  
  const handlePageChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: number) => {
      if (value >= 1) setter(String(value));
  };
  
  const handleSave = useCallback(() => {
    if (classInfo && record) {
      const newProgressRange = progressStartPage ? `${progressStartPage}${progressEndPage && progressEndPage !== progressStartPage ? `-${progressEndPage}` : ''}` : '';
      const newHomeworkRange = homeworkStartPage ? `${homeworkStartPage}${homeworkEndPage && homeworkEndPage !== homeworkStartPage ? `-${homeworkEndPage}` : ''}` : '';
      
      if (!progressTextbook.trim() || !newProgressRange.trim()) {
        alert('진도 교재명과 진도를 입력해주세요.');
        return;
      }

      onSave(classInfo.id, record.date, { 
          progressTextbook, 
          progressRange: newProgressRange, 
          homeworkTextbook,
          homeworkRange: newHomeworkRange,
          memo, 
          isCompleted 
      });
    }
  }, [classInfo, record, progressTextbook, progressStartPage, progressEndPage, homeworkTextbook, homeworkStartPage, homeworkEndPage, memo, isCompleted, onSave]);

  if (!isOpen || !classInfo || !record) {
    return null;
  }
  
  const textbooksToManage = managingTextbookType === 'progress' ? classInfo.progressTextbooks : classInfo.homeworkTextbooks;
  const deleteFunction = managingTextbookType === 'progress' ? onDeleteProgressTextbook : onDeleteHomeworkTextbook;


  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale max-h-[90vh] overflow-y-auto"
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">진도 기록</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6 text-center">
              <div className='flex items-center justify-center space-x-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>
                  <h3 className="text-md font-bold text-blue-800 dark:text-blue-200">{classInfo.name} 진도 기록 ({record.date})</h3>
              </div>
              <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>{classInfo.time} 수업</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="progressTextbook" className="block text-sm font-medium text-slate-700 dark:text-slate-300">진도 교재명 <span className='text-red-500'>*</span></label>
                  <button onClick={() => setManagingTextbookType('progress')} className="text-xs font-semibold text-slate-500 hover:text-blue-500">교재 관리</button>
              </div>
              <select
                id="progressTextbook"
                value={isManualProgressTextbook ? '__MANUAL__' : progressTextbook}
                onChange={(e) => {
                  if (e.target.value === '__MANUAL__') { setIsManualProgressTextbook(true); setProgressTextbook(''); } 
                  else { setIsManualProgressTextbook(false); setProgressTextbook(e.target.value); }
                }}
                className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>교재 선택</option>
                {classInfo.progressTextbooks.map(tb => <option key={tb} value={tb}>{tb}</option>)}
                <option value="__MANUAL__">직접 입력</option>
              </select>
              {isManualProgressTextbook && (
                <input type="text" value={progressTextbook} onChange={(e) => setProgressTextbook(e.target.value)} placeholder="새 교재명 입력" className="mt-2 w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              )}
            </div>
            <div>
              <label htmlFor="progressStartPage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">진도 <span className='text-red-500'>*</span></label>
              <div className="flex items-center space-x-2">
                  <div className="flex items-center w-full">
                      <button type="button" onClick={() => handlePageChange(setProgressStartPage, Number(progressStartPage || 2) - 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-l-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">-</button>
                      <input type="text" inputMode="numeric" id="progressStartPage" value={progressStartPage} onChange={(e) => setProgressStartPage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-100 dark:bg-slate-700 border-t border-b border-slate-300 dark:border-slate-600 px-1 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500" style={{ MozAppearance: 'textfield' }} />
                      <button type="button" onClick={() => handlePageChange(setProgressStartPage, Number(progressStartPage || 0) + 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-r-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">+</button>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-bold">-</span>
                  <div className="flex items-center w-full">
                      <button type="button" onClick={() => handlePageChange(setProgressEndPage, Number(progressEndPage || 2) - 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-l-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">-</button>
                      <input type="text" inputMode="numeric" id="progressEndPage" value={progressEndPage} onChange={(e) => setProgressEndPage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-100 dark:bg-slate-700 border-t border-b border-slate-300 dark:border-slate-600 px-1 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500" style={{ MozAppearance: 'textfield' }} />
                      <button type="button" onClick={() => handlePageChange(setProgressEndPage, Number(progressEndPage || 0) + 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-r-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">+</button>
                  </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="homeworkTextbook" className="block text-sm font-medium text-slate-700 dark:text-slate-300">숙제 교재명</label>
                <button onClick={() => setManagingTextbookType('homework')} className="text-xs font-semibold text-slate-500 hover:text-blue-500">교재 관리</button>
              </div>
              <select
                id="homeworkTextbook"
                value={isManualHomeworkTextbook ? '__MANUAL__' : homeworkTextbook}
                onChange={(e) => {
                  if (e.target.value === '__MANUAL__') { setIsManualHomeworkTextbook(true); setHomeworkTextbook(''); } 
                  else { setIsManualHomeworkTextbook(false); setHomeworkTextbook(e.target.value); }
                }}
                className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">교재 선택 (없음)</option>
                {classInfo.homeworkTextbooks.map(tb => <option key={tb} value={tb}>{tb}</option>)}
                <option value="__MANUAL__">직접 입력</option>
              </select>
              {isManualHomeworkTextbook && (
                <input type="text" value={homeworkTextbook} onChange={(e) => setHomeworkTextbook(e.target.value)} placeholder="새 교재명 입력" className="mt-2 w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              )}
            </div>
            <div>
              <label htmlFor="homeworkStartPage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">숙제</label>
               <div className="flex items-center space-x-2">
                  <div className="flex items-center w-full">
                      <button type="button" onClick={() => handlePageChange(setHomeworkStartPage, Number(homeworkStartPage || 2) - 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-l-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">-</button>
                      <input type="text" inputMode="numeric" id="homeworkStartPage" value={homeworkStartPage} onChange={(e) => setHomeworkStartPage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-100 dark:bg-slate-700 border-t border-b border-slate-300 dark:border-slate-600 px-1 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500" style={{ MozAppearance: 'textfield' }} />
                      <button type="button" onClick={() => handlePageChange(setHomeworkStartPage, Number(homeworkStartPage || 0) + 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-r-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">+</button>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-bold">-</span>
                  <div className="flex items-center w-full">
                      <button type="button" onClick={() => handlePageChange(setHomeworkEndPage, Number(homeworkEndPage || 2) - 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-l-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">-</button>
                      <input type="text" inputMode="numeric" id="homeworkEndPage" value={homeworkEndPage} onChange={(e) => setHomeworkEndPage(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-slate-100 dark:bg-slate-700 border-t border-b border-slate-300 dark:border-slate-600 px-1 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500" style={{ MozAppearance: 'textfield' }} />
                      <button type="button" onClick={() => handlePageChange(setHomeworkEndPage, Number(homeworkEndPage || 0) + 1)} className="px-3 py-2 bg-slate-200 dark:bg-slate-600 rounded-r-md font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">+</button>
                  </div>
              </div>
            </div>
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">특이사항 / 메모</label>
              <textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="수업 중 특이사항이나 다음 시간 준비사항을 적어주세요." className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            진도 저장하기
          </button>
        </div>
      </div>

      {managingTextbookType && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={() => setManagingTextbookType(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-5 w-full max-w-xs" onClick={e => e.stopPropagation()}>
                <h4 className="font-bold mb-3 text-lg text-slate-800 dark:text-slate-100">"{classInfo.name}" {managingTextbookType === 'progress' ? '진도' : '숙제'} 교재 관리</h4>
                {textbooksToManage.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {textbooksToManage.map(tb => (
                            <li key={tb} className="flex justify-between items-center text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                <span className="text-slate-700 dark:text-slate-200">{tb}</span>
                                <button 
                                  onClick={() => deleteFunction(classInfo.id, tb)} 
                                  className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                                  aria-label={`Delete ${tb}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">등록된 교재가 없습니다.</p>
                )}
                <button onClick={() => setManagingTextbookType(null)} className="mt-4 w-full py-2 bg-slate-200 dark:bg-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">닫기</button>
            </div>
        </div>
      )}
    </>
  );
};

export default ClassRecordEditModal;