import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<Omit<User, 'id'>> & { password?: string }) => void;
  userToEdit: User | null;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [loginId, setLoginId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'director' | 'teacher'>('teacher');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (userToEdit) {
        setLoginId(userToEdit.loginId);
        setName(userToEdit.name);
        setRole(userToEdit.role);
        setPassword('');
      } else {
        setLoginId('');
        setName('');
        setRole('teacher');
        setPassword('');
      }
    }
  }, [isOpen, userToEdit]);

  const handleSave = useCallback(() => {
    if (!loginId.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!isEditing && !password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    onSave({ loginId, name, role, password });
  }, [isEditing, loginId, name, role, password, onSave]);

  if (!isOpen) {
    return null;
  }
  
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
            {isEditing ? '사용자 정보 수정' : '새 사용자 추가'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="userLoginId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">아이디</label>
            <input
              type="text"
              id="userLoginId"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>
            <input
              type="text"
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="userRole" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">역할</label>
            <select
                id="userRole"
                value={role}
                onChange={(e) => setRole(e.target.value as 'director' | 'teacher')}
                className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="teacher">강사</option>
                <option value="director">원장</option>
            </select>
          </div>
          <div>
            <label htmlFor="userPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">비밀번호</label>
            <input
              type="password"
              id="userPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
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

export default UserEditModal;
