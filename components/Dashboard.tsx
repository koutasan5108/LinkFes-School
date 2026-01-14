
import React, { useState } from 'react';
import { AppState, Event, User, Schedule, Task } from '../types';
import QuickAction from './QuickAction';
import { FAQ_DATA } from '../constants';

interface DashboardProps {
  state: AppState;
  currentUser: User;
  urgentTask: (Task & { eventId: string, eventTitle: string }) | null;
  onSelectEvent: (id: string) => void;
  onCreateEvent: (ev: Omit<Event, 'tasks' | 'isFinished' | 'meetings'>) => void;
  onAddSchedule: (sched: Omit<Schedule, 'id' | 'createdBy'>) => void;
  onDeleteSchedule: (id: string) => void;
  toast: any;
  setToast: any;
}

const Dashboard: React.FC<DashboardProps> = ({ state, currentUser, urgentTask, onSelectEvent, onCreateEvent, onAddSchedule, onDeleteSchedule, toast, setToast }) => {
  const [faqSearch, setFaqSearch] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSchedModalOpen, setIsSchedModalOpen] = useState(false);

  const activeEvents = state.events.filter(e => !e.isFinished);
  const finishedEvents = state.events.filter(e => e.isFinished);
  const filteredFaq = FAQ_DATA.filter(f => f.q.includes(faqSearch) || f.a.includes(faqSearch));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Most Urgent Task Section */}
      {urgentTask && (
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-[40px] p-8 text-white shadow-2xl shadow-rose-200 relative overflow-hidden group cursor-pointer" onClick={() => onSelectEvent(urgentTask.eventId)}>
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
             <span className="text-9xl font-black">!</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">🚨 最優先ミッション</span>
              <span className="text-xs font-bold text-white/80">あなたの担当タスク</span>
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">{urgentTask.title}</h2>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="bg-white/20 px-5 py-2 rounded-2xl">
                <p className="text-[10px] font-black text-white/60 uppercase">期限</p>
                <p className="font-black text-lg">{urgentTask.endDate}</p>
              </div>
              <div className="bg-white/20 px-5 py-2 rounded-2xl">
                <p className="text-[10px] font-black text-white/60 uppercase">企画</p>
                <p className="font-black text-lg">{urgentTask.eventTitle}</p>
              </div>
              <div className="bg-white/20 px-5 py-2 rounded-2xl">
                <p className="text-[10px] font-black text-white/60 uppercase">優先度</p>
                <p className="font-black text-lg">{urgentTask.priority === 'HIGH' ? '🔴 高' : '🟡 中'}</p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 font-black text-sm text-white/90">
               詳細を確認して作業を開始する <span className="text-xl">→</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quick Action */}
      <QuickAction events={state.events} currentUser={currentUser.name} onEventJump={onSelectEvent} toast={toast} setToast={setToast} />

      {/* 3. Global Schedules */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">📅 全体連絡・ミーティング</h2>
          </div>
          {currentUser.role === 'LEADER' && (
            <button onClick={() => setIsSchedModalOpen(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg">予定を追加</button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {state.schedules.length === 0 ? (
            <p className="col-span-full py-12 text-center text-slate-300 font-bold border-2 border-dashed border-slate-50 rounded-3xl">登録された予定はありません</p>
          ) : (
            state.schedules.map(s => (
              <div key={s.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 relative group">
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full block w-fit mb-3">{s.date} {s.time}</span>
                <h4 className="font-black text-slate-800 mb-2">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/50">
                  <span className="text-[9px] font-black text-slate-300">By {s.createdBy}</span>
                  {currentUser.role === 'LEADER' && (
                    <button onClick={() => onDeleteSchedule(s.id)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black">削除</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Event Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            🚀 進行中の企画一覧
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">{activeEvents.length}</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {activeEvents.map(ev => (
              <EventCard key={ev.id} event={ev} onSelect={onSelectEvent} />
            ))}
            {currentUser.role === 'LEADER' && (
              <button onClick={() => setIsEventModalOpen(true)} className="w-full border-4 border-dashed border-slate-200 p-8 rounded-[40px] text-slate-400 font-black hover:bg-white hover:border-indigo-400 hover:text-indigo-500 transition-all flex flex-col items-center gap-2 group">
                <span className="text-4xl group-hover:scale-125 transition-transform">➕</span> 新規企画を作成
              </button>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-black text-slate-400 mb-6 flex items-center gap-3">
            📦 終了したアーカイブ
            <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{finishedEvents.length}</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 opacity-60">
            {finishedEvents.map(ev => (
              <EventCard key={ev.id} event={ev} onSelect={onSelectEvent} isFinished />
            ))}
            {finishedEvents.length === 0 && <div className="py-12 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[40px]">終了した企画はありません</div>}
          </div>
        </section>
      </div>

      {/* Modals */}
      {isSchedModalOpen && (
        <Modal title="新しい予定" onClose={() => setIsSchedModalOpen(false)}>
           <ScheduleForm onSubmit={(s) => { onAddSchedule(s); setIsSchedModalOpen(false); }} />
        </Modal>
      )}
      {isEventModalOpen && (
        <Modal title="新規企画の作成" onClose={() => setIsEventModalOpen(false)}>
           <EventForm onSubmit={(e) => { onCreateEvent(e); setIsEventModalOpen(false); }} />
        </Modal>
      )}
    </div>
  );
};

// Fix: Use an interface and React.FC for EventCard to handle props and key properly
interface EventCardProps {
  event: Event;
  onSelect: (id: string) => void;
  isFinished?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onSelect, isFinished = false }) => (
  <div 
    onClick={() => onSelect(event.id)} 
    className={`bg-white p-6 rounded-[32px] border shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group overflow-hidden ${isFinished ? 'border-slate-100' : 'border-slate-50'}`}
  >
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-lg ${isFinished ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-emerald-400'}`}>
        #{event.id}
      </div>
      <div>
        <h4 className={`text-lg font-black ${isFinished ? 'text-slate-400' : 'text-slate-800'}`}>{event.title}</h4>
        <div className="flex gap-2">
           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${isFinished ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
            {event.tasks.length} Tasks
           </span>
           {event.targetDate && !isFinished && (
             <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">
               🏁 {new Date(event.targetDate).toLocaleDateString()}
             </span>
           )}
        </div>
      </div>
    </div>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFinished ? 'text-slate-200' : 'text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
      →
    </div>
  </div>
);

// Fix: Use an interface and React.FC for Modal to handle children and other props properly
interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
    <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
        <button onClick={onClose} className="text-2xl text-slate-400">&times;</button>
      </div>
      {children}
    </div>
  </div>
);

const ScheduleForm = ({ onSubmit }: { onSubmit: (s: any) => void }) => {
  const [data, setData] = useState({ title: '', date: '', time: '', description: '' });
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <input required type="text" placeholder="タイトル" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
      <div className="grid grid-cols-2 gap-4">
        <input required type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all" value={data.date} onChange={e => setData({...data, date: e.target.value})} />
        <input required type="time" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all" value={data.time} onChange={e => setData({...data, time: e.target.value})} />
      </div>
      <textarea placeholder="詳細" className="w-full p-4 bg-slate-50 rounded-2xl font-bold h-32 outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all" value={data.description} onChange={e => setData({...data, description: e.target.value})} />
      <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all">予定を保存</button>
    </form>
  );
};

const EventForm = ({ onSubmit }: { onSubmit: (e: any) => void }) => {
  const [data, setData] = useState({ 
    id: '', 
    title: '', 
    description: '', 
    targetLabel: '一般公開',
    targetDate: '',
    targetTime: '10:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isoDateTime = `${data.targetDate}T${data.targetTime}:00`;
    onSubmit({
      id: data.id,
      title: data.title,
      description: data.description,
      targetLabel: data.targetLabel,
      targetDate: isoDateTime
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">ID (3桁)</label>
          <input required type="text" maxLength={3} placeholder="000" className="w-full p-4 bg-slate-50 rounded-2xl font-mono font-black text-xl outline-none" value={data.id} onChange={e => setData({...data, id: e.target.value})} />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">企画名</label>
          <input required type="text" placeholder="チュロス屋台" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">目標日・デッドラインの設定</h4>
        <div className="space-y-4">
           <div>
            <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase px-1">種別</label>
            <select value={data.targetLabel} onChange={e => setData({...data, targetLabel: e.target.value})} className="w-full p-4 bg-white rounded-2xl font-bold border-none outline-none shadow-sm">
              <option value="一般公開">一般公開</option>
              <option value="最終締切">最終締切</option>
              <option value="イベント終了">イベント終了</option>
              <option value="文化祭開始">文化祭開始</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase px-1">日付</label>
              <input required type="date" value={data.targetDate} onChange={e => setData({...data, targetDate: e.target.value})} className="w-full p-4 bg-white rounded-2xl font-bold shadow-sm outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase px-1">時刻</label>
              <input required type="time" value={data.targetTime} onChange={e => setData({...data, targetTime: e.target.value})} className="w-full p-4 bg-white rounded-2xl font-bold shadow-sm outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">企画の詳細説明</label>
        <textarea placeholder="企画の目的や概要を入力してください..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold h-24 outline-none" value={data.description} onChange={e => setData({...data, description: e.target.value})} />
      </div>

      <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-[24px] shadow-xl text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
        🚀 企画を立ち上げる
      </button>
    </form>
  );
};

export default Dashboard;
