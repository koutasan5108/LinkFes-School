
import React, { useMemo, useState, useEffect } from 'react';
import { AppState, AttendanceRecord, LocationCategory, Event, Task, TaskStatus } from '../types';

interface TeacherDashboardProps {
  state: AppState;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ state }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [now, setNow] = useState(new Date());
  const [selectedStudentLogs, setSelectedStudentLogs] = useState<{name: string, logs: AttendanceRecord[]} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filtered Events
  const activeEventOptions = useMemo(() => state.events.filter(e => !e.isFinished), [state.events]);
  const currentEvent = useMemo(() => state.events.find(e => e.id === selectedEventId), [selectedEventId, state.events]);

  // Comprehensive Data Processing
  const processedData = useMemo(() => {
    const studentStats: Record<string, { totalMs: number, logs: AttendanceRecord[], activeRecord: AttendanceRecord | null }> = {};
    
    // 1. Filter attendance records by selected event
    const filteredAttendance = state.attendance.filter(r => 
      selectedEventId === 'all' || r.eventId === selectedEventId
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // 2. Process logs into stats
    filteredAttendance.forEach(record => {
      const student = record.memberName;
      if (!studentStats[student]) {
        studentStats[student] = { totalMs: 0, logs: [], activeRecord: null };
      }
      studentStats[student].logs.push(record);

      if (record.type === 'CHECK_IN') {
        studentStats[student].activeRecord = record;
      } else if (record.type === 'CHECK_OUT' && studentStats[student].activeRecord) {
        const checkIn = studentStats[student].activeRecord;
        const duration = new Date(record.timestamp).getTime() - new Date(checkIn!.timestamp).getTime();
        studentStats[student].totalMs += Math.max(0, duration);
        studentStats[student].activeRecord = null;
      }
    });

    // 3. Transform to displayable array
    return Object.entries(studentStats).map(([name, data]) => {
      let currentSessionMs = 0;
      let isOverworked = false;
      if (data.activeRecord) {
        currentSessionMs = Math.max(0, now.getTime() - new Date(data.activeRecord.timestamp).getTime());
        // Alert if working for more than 3 hours (180 mins)
        if (currentSessionMs > 3 * 60 * 60 * 1000) isOverworked = true;
      }

      const totalMs = data.totalMs + currentSessionMs;
      return {
        name,
        totalMs,
        hours: (totalMs / (1000 * 60 * 60)).toFixed(1),
        isCurrentlyWorking: !!data.activeRecord,
        activeLocation: data.activeRecord?.locationCategory || null,
        activeStartTime: data.activeRecord?.timestamp || null,
        isOverworked,
        logs: data.logs.slice().reverse()
      };
    }).filter(s => s.name.includes(searchTerm))
      .sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours));
  }, [state.attendance, selectedEventId, searchTerm, now]);

  // Aggregate stats for the current view
  const aggregateStats = useMemo(() => {
    const totalHours = processedData.reduce((acc, s) => acc + parseFloat(s.hours), 0);
    const activeCount = processedData.filter(s => s.isCurrentlyWorking).length;
    
    let avgProgress = 0;
    if (selectedEventId !== 'all' && currentEvent) {
      const taskCount = currentEvent.tasks.length;
      avgProgress = taskCount > 0 
        ? Math.round(currentEvent.tasks.reduce((acc, t) => acc + t.progress, 0) / taskCount)
        : 0;
    }

    return { totalHours, activeCount, avgProgress };
  }, [processedData, selectedEventId, currentEvent]);

  // CSV Export
  const downloadCSV = () => {
    const headers = ['生徒名', '合計活動時間(h)', '現在の状態', '最終活動場所', '最終ログ日時'];
    const rows = processedData.map(s => [
      s.name,
      s.hours,
      s.isCurrentlyWorking ? '活動中' : '終了',
      s.activeLocation || '-',
      s.logs[0] ? new Date(s.logs[0].timestamp).toLocaleString('ja-JP') : '-'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `festival_work_stats_${selectedEventId}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const locationThemes: Record<LocationCategory, string> = {
    GYM: 'text-blue-500',
    SHOPPING: 'text-orange-500',
    CLASSROOM: 'text-emerald-500',
    OTHERS: 'text-slate-500'
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">🎓 管理者ダッシュボード</h2>
          <p className="text-slate-400 font-bold mt-2">
            {selectedEventId === 'all' ? '全校・全企画の稼働状況' : `${currentEvent?.title} の詳細管理`}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <select 
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="px-6 py-4 bg-white border-2 border-indigo-100 rounded-3xl font-black text-indigo-600 outline-none shadow-sm focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">🌐 全ての企画</option>
            {activeEventOptions.map(e => (
              <option key={e.id} value={e.id}>#{e.id} {e.title}</option>
            ))}
          </select>
          <button 
            onClick={downloadCSV}
            className="px-6 py-4 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-3xl font-black shadow-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
          >
            📥 CSV出力
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-200">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">総稼働時間</p>
           <h4 className="text-4xl font-black">{aggregateStats.totalHours.toFixed(1)}<span className="text-sm ml-2 opacity-60">h</span></h4>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex items-center justify-between">
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">現在活動中</p>
             <h4 className="text-4xl font-black text-slate-800">{aggregateStats.activeCount}<span className="text-sm ml-2 text-slate-300">名</span></h4>
           </div>
           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${aggregateStats.activeCount > 0 ? 'bg-emerald-50 animate-pulse' : 'bg-slate-50'}`}>
              <div className={`w-3 h-3 rounded-full ${aggregateStats.activeCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
           </div>
        </div>
        {selectedEventId !== 'all' ? (
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">タスク進捗率</p>
            <div className="flex items-center gap-4">
              <h4 className="text-4xl font-black text-slate-800">{aggregateStats.avgProgress}<span className="text-sm text-slate-300">%</span></h4>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${aggregateStats.avgProgress}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">管理企画数</p>
             <h4 className="text-4xl font-black">{activeEventOptions.length}<span className="text-sm ml-2 opacity-40">企画</span></h4>
          </div>
        )}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex items-center gap-4">
           <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-xl">⚠️</div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">アラート</p>
             <p className="text-sm font-black text-slate-700">{processedData.filter(s => s.isOverworked).length} 名が長時間稼働</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
             <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span>👥</span> 生徒別・活動状況一覧
             </h3>
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="名前で絞り込む..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="px-6 py-2 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none text-sm w-full md:w-64"
               />
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">生徒名</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">状態</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">現在の場所</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">累積時間 (企画内)</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {processedData.map(s => (
                  <tr key={s.name} className={`hover:bg-slate-50 transition-colors ${s.isOverworked ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                           {s.name.charAt(0)}
                        </div>
                        <span className="font-black text-slate-700">{s.name}</span>
                        {s.isOverworked && (
                          <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">OVERWORK!</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {s.isCurrentlyWorking ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span className="text-xs font-black text-emerald-600">活動中</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-300">待機・帰宅</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {s.isCurrentlyWorking && s.activeLocation ? (
                        <span className={`text-xs font-black ${locationThemes[s.activeLocation]}`}>
                          📍 {s.activeLocation === 'GYM' ? '体育館' : s.activeLocation === 'SHOPPING' ? '買い出し' : s.activeLocation === 'CLASSROOM' ? '教室' : 'その他'}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-4 py-1.5 rounded-xl font-black text-sm ${parseFloat(s.hours) > 8 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {s.hours}h
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => setSelectedStudentLogs({ name: s.name, logs: s.logs })}
                        className="text-xs font-black text-indigo-600 hover:underline"
                      >
                        詳細ログ表示
                      </button>
                    </td>
                  </tr>
                ))}
                {processedData.length === 0 && (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">データが見つかりません</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Log Modal */}
      {selectedStudentLogs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-8 shrink-0">
               <div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedStudentLogs.name} さんの活動ログ</h2>
                 <p className="text-xs font-bold text-slate-400 mt-1">選択中の企画: {selectedEventId === 'all' ? '全企画' : currentEvent?.title}</p>
               </div>
               <button onClick={() => setSelectedStudentLogs(null)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 flex items-center justify-center text-2xl font-black">&times;</button>
            </div>
            
            <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {selectedStudentLogs.logs.map(log => (
                <div key={log.id} className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between border border-transparent hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${log.type === 'CHECK_IN' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {log.type === 'CHECK_IN' ? '集合' : '解散'}
                     </div>
                     <div>
                        <p className="font-black text-slate-700">{new Date(log.timestamp).toLocaleString('ja-JP')}</p>
                        {log.locationCategory && (
                          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${locationThemes[log.locationCategory]}`}>
                             📍 {log.locationCategory} {log.locationDetail ? `(${log.locationDetail})` : ''}
                          </p>
                        )}
                     </div>
                  </div>
                  {selectedEventId === 'all' && (
                    <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-400">
                       EVENT ID: {log.eventId}
                    </span>
                  )}
                </div>
              ))}
              {selectedStudentLogs.logs.length === 0 && (
                <p className="text-center py-20 text-slate-300 font-bold">ログデータがありません</p>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedStudentLogs(null)}
              className="mt-8 w-full py-5 bg-slate-900 text-white font-black rounded-[24px] shadow-xl hover:bg-slate-800 transition-all shrink-0"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div className="bg-amber-50 p-8 rounded-[40px] border-2 border-amber-100 flex items-center gap-6">
        <span className="text-4xl">🛡️</span>
        <div className="text-xs font-bold text-amber-700 leading-relaxed">
          <p className="text-lg font-black mb-1">先生へ：労務管理のアドバイス</p>
          <p className="opacity-80">
            3時間を超える連続作業は集中力の低下を招きます。赤いアラートが出ている生徒には休憩を促してください。
            また、タスクの進捗が思わしくない企画には、人員の再配置を検討してください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
