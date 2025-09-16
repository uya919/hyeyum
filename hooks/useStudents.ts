import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Class, Student, AttendanceSummary, ClassRecord, User } from '../types';
import { AttendanceStatus } from '../types';
import { db, auth } from '../firebase-config';
import { 
    collection, 
    onSnapshot, 
    doc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    addDoc, 
    query, 
    where,
    writeBatch,
    getDocs,
    limit
} from 'firebase/firestore';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut,
    createUserWithEmailAndPassword,
    deleteUser as deleteAuthUser,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    AuthErrorCodes
} from 'firebase/auth';

const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];

const addInitialDummyData = async (directorId: string) => {
    try {
        const batch = writeBatch(db);

        // --- Dummy Class 1: 초6_심화반 ---
        const class1Students: Student[] = [
            { id: `s${Date.now() + 1}`, name: '김민준', attendance: AttendanceStatus.Present, lastAttended: '2025-09-01' },
            { id: `s${Date.now() + 2}`, name: '박서연', attendance: AttendanceStatus.Absent, lastAttended: '2025-08-29' },
            { id: `s${Date.now() + 3}`, name: '이도윤', attendance: AttendanceStatus.Late, lastAttended: '2025-09-01' },
        ];

        const class1Records: ClassRecord[] = [
            {
                date: '2025-09-01',
                progressTextbook: '쎈수학', progressRange: '12-15',
                homeworkTextbook: '쎈수학', homeworkRange: '10-11',
                memo: '민준이 질문 많았음. 개념 보충 필요.', isCompleted: true,
            },
            {
                date: '2025-09-03',
                progressTextbook: '쎈수학', progressRange: '16-18',
                homeworkTextbook: '쎈수학', homeworkRange: '12-15',
                memo: '', isCompleted: false,
            }
        ];

        const class1Data = {
            name: '초6_심화반',
            time: '2:50',
            teacherId: '',
            students: class1Students,
            records: class1Records,
            progressTextbooks: ['쎈수학', '개념원리'],
            homeworkTextbooks: ['쎈수학'],
        };
        const class1Ref = doc(collection(db, 'classes'));
        batch.set(class1Ref, class1Data);

        // --- Dummy Class 2: 중2_A반 ---
        const class2Students: Student[] = [
            { id: `s${Date.now() + 4}`, name: '최지우', attendance: AttendanceStatus.Unchecked, lastAttended: '2025-08-30' },
            { id: `s${Date.now() + 5}`, name: '한강민', attendance: AttendanceStatus.Unchecked, lastAttended: '2025-08-30' },
            { id: `s${Date.now() + 6}`, name: '윤아인', attendance: AttendanceStatus.Unchecked, lastAttended: '2025-08-30' },
        ];

        const class2Records: ClassRecord[] = [
             {
                date: '2025-09-01',
                progressTextbook: '일품 중2', progressRange: '22-25',
                homeworkTextbook: '일품 중2', homeworkRange: '20-21',
                memo: '다음 주 단원평가 예정.', isCompleted: true,
            },
            {
                date: '2025-09-02',
                progressTextbook: '블랙라벨', progressRange: '5-8',
                homeworkTextbook: '일품 중2', homeworkRange: '22-24',
                memo: '', isCompleted: false,
            }
        ];
        
        const class2Data = {
            name: '중2_A반',
            time: '4:30',
            teacherId: '',
            students: class2Students,
            records: class2Records,
            progressTextbooks: ['일품 중2', '블랙라벨'],
            homeworkTextbooks: ['일품 중2'],
        };
        const class2Ref = doc(collection(db, 'classes'));
        batch.set(class2Ref, class2Data);

        // --- Dummy Todos for Director ---
        const todayKey = formatDateKey(new Date());
        const directorTodos = {
            dailyTodos: {
                [todayKey]: [
                    '샘플 데이터 확인하기',
                    '설정 탭에서 강사 계정 추가하기',
                ]
            }
        };
        const todoRef = doc(db, 'todos', directorId);
        batch.set(todoRef, directorTodos);
        
        await batch.commit();
        console.log("Dummy data added successfully for the first user.");

    } catch (error) {
        console.error("Error adding dummy data: ", error);
    }
};


