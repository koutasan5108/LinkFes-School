
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, Event, Task, AttendanceRecord, TaskStatus, User, UserRole, Schedule, MemberStatus, ActiveTab } from './types';
import { INITIAL_STATE } from './constants';
import Navbar from './components/Navbar';
import KanbanBoard from './components/KanbanBoard';
import GanttChart from './components/GanttChart';
import AttendanceManager from './components/AttendanceManager';
import MemberProfiles from './components/MemberProfiles';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Guide from './components/Guide';
import FAQ from './components/FAQ';
import TeacherDashboard from './components/TeacherDashboard';
import { initializeFirebase, syncStateToCloud, subscribeToCloudState } from './lib/firebase';

const STORAGE_KEY = 'linkfes_data_v1';
const AUTH_KEY = 'linkfes_auth_v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCloudActive, setIsCloudActive] = useState(false);
  const isSyncingRef = useRef(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_STATE; }
    }
    return INITIAL_STATE;
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- FIREBASE SYNC LOGIC ---
  useEffect(() => {
    const projectId = localStorage.getItem('cloud_project_id');
    const configStr = localStorage.getItem('firebase_config');
    
    if (projectId && configStr) {
      try {
        const config = JSON.parse(configStr);
        const db = initializeFirebase(config);
        
        if (db) {
          setIsCloudActive(true);
          console.log("Connecting to LinkFes Cloud...");
          
          // Subscribe to cloud changes
          const unsubscribe = subscribeToCloudState(projectId, (cloudState) => {
            isSyncingRef.current = true; // Block local-to-cloud push during incoming sync
            setState(cloudState);
            setTimeout(() => { isSyncingRef.current = false; }, 500);
          });
          
          return () => unsubscribe();
        }
      } catch (e) {
        console.error("Cloud config invalid", e);
      }
    }
  }, []);

  // Persist and Sync local changes to cloud
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Only push to cloud if we're connected AND NOT currently receiving a sync update
    const projectId = localStorage.getItem('cloud_project_id');
    if (isCloudActive && projectId && !isSyncingRef.current) {
      syncStateToCloud(projectId, state);
    }
  }, [state, isCloudActive]);
  // --- END SYNC LOGIC ---

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'TEACHER') {
      triggerToast('管理者モード（先生）でログインしました');
    }
    if (!state.members.includes(user.name)) {
      addMember(user.name);
    }
  };

  const handleLogout = () => {
    if (!confirm('ログアウトしますか？')) return;
    setCurrentUser(null);
    setSelectedEventId(null);
    setActiveTab('dashboard');
  };

  const handleRoleChange = (role: UserRole) => {
    if (!currentUser) return;
    if (role === 'TEACHER') {
      const pass = prompt('先生用パスワードを入力してください (初期: teacher)');
      if (pass !== 'teacher') {
        alert('パスワードが違います');
        return;
      }
    }
    setCurrentUser({ ...currentUser, role });
    triggerToast(`ロールを ${role} に変更しました`);
  };

  const updateUserProfile = (name: string, avatar: string) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, name, avatar });
    triggerToast('プロフィールを更新しました');
  };

  const addMember = (name: string) => {
    if (!name.trim() || state.members.includes(name)) return;
    setState(prev => ({ ...prev, members: [...prev.members, name] }));
  };

  const updateMemberStatus = (status: MemberStatus) => {
    setState(prev => ({
      ...prev,
      memberStatuses: { ...prev.memberStatuses, [status.memberName]: status }
    }));
    triggerToast('ステータスを更新しました');
  };

  const currentEvent = state.events.find(e => e.id === selectedEventId);
  const isGlobalAdmin = currentUser?.role === 'TEACHER';
  const isGuest = currentUser?.role === 'GUEST';
  const isEventLeader = useMemo(() => {
    if (isGlobalAdmin) return true;
    if (isGuest) return false;
    return currentEvent?.leaderNames.includes(currentUser?.name || '') || false;
  }, [currentEvent, currentUser, isGlobalAdmin, isGuest]);

  const urgentTask = useMemo(() => {
    if (!currentUser || isGuest) return null;
    const allMyTasks = state.events.flatMap(ev => 
      ev.tasks
        .filter(t => t.assignees.includes(currentUser.name) && t.status !== TaskStatus.DONE)
        .map(t => ({ ...t, eventId: ev.id, eventTitle: ev.title }))
    );
    if (allMyTasks.length === 0) return null;
    return allMyTasks.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];
  }, [state.events, currentUser, isGuest]);

  const addSchedule = (sched: Omit<Schedule, 'id' | 'createdBy'>) => {
    const newSched: Schedule = { ...sched, id: crypto.randomUUID(), createdBy: currentUser?.name || 'Unknown' };
    setState(prev => ({ ...prev, schedules: [newSched, ...prev.schedules] }));
    triggerToast('全体連絡を追加しました');
  };

  const createEvent = (ev: Omit<Event, 'tasks' | 'isFinished' | 'meetings'>) => {
    const newEvent: Event = { ...ev, tasks: [], isFinished: false, meetings: [], leaderNames: [currentUser?.name || ''] };
    setState(prev => ({ ...prev, events: [...prev.events, newEvent] }));
    triggerToast(`新規企画 ${ev.title} を立ち上げました！`);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (!selectedEventId) return;
    setState(prev => ({
      ...prev,
      events: prev.events.map(ev => ev.id === selectedEventId 
        ? { ...ev, tasks: ev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) } 
        : ev)
    }));
  };

  const addTaskToEvent = (t: Omit<Task, 'id'>) => {
    if (!selectedEventId) return;
    setState(prev => ({
      ...prev,
      events: prev.events.map(ev => ev.id === selectedEventId 
        ? { ...ev, tasks: [...ev.tasks, { ...t, id: `t${Date.now()}` }] } 
        : ev)
    }));
  };

  const sendMessage = (text: string) => {
    if (!selectedEventId) return;
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: crypto.randomUUID(),
        eventId: selectedEventId,
        senderName: currentUser?.name || 'Unknown',
        senderId: currentUser?.id || 'Unknown',
        text,
        timestamp: new Date().toLocaleString('ja-JP')
      }]
    }));
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  if (currentUser.role === 'UNSET') {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[48px] max-w-md w-full p-10 shadow-2xl animate-in zoom-in duration-300">
          <span className="text-5xl block mb-6">👤</span>
          <h2 className="text-2xl font-black text-slate-800 mb-4">LinkFesへようこそ</h2>
          <p className="text-sm font-bold text-slate-400 mb-8">お疲れ様です、{currentUser.name}さん。<br/>運営メンバー（生徒）として開始しますか？</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => handleRoleChange('STUDENT')} className="py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl">生徒として利用開始</button>
            <button onClick={() => { setCurrentUser(null); localStorage.removeItem(AUTH_KEY); }} className="py-2 text-slate-300 font-bold text-xs">キャンセル</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8 selection:bg-indigo-100">
      <Navbar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        currentUser={currentUser} onLogout={handleLogout} 
        selectedEventId={selectedEventId} setSelectedEventId={setSelectedEventId}
        isCloudActive={isCloudActive}
      />
      
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full shadow-2xl font-black text-white animate-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-indigo-600' : 'bg-rose-500'}`}>
           {toast.message}
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            state={state} currentUser={currentUser} urgentTask={urgentTask}
            onSelectEvent={(id) => { setSelectedEventId(id); setActiveTab('kanban'); }}
            onCreateEvent={createEvent} onAddSchedule={addSchedule}
            onDeleteSchedule={(id) => setState(prev => ({...prev, schedules: prev.schedules.filter(s => s.id !== id)}))}
            toast={toast} setToast={setToast}
          />
        )}

        {activeTab === 'guide' && <Guide />}
        {activeTab === 'faq' && <FAQ />}
        {activeTab === 'teacher_stats' && <TeacherDashboard state={state} />}

        {selectedEventId && currentEvent && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 text-emerald-400 px-4 py-1.5 rounded-2xl font-mono font-black shadow-lg">#{currentEvent.id}</div>
                <h2 className="font-black text-slate-800 text-xl tracking-tight">{currentEvent.title}</h2>
              </div>
            </div>

            {activeTab === 'kanban' && (
              <KanbanBoard 
                tasks={currentEvent.tasks} members={state.members} 
                updateTaskStatus={(tid, status) => !isGuest && updateTask(tid, { status })} 
                updateTask={updateTask} 
                deleteTask={(tid) => setState(prev => ({ ...prev, events: prev.events.map(ev => ev.id === selectedEventId ? { ...ev, tasks: ev.tasks.filter(t => t.id !== tid) } : ev) }))} 
                addTask={addTaskToEvent} selectedTask={selectedTask} setSelectedTask={setSelectedTask}
                currentUserName={currentUser.name} readOnly={isGuest} canManage={isEventLeader}
              />
            )}

            {activeTab === 'gantt' && (
              <GanttChart 
                tasks={currentEvent.tasks} meetings={currentEvent.meetings || []} 
                onAddMeeting={(m) => setState(prev => ({...prev, events: prev.events.map(ev => ev.id === selectedEventId ? {...ev, meetings: [...ev.meetings, {...m, id: crypto.randomUUID()}]} : ev)}))}
                onDeleteMeeting={(id) => setState(prev => ({...prev, events: prev.events.map(ev => ev.id === selectedEventId ? {...ev, meetings: ev.meetings.filter(m => m.id !== id)} : ev)}))}
                isLeader={isEventLeader} targetDate={currentEvent.targetDate} targetLabel={currentEvent.targetLabel}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceManager 
                members={state.members} records={state.attendance.filter(r => r.eventId === selectedEventId)} 
                tasks={currentEvent.tasks} events={[currentEvent]} memberStatuses={state.memberStatuses} 
                onUpdateStatus={updateMemberStatus}
                addAttendance={(r) => { setState(prev => ({ ...prev, attendance: [{ ...r, id: crypto.randomUUID() }, ...prev.attendance] })); triggerToast('打刻完了'); }} 
                addMember={addMember} currentUser={currentUser} 
              />
            )}

            {activeTab === 'chat' && (
              <ChatRoom 
                messages={state.messages.filter(m => m.eventId === selectedEventId)} 
                currentUser={currentUser} onSendMessage={sendMessage}
                eventTitle={currentEvent.title} readOnly={isGuest}
              />
            )}
          </div>
        )}

        {activeTab === 'profile' && <MemberProfiles currentUser={currentUser} onLogout={handleLogout} onUpdateProfile={updateUserProfile} />}
      </main>
    </div>
  );
};

export default App;


