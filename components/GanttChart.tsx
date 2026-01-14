
import React, { useMemo, useState } from 'react';
import { Task, TaskStatus, EventMeeting } from '../types';
import CountdownTimer from './CountdownTimer';

interface GanttChartProps {
  tasks: Task[];
  meetings: EventMeeting[];
  onAddMeeting: (meeting: Omit<EventMeeting, 'id'>) => void;
  onDeleteMeeting: (id: string) => void;
  isLeader: boolean;
  targetDate?: string;
  targetLabel?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, meetings, onAddMeeting, onDeleteMeeting, isLeader, targetDate, targetLabel }) => {
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '' });

  // タイムラインの表示範囲を計算（タスク・予定・今日・目標日をすべて含む）
  const dates = useMemo(() => {
    const allDateValues = [
      ...tasks.map(t => new Date(t.startDate).getTime()),
      ...tasks.map(t => new Date(t.endDate).getTime()),
      ...meetings.map(m => new Date(m.date).getTime()),
      new Date().getTime()
    ];
    
    if (targetDate) allDateValues.push(new Date(targetDate).getTime());
    
    if (allDateValues.length === 0) return [];
    
    const minDate = new Date(Math.min(...allDateValues));
    const maxDate = new Date(Math.max(...allDateValues));
    
    // 前後に少し余裕を持たせる
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 7);
    
    const dateArray: Date[] = [];
    let current = new Date(minDate);
    while (current <= maxDate) {
      dateArray.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dateArray;
  }, [tasks, meetings, targetDate]);

  const todayStr = new Date().toISOString().split('T')[0];
  const colWidth = 100; // 1日あたりのpx幅（目安）

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date) return;
    onAddMeeting(newMeeting);
    setNewMeeting({ title: '', date: '' });
    setShowMeetingForm(false);
  };

  if (dates.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-slate-100">
        <p className="text-slate-400 font-bold">表示する工程データがありません。タスクを作成してください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* 1. 最上部の特大カウントダウン */}
      {targetDate && (
        <CountdownTimer targetDate={targetDate} label={targetLabel || '目標日'} />
      )}

      {/* 2. アクションエリア */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">工程・タイムライン</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Project Roadmap</p>
        </div>
        {isLeader && (
          <button 
            onClick={() => setShowMeetingForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>+</span> 予定を追加
          </button>
        )}
      </div>

      {/* 予定追加フォーム */}
      {showMeetingForm && (
        <div className="bg-white p-6 rounded-[32px] border-2 border-indigo-100 shadow-2xl animate-in zoom-in duration-300">
          <form onSubmit={handleAddMeeting} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase px-1">予定名</label>
              <input required type="text" value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-400 focus:bg-white transition-all" placeholder="例: チュロス試作会 / 買い出し" />
            </div>
            <div className="w-full md:w-48">
              <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase px-1">日付</label>
              <input required type="date" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-400 focus:bg-white transition-all" />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button type="submit" className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg">保存</button>
              <button type="button" onClick={() => setShowMeetingForm(false)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black">× カンセル</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. ガントチャート本体 */}
      <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div style={{ width: dates.length * colWidth }} className="relative min-h-[400px]">
            
            {/* 日付ヘッダー */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {dates.map((date, idx) => {
                const isToday = date.toISOString().split('T')[0] === todayStr;
                return (
                  <div key={idx} style={{ width: colWidth }} className={`flex-shrink-0 py-4 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-indigo-50' : ''}`}>
                    <p className={`text-[8px] font-black uppercase tracking-widest ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {date.toLocaleDateString('ja-JP', { month: 'short' })}
                    </p>
                    <p className={`text-xl font-black ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {date.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 今日を示す垂直線 */}
            {dates.map((date, idx) => {
               if (date.toISOString().split('T')[0] === todayStr) {
                 return (
                   <div 
                    key="today-line" 
                    className="absolute top-0 bottom-0 z-10 border-l-2 border-rose-500/50 pointer-events-none"
                    style={{ left: idx * colWidth + colWidth/2 }}
                   >
                     <div className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full absolute top-2 -translate-x-1/2">TODAY</div>
                   </div>
                 );
               }
               return null;
            })}

            {/* コンテンツエリア（タスク行） */}
            <div className="py-8 space-y-6">
              {tasks.length === 0 && (
                <div className="text-center py-20 text-slate-300 font-bold">タスクを登録してタイムラインを表示しましょう</div>
              )}
              
              {tasks.map((task) => {
                const startIdx = dates.findIndex(d => d.toISOString().split('T')[0] === task.startDate);
                const endIdx = dates.findIndex(d => d.toISOString().split('T')[0] === task.endDate);
                
                if (startIdx === -1 || endIdx === -1) return null;

                const left = startIdx * colWidth + 10;
                const width = (endIdx - startIdx + 1) * colWidth - 20;

                return (
                  <div key={task.id} className="relative h-12 group">
                    <div 
                      className="absolute h-full rounded-2xl flex items-center px-4 shadow-lg transition-all hover:scale-[1.02] cursor-default overflow-hidden"
                      style={{ 
                        left, 
                        width, 
                        backgroundColor: task.status === TaskStatus.DONE ? '#10b981' : '#4f46e5' 
                      }}
                    >
                      {/* 進捗背景 */}
                      <div className="absolute inset-0 bg-black/20" style={{ width: `${100 - task.progress}%`, left: `${task.progress}%` }}></div>
                      
                      <div className="relative z-10 flex items-center justify-between w-full text-white truncate">
                        <span className="font-black text-xs truncate mr-2">{task.title}</span>
                        <span className="text-[10px] font-mono opacity-80">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* マイルストーン・予定（ピン留め表示） */}
              <div className="mt-12 pt-12 border-t border-slate-50 relative min-h-[100px]">
                {meetings.map((meeting) => {
                  const idx = dates.findIndex(d => d.toISOString().split('T')[0] === meeting.date);
                  if (idx === -1) return null;
                  return (
                    <div 
                      key={meeting.id}
                      className="absolute top-4 flex flex-col items-center group"
                      style={{ left: idx * colWidth + colWidth / 2 - 12 }}
                    >
                      <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs shadow-lg shadow-amber-100 group-hover:scale-125 transition-all">🚩</div>
                      <div className="absolute top-8 bg-white border border-slate-100 p-3 rounded-2xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
                         <p className="font-black text-slate-800 text-xs">{meeting.title}</p>
                         <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{meeting.date}</p>
                         {isLeader && (
                           <button onClick={() => onDeleteMeeting(meeting.id)} className="mt-2 text-rose-500 text-[8px] font-black pointer-events-auto">予定を削除</button>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-[32px] flex items-center gap-4 border border-indigo-100">
        <span className="text-2xl">💡</span>
        <div className="text-xs font-bold text-indigo-700 leading-relaxed">
          <p>バーの長さは期間を、色の濃さは進捗状況を表しています。</p>
          <p className="opacity-70 mt-1">タスクの期間を調整するには、タスク一覧から日付を編集してください。</p>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