export const useStudents = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [todos, setTodos] = useState<{ [key: string]: string[] }>({});

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubUser = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
                    } else {
                        // This case can happen if the user doc was deleted from Firestore but not from Auth
                        setCurrentUser(null);
                    }
                    setIsLoading(false);
                });
                return () => unsubUser();
            } else {
                setCurrentUser(null);
                setClasses([]);
                setUsers([]);
                setTodos({});
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Firestore data listeners
    useEffect(() => {
        if (!currentUser) return;

        // Fetch all users if director
        const qUsers = (currentUser.role === 'director') 
            ? collection(db, 'users')
            : query(collection(db, 'users'), where('__name__', '==', currentUser.id));

        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersList);
        });

        // Fetch classes
        const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
            const classesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
            setClasses(classesList);
        });
        
        // Fetch Todos for the current user
        const todoDocRef = doc(db, 'todos', currentUser.id);
        const unsubTodos = onSnapshot(todoDocRef, (docSnap) => {
           if(docSnap.exists()){
               setTodos(docSnap.data().dailyTodos || {});
           } else {
               setTodos({}); // Ensure todos are cleared if doc doesn't exist
           }
        });

        return () => {
            unsubUsers();
            unsubClasses();
            unsubTodos();
        };
    }, [currentUser]);

    const login = async (email: string, password: string, autoLogin: boolean): Promise<boolean> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle setting the user
            return true;
        } catch (error) {
            console.error("Firebase login error:", error);
            return false;
        }
    };

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Firebase logout error:", error);
        }
    }, []);

    const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Check if any user or class exists to determine if it's a fresh setup.
            const usersQuery = query(collection(db, 'users'), limit(1));
            const classesQuery = query(collection(db, 'classes'), limit(1));
            const [userSnapshot, classesSnapshot] = await Promise.all([
                getDocs(usersQuery),
                getDocs(classesQuery)
            ]);

            const isFirstUserSetup = userSnapshot.empty && classesSnapshot.empty;
            const role = isFirstUserSetup ? 'director' : 'teacher';

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document in Firestore
            const newUserDoc = {
                loginId: email,
                name: name,
                role: role
            };
            await setDoc(doc(db, 'users', user.uid), newUserDoc);

            // If it's the very first user in a completely empty database, add dummy data.
            if (isFirstUserSetup) {
                await addInitialDummyData(user.uid);
            }

            // onAuthStateChanged will handle logging the user in
            return { success: true };
        } catch (error: any) {
            console.error("Firebase sign up error:", error.code, error.message);
            if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
                return { success: false, error: '이미 사용 중인 아이디입니다. 다른 아이디를 사용하거나 로그인해주세요.' };
            }
            if (error.code === 'auth/weak-password') {
                return { success: false, error: '비밀번호는 6자 이상이어야 합니다.' };
            }
             if (error.code === 'auth/invalid-email') {
                return { success: false, error: '유효하지 않은 이메일 형식입니다.' };
            }
            return { success: false, error: '알 수 없는 오류로 회원가입에 실패했습니다.' };
        }
    };
    
    // User Management (Director only)
    const addUser = useCallback(async (userData: Omit<User, 'id'> & { password?: string }) => {
        if (!userData.password) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        try {
            // This function is for adding users from the settings page, which requires a temporary auth state change.
            // For simplicity, we are creating a new user, but a better approach for production would be a backend function.
            // NOTE: The current implementation will log the admin out. A real-world app would use Admin SDK.
            // For this project's constraints, we will alert the user about this behavior.
            alert("새 사용자를 추가하면 현재 관리자 계정에서 로그아웃될 수 있습니다. 이 기능은 백엔드 Admin SDK를 사용하는 것이 권장됩니다.");

            const userCredential = await createUserWithEmailAndPassword(auth, userData.loginId, userData.password);
            const newUserDoc = {
                loginId: userData.loginId,
                name: userData.name,
                role: userData.role
            };
            await setDoc(doc(db, 'users', userCredential.user.uid), newUserDoc);
            
            // To prevent automatic login of the new user, we sign them out immediately.
            // This is a workaround. A better way is using Admin SDK on a server.
             if (auth.currentUser?.uid !== currentUser?.id) {
                 await signOut(auth);
                 // Need to re-login the admin, which is complex from the client.
                 // The easiest path is to let onAuthStateChanged handle the new user and then the admin logs back in.
             }

        } catch (error: any) {
            if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
                alert('이미 사용 중인 아이디(이메일)입니다.');
            } else {
                console.error("Error creating user:", error);
                alert('사용자 생성에 실패했습니다.');
            }
        }
    }, [currentUser]);

    const updateUser = useCallback(async (userId: string, updatedData: Partial<Omit<User, 'id'>> & { password?: string }) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const { password, ...firestoreData } = updatedData;
            if (Object.keys(firestoreData).length > 0) {
              await updateDoc(userDocRef, firestoreData);
            }
            // Password update is more complex and requires re-authentication, so it's often handled separately.
            // For simplicity, we are not implementing password change from admin panel here.
            if(password) {
                 alert("보안상의 이유로 사용자 비밀번호 변경은 해당 사용자가 직접 해야 합니다.");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert('사용자 정보 업데이트에 실패했습니다.');
        }
    }, []);

    const deleteUser = useCallback(async (userId: string) => {
      // This is a complex operation and requires a backend function for security.
      // Deleting a user from the client is highly discouraged.
      // We will only delete from Firestore here and show an alert.
      if (!window.confirm("정말 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다. 인증 정보는 Firebase 콘솔에서 직접 삭제해야 합니다.")) {
          return;
      }
      try {
          const userDocRef = doc(db, 'users', userId);
          await deleteDoc(userDocRef);

          // Update classes that were assigned to the deleted teacher
          const q = query(collection(db, 'classes'), where('teacherId', '==', userId));
          const querySnapshot = await getDocs(q);
          const batch = writeBatch(db);
          querySnapshot.forEach(docSnap => {
              const classRef = doc(db, 'classes', docSnap.id);
              batch.update(classRef, { teacherId: '' }); // or a default teacherId
          });
          await batch.commit();

          alert('사용자 정보가 Firestore에서 삭제되었습니다. 보안을 위해 Firebase Authentication 콘솔에서 해당 사용자를 수동으로 삭제해주세요.');
      } catch (error) {
          console.error("Error deleting user from Firestore:", error);
          alert('사용자 삭제 중 오류가 발생했습니다.');
      }
    }, []);


    // Todo Management
    const addTodo = useCallback(async (date: Date, todoText: string) => {
        if (!currentUser || !todoText.trim()) return;
        const key = formatDateKey(date);
        const userTodosRef = doc(db, 'todos', currentUser.id);
        
        const newTodos = { ...todos };
        const newTodosForDate = [...(newTodos[key] || []), todoText];
        newTodos[key] = newTodosForDate;

        await setDoc(userTodosRef, { dailyTodos: newTodos }, { merge: true });
    }, [currentUser, todos]);

    const removeTodo = useCallback(async (date: Date, indexToRemove: number) => {
        if (!currentUser) return;
        const key = formatDateKey(date);
        const userTodosRef = doc(db, 'todos', currentUser.id);

        const newTodos = { ...todos };
        const currentTodos = newTodos[key] || [];
        const newTodosForDate = currentTodos.filter((_, index) => index !== indexToRemove);
        newTodos[key] = newTodosForDate;

        await setDoc(userTodosRef, { dailyTodos: newTodos }, { merge: true });
    }, [currentUser, todos]);

    // Class Management
    const addClass = useCallback(async (classData: Omit<Class, 'id' | 'students' | 'records' | 'progressTextbooks' | 'homeworkTextbooks'>) => {
        const newClass = {
            ...classData,
            students: [],
            records: [],
            progressTextbooks: [],
            homeworkTextbooks: [],
        };
        await addDoc(collection(db, 'classes'), newClass);
    }, []);

    const updateClass = useCallback(async (classId: string, updatedData: Partial<Omit<Class, 'id' | 'students' | 'records'>>) => {
        const classRef = doc(db, 'classes', classId);
        await updateDoc(classRef, updatedData);
    }, []);

    const deleteClass = useCallback(async (classId: string) => {
        const classRef = doc(db, 'classes', classId);
        await deleteDoc(classRef);
    }, []);

    const updateStudentAttendance = useCallback(async (classId: string, updatedStudents: Student[]) => {
        const classRef = doc(db, 'classes', classId);
        await updateDoc(classRef, { students: updatedStudents });
    }, []);
    
    // Record Management
    const updateClassTextbooksIfNeeded = (cls: Class, newRecord: Partial<ClassRecord>): Partial<Class> => {
        const updatedProgressTextbooks = new Set(cls.progressTextbooks);
        if (newRecord.progressTextbook && !updatedProgressTextbooks.has(newRecord.progressTextbook)) {
            updatedProgressTextbooks.add(newRecord.progressTextbook);
        }

        const updatedHomeworkTextbooks = new Set(cls.homeworkTextbooks);
        if (newRecord.homeworkTextbook && !updatedHomeworkTextbooks.has(newRecord.homeworkTextbook)) {
            updatedHomeworkTextbooks.add(newRecord.homeworkTextbook);
        }

        return {
            progressTextbooks: Array.from(updatedProgressTextbooks).sort(),
            homeworkTextbooks: Array.from(updatedHomeworkTextbooks).sort(),
        };
    };

    const addClassRecord = useCallback(async (classId: string, newRecord: ClassRecord) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;
        
        if (targetClass.records.some(r => r.date === newRecord.date)) {
            alert('이 날짜에 대한 기록이 이미 존재합니다.');
            return;
        }

        const textbookUpdates = updateClassTextbooksIfNeeded(targetClass, newRecord);
        const updatedRecords = [...targetClass.records, newRecord];

        await updateDoc(classRef, { 
            records: updatedRecords, 
            ...textbookUpdates 
        });
    }, [classes]);

    const updateClassRecord = useCallback(async (classId: string, recordDate: string, updatedData: Partial<Omit<ClassRecord, 'date'>>) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;
        
        const textbookUpdates = updateClassTextbooksIfNeeded(targetClass, updatedData);
        const updatedRecords = targetClass.records.map(r => r.date === recordDate ? { ...r, ...updatedData } : r);

        await updateDoc(classRef, { 
            records: updatedRecords, 
            ...textbookUpdates 
        });
    }, [classes]);

    const deleteClassRecord = useCallback(async (classId: string, recordDate: string) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;
        
        const updatedRecords = targetClass.records.filter(r => r.date !== recordDate);
        await updateDoc(classRef, { records: updatedRecords });
    }, [classes]);
    
    // Textbook Management
    const deleteProgressTextbookFromClass = useCallback(async (classId: string, textbookToDelete: string) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;
        
        const updatedTextbooks = targetClass.progressTextbooks.filter(tb => tb !== textbookToDelete);
        await updateDoc(classRef, { progressTextbooks: updatedTextbooks });
    }, [classes]);

    const deleteHomeworkTextbookFromClass = useCallback(async (classId: string, textbookToDelete: string) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;
        
        const updatedTextbooks = targetClass.homeworkTextbooks.filter(tb => tb !== textbookToDelete);
        await updateDoc(classRef, { homeworkTextbooks: updatedTextbooks });
    }, [classes]);

    // Student Management (within a class)
    const addStudentToClass = useCallback(async (classId: string, studentData: Omit<Student, 'id' | 'attendance'>) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;
        
        const newStudent: Student = {
            ...studentData,
            id: `s${Date.now()}`,
            attendance: AttendanceStatus.Unchecked,
        };
        
        const updatedStudents = [...targetClass.students, newStudent];
        await updateDoc(classRef, { students: updatedStudents });
    }, [classes]);

    const updateStudentInClass = useCallback(async (classId: string, studentId: string, updatedData: Partial<Omit<Student, 'id' | 'attendance'>>) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;

        const updatedStudents = targetClass.students.map(s => s.id === studentId ? { ...s, ...updatedData } : s);
        await updateDoc(classRef, { students: updatedStudents });
    }, [classes]);

    const deleteStudentFromClass = useCallback(async (classId: string, studentId: string) => {
        const classRef = doc(db, 'classes', classId);
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass) return;
        
        const updatedStudents = targetClass.students.filter(s => s.id !== studentId);
        await updateDoc(classRef, { students: updatedStudents });
    }, [classes]);

    // This is a computed property, not stored in DB
    const attendanceHistory = useMemo(() => {
        const history: { [key: string]: AttendanceSummary[] } = {};
        classes.forEach(c => {
            c.records.forEach(r => {
                if (!history[r.date]) {
                    history[r.date] = [];
                }
                const summary = c.students.reduce((acc, student) => {
                    if (student.attendance === AttendanceStatus.Present) acc.present++;
                    else if (student.attendance === AttendanceStatus.Absent) acc.absent++;
                    else if (student.attendance === AttendanceStatus.Late) acc.late++;
                    return acc;
                }, { present: 0, absent: 0, late: 0 });

                history[r.date].push({
                    classId: c.id,
                    className: c.name,
                    time: c.time,
                    ...summary
                });
            });
        });
        return history;
    }, [classes]);

    return { 
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
    };
};