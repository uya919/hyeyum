import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useStudents } from './hooks/useStudents';
import type { Class, Student, ClassRecord, User } from './types';
import Header from './components/Header';
import ClassListItem from './components/StudentListItem';
import AttendanceModal from './components/StudentModal';
import ClassesPage from './components/ClassesPage';
import AttendancePage from './components/AttendancePage';
import ProgressPage from './components/ProgressPage';
import ClassRecordEditModal from './components/ClassRecordEditModal';
import SettingsPage from './components/SettingsPage';
import ClassDetailView from './components/ClassDetailView';


const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];

// --- Sub-components defined within App.tsx to adhere to file structure constraints ---

const LoginPage: React.FC<{ 
    onLogin: (loginId: string, pass: string, autoLogin: boolean) => Promise<boolean>,
    onSignUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string; }> 
}> = ({ onLogin, onSignUp }) => {
    const [name, setName] = useState('');
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [autoLogin, setAutoLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isSigningUp) {
            if (!name || !loginId || !password) {
                setError('이름, 아이디, 비밀번호를 모두 입력해주세요.');
                setIsLoading(false);
                return;
            }
            const result = await onSignUp(name, loginId, password);
             if (!result.success) {
                setError(result.error || '회원가입에 실패했습니다. 다시 시도해주세요.');
            }
        } else {
            if (!loginId || !password) {
                setError('아이디와 비밀번호를 모두 입력해주세요.');
                setIsLoading(false);
                return;
            }
            const success = await onLogin(loginId, password, autoLogin);
            if (!success) {
                setError('아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        }
        setIsLoading(false);
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{isSigningUp ? '회원가입' : '로그인'}</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {isSigningUp ? '첫 가입자는 자동으로 원장 계정이 됩니다.' : '학원 관리 시스템에 오신 것을 환영합니다.'}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isSigningUp && (
                         <div>
                            <label htmlFor="name-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">이름</label>
                            <input 
                                id="name-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="예: 김원장"
                                autoComplete="name"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="loginId-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">아이디 (이메일)</label>
                        <input 
                            id="loginId-input"
                            type="email"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="예: director@example.com"
                            autoComplete="username"
                        />
                    </div>
                     <div>
                        <label htmlFor="password-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호</label>
                        <input 
                            id="password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="6자 이상 입력"
                            autoComplete="current-password"
                        />
                    </div>

                    {!isSigningUp && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="auto-login"
                                    name="auto-login"
                                    type="checkbox"
                                    checked={autoLogin}
                                    onChange={(e) => setAutoLogin(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
                                />
                                <label htmlFor="auto-login" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                    자동 로그인
                                </label>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 text-sm font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 transition-transform disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (isSigningUp ? '가입 중...' : '로그인 중...') : (isSigningUp ? '회원가입' : '로그인')}
                    </button>
                </form>
                 <div className="text-center">
                    <button 
                        onClick={() => { setIsSigningUp(!isSigningUp); setError(''); }}
                        className="text-sm font-medium text-blue-500 hover:text-blue-600"
                    >
                        {isSigningUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CalendarCard: React.FC<{ 
    selectedDate: Date; 
    onDateSelect: (date: Date) => void;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}> = ({ selectedDate, onDateSelect, isExpanded, setIsExpanded }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const renderMonthView = () => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 text-center mt-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
        {dates.map((date) => {
          const currentDate = new Date(year, month, date);
          const isSelected = currentDate.toDateString() === selectedDate.toDateString();
          return (
            <div 
              key={date} 
              onClick={() => onDateSelect(currentDate)}
              className={`cursor-pointer mt-2 p-2 rounded-full flex items-center justify-center aspect-square transition-colors ${isSelected ? 'bg-blue-500 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {date}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const currentDayOfWeek = selectedDate.getDay();
    const firstDayOfWeek = new Date(selectedDate);
    firstDayOfWeek.setDate(selectedDate.getDate() - currentDayOfWeek);
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(firstDayOfWeek);
        date.setDate(firstDayOfWeek.getDate() + i);
        return date;
    });

    return (
        <div className="grid grid-cols-7 text-center mt-2">
            {weekDates.map((date, i) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isDifferentMonth = date.getMonth() !== selectedDate.getMonth();
                return (
                    <div
                        key={i}
                        onClick={() => onDateSelect(date)}
                        className={`cursor-pointer mt-2 p-2 rounded-full flex items-center justify-center aspect-square transition-colors ${
                            isSelected 
                                ? 'bg-blue-500 text-white font-bold' 
                                : isDifferentMonth 
                                    ? 'text-slate-300 dark:text-slate-600'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}>
                        {date.getDate()}
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">📅 {year}년 {month + 1}월</h2>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-semibold text-blue-500 hover:text-blue-600">
            {isExpanded ? '접기' : '전체 달력'}
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-sm text-slate-500 dark:text-slate-400">
        {weekDays.map(day => <div key={day} className="font-medium">{day}</div>)}
      </div>
      
      {isExpanded ? renderMonthView() : renderWeekView()}
      
    </div>
  );
};

const TodoCard: React.FC<{ 
    selectedDate: Date; 
    todos: string[]; 
    onAddTodo: (date: Date, text: string) => void;
    onRemoveTodo: (date: Date, index: number) => void; 
}> = ({ selectedDate, todos, onAddTodo, onRemoveTodo }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTodo, setNewTodo] = useState('');

    useEffect(() => {
        setIsAdding(false);
        setNewTodo('');
    }, [selectedDate]);

    const handleSave = () => {
        if (newTodo.trim()) {
            onAddTodo(selectedDate, newTodo.trim());
            setNewTodo('');
            setIsAdding(false);
        }
    };
    
    const handleAddClick = () => {
        setIsAdding(true);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    오늘의 할일 ({selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일)
                </h2>
                {!isAdding && (
                    <button onClick={handleAddClick} className="text-sm font-semibold text-blue-500 hover:text-blue-600">추가하기 +</button>
                )}
            </div>
            
            {isAdding && (
                <div className="flex items-center space-x-2">
                    <input 
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="할일을 입력하세요"
                        className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-bold hover:bg-blue-600">저장</button>
                </div>
            )}

             {!isAdding && todos.length === 0 && (
                <div className="text-center py-4 text-slate-400 dark:text-slate-500">
                    <p>{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일의 할일이 없습니다.</p>
                </div>
             )}
             
             {todos.length > 0 && (
                 <ul className="space-y-2 mt-2">
                    {todos.map((todo, index) => (
                        <li 
                            key={index} 
                            className="group flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md"
                        >
                            <span>{todo}</span>
                            <button 
                                onClick={() => onRemoveTodo(selectedDate, index)}
                                className="invisible group-hover:visible text-slate-400 hover:text-red-500 dark:hover:text-red-400 px-1 rounded"
                                aria-label={`Delete todo: ${todo}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                    ))}
                 </ul>
             )}
        </div>
    );
};

const BottomNav: React.FC<{ activePage: string; onNavigate: (page: string) => void; }> = ({ activePage, onNavigate }) => {
  const navItems = [
    { label: '홈', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { label: '수업', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg> },
    { label: '출석', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: '진도', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { label: '설정', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-30">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
            {navItems.map(item => (
                <button 
                  key={item.label} 
                  onClick={() => onNavigate(item.label)}
                  className={`flex flex-col items-center justify-center space-y-1 w-full transition-colors ${activePage === item.label ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                </button>
            ))}
        </div>
    </nav>
  );
};


const App: React.FC = () => {
  const { 
    isLoading,
    users,
    currentUser,
    login,
    logout,
    signUp,
    addUser,
    updateUser,
    deleteUser,
    classes, 
    todos, 
    attendanceHistory,
    updateStudentAttendance, 
    addTodo, 
    removeTodo, 
    addClass,
    updateClass,
    deleteClass,
    addClassRecord, 
    updateClassRecord, 
    deleteClassRecord,
    deleteProgressTextbookFromClass,
    deleteHomeworkTextbookFromClass,
    addStudentToClass,
    updateStudentInClass,
    deleteStudentFromClass
  } = useStudents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activePage, setActivePage] = useState('홈');
  
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedRecordInfo, setSelectedRecordInfo] = useState<{ classInfo: Class; record: ClassRecord } | null>(null);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [detailClass, setDetailClass] = useState<Class | null>(null);

  const todosForSelectedDate = todos[formatDateKey(selectedDate)] || [];
  
  const visibleClasses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'director') return classes;
    return classes.filter(c => c.teacherId === currentUser.id);
  }, [currentUser, classes]);

  const handleOpenAttendanceModal = useCallback((classData: Class) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedClass(null);
  }, []);

  const handleSaveAttendance = useCallback((classId: string, updatedStudents: Student[]) => {
    updateStudentAttendance(classId, updatedStudents);
    handleCloseModal();
  }, [updateStudentAttendance, handleCloseModal]);
  
  const handleOpenRecordModal = useCallback((classInfo: Class, record: ClassRecord) => {
    const currentClassInfo = classes.find(c => c.id === classInfo.id) || classInfo;
    setSelectedRecordInfo({ classInfo: currentClassInfo, record });
    setIsRecordModalOpen(true);
  }, [classes]);

  const handleCloseRecordModal = useCallback(() => {
    setIsRecordModalOpen(false);
    setSelectedRecordInfo(null);
  }, []);
  
  const handleSaveRecord = useCallback((classId: string, recordDate: string, updatedData: Partial<Omit<ClassRecord, 'date'>>) => {
    updateClassRecord(classId, recordDate, updatedData);
    handleCloseRecordModal();
  }, [updateClassRecord, handleCloseRecordModal]);
  
  const handleOpenClassDetail = (classInfo: Class) => {
    setDetailClass(classInfo);
  };
  
  const handleCloseClassDetail = () => {
    setDetailClass(null);
  };

  const renderContent = () => {
    if (isLoading && !currentUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    const selectedDateKey = formatDateKey(selectedDate);
    const classesOnSelectedDate = visibleClasses.filter(c => c.records.some(r => r.date === selectedDateKey));

    switch (activePage) {
      case '홈':
        return (
          <>
            <CalendarCard 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate}
              isExpanded={isCalendarExpanded}
              setIsExpanded={setIsCalendarExpanded} 
            />
            <TodoCard 
              selectedDate={selectedDate} 
              todos={todosForSelectedDate} 
              onAddTodo={addTodo}
              onRemoveTodo={removeTodo}
            />
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-1">
                  <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일의 수업
                  </h2>
                  <button onClick={() => setActivePage('수업')} className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-600 flex items-center">
                      전체보기
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
              </div>
              {classesOnSelectedDate.length > 0 ? (
                <ul className="space-y-3">
                  {classesOnSelectedDate.map(classInfo => {
                     const recordForDay = classInfo.records.find(r => r.date === selectedDateKey)!;
                     return (
                        <ClassListItem
                          key={classInfo.id}
                          classInfo={classInfo}
                          record={recordForDay}
                          onAttendanceClick={handleOpenAttendanceModal}
                          onProgressClick={handleOpenRecordModal}
                          onClassClick={handleOpenClassDetail}
                        />
                     )
                  })}
                </ul>
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                  <p>선택한 날짜에 수업이 없습니다.</p>
                </div>
              )}
            </div>
          </>
        );
      case '수업':
        return <ClassesPage 
            classes={visibleClasses} 
            currentUser={currentUser}
            users={users}
            onAddClass={addClass}
            onUpdateClass={updateClass}
            onDeleteClass={deleteClass}
            onAddStudent={addStudentToClass}
            onUpdateStudent={updateStudentInClass}
            onDeleteStudent={deleteStudentFromClass}
            onAddRecord={addClassRecord}
            onUpdateRecord={updateClassRecord}
            onDeleteRecord={deleteClassRecord}
            onDeleteProgressTextbook={deleteProgressTextbookFromClass}
            onDeleteHomeworkTextbook={deleteHomeworkTextbookFromClass}
        />;
      case '출석':
        return <AttendancePage attendanceHistory={attendanceHistory} />;
      case '진도':
        return <ProgressPage 
            classes={visibleClasses}
            onAddRecord={addClassRecord}
            onUpdateRecord={updateClassRecord}
            onDeleteRecord={deleteClassRecord}
            onDeleteProgressTextbook={deleteProgressTextbookFromClass}
            onDeleteHomeworkTextbook={deleteHomeworkTextbookFromClass}
          />;
      case '설정':
        return <SettingsPage 
            currentUser={currentUser!}
            onLogout={logout}
            users={users}
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
        />;
      default:
        return null;
    }
  };

  const currentClassInfoForModal = classes.find(c => c.id === selectedRecordInfo?.classInfo?.id) || selectedRecordInfo?.classInfo || null;
  const currentClassInfoForDetailModal = classes.find(c => c.id === detailClass?.id) || detailClass || null;

  if (!currentUser) {
      if (isLoading) {
          return (
             <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
             </div>
          )
      }
    return <LoginPage onLogin={login} onSignUp={signUp} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen font-sans antialiased text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900">
      <div className="relative min-h-screen flex flex-col pb-24">
        <Header currentUser={currentUser} />
        <main className="flex-grow px-4 py-6 space-y-4">
          {renderContent()}
        </main>
        
        <AttendanceModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveAttendance}
          classData={selectedClass}
        />

        <ClassRecordEditModal 
            isOpen={isRecordModalOpen}
            onClose={handleCloseRecordModal}
            onSave={handleSaveRecord}
            classInfo={currentClassInfoForModal}
            record={selectedRecordInfo?.record ?? null}
            onDeleteProgressTextbook={deleteProgressTextbookFromClass}
            onDeleteHomeworkTextbook={deleteHomeworkTextbookFromClass}
        />
        {detailClass && currentClassInfoForDetailModal && (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-end"
                onClick={handleCloseClassDetail}
            >
                <div 
                    className="bg-slate-100 dark:bg-slate-900 w-full max-w-md max-h-[90vh] rounded-t-2xl shadow-xl overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4">
                        <ClassDetailView
                            classInfo={currentClassInfoForDetailModal}
                            onBack={handleCloseClassDetail}
                            onAddStudent={addStudentToClass}
                            onUpdateStudent={updateStudentInClass}
                            onDeleteStudent={deleteStudentFromClass}
                            onAddRecord={addClassRecord}
                            onUpdateRecord={updateClassRecord}
                            onDeleteRecord={deleteClassRecord}
                            onDeleteProgressTextbook={deleteProgressTextbookFromClass}
                            onDeleteHomeworkTextbook={deleteHomeworkTextbookFromClass}
                        />
                    </div>
                </div>
            </div>
        )}
        <BottomNav activePage={activePage} onNavigate={setActivePage} />
      </div>
    </div>
  );
};

export default App;