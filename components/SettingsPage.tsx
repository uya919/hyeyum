import React, { useState } from 'react';
import type { User } from '../types';
import UserEditModal from './UserEditModal';

interface SettingsPageProps {
  currentUser: User;
  onLogout: () => void;
  users: User[];
  onAddUser: (userData: Omit<User, 'id'> & { password?: string }) => void;
  onUpdateUser: (userId: string, updatedData: Partial<Omit<User, 'id'>> & { password?: string }) => void;
  onDeleteUser: (userId: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onLogout, users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleDeleteUser = (userId: string) => {
      if (window.confirm('이 사용자를 정말 삭제하시겠습니까? 해당 강사에게 배정된 모든 수업은 "미배정" 상태가 됩니다.')) {
          onDeleteUser(userId);
      }
  };

  const handleSaveUser = (userData: Partial<Omit<User, 'id'>> & { password?: string }) => {
    if (editingUser) {
        onUpdateUser(editingUser.id, userData);
    } else {
        const { loginId, name, role, password } = userData;
        if (loginId && name && role) {
            onAddUser({ loginId, name, role, password });
        } else {
            console.error("Cannot add user with incomplete data.");
            alert("사용자 정보가 완전하지 않아 추가할 수 없습니다.");
        }
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">내 정보</h2>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">현재 로그인된 사용자</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{currentUser.name} ({currentUser.role === 'director' ? '원장' : '강사'})</p>
             <p className="text-sm text-slate-500 dark:text-slate-400">아이디: {currentUser.loginId}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full px-6 py-3 rounded-lg text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all"
          >
            로그아웃
          </button>
        </div>

        {currentUser.role === 'director' && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">사용자 관리</h3>
              <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600">
                새 사용자 추가
              </button>
            </div>
            <ul className="space-y-3">
              {users.map(user => (
                <li key={user.id} className="group p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.loginId} • {user.role === 'director' ? '원장' : '강사'}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <button 
                        onClick={() => handleOpenEditModal(user)} 
                        className="p-2 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                        aria-label={`Edit ${user.name}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                    </button>
                    {currentUser.id !== user.id && (
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                        aria-label={`Delete ${user.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <UserEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={editingUser}
      />
    </>
  );
};

export default SettingsPage;