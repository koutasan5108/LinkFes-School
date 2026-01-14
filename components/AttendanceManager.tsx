
import React, { useState, useMemo, useEffect } from 'react';
import { AttendanceRecord, AttendanceType, User, Task, Event, MemberStatus, LocationCategory } from '../types';

interface AttendanceManagerProps {
  members: string[];
  records: AttendanceRecord[];
  tasks: Task[];
  events: Event[];
  memberStatuses: Record<string, MemberStatus>;
  onUpdateStatus: (status: MemberStatus) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  addMember: (name: string) => void;
  currentUser: User;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ members, records, tasks, events, memberStatuses, onUpdateStatus, addAttendance, addMember, currentUser }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationCategory>('GYM');
  const [locationDetail, setLocationDetail] = useState('');
  const [customStatus, setCustomStatus] = useState({ type: 'AVAILABLE' as any, message: '' });
  const [filter, setFilter] = useState<LocationCategory | 'ALL'>('ALL');

  const locationThemes: Record<LocationCategory, { bg: string, text: string, label: string, colorClass: string }> = {
    GYM: { bg: 'bg-blue-50', text: 'text-blue-700', label: '体育館', colorClass: 'bg-blue-500' },
    SHOPPING: { bg: 'bg-orange-50', text: 'text-orange-700', label: '買い出し', colorClass: 'bg-orange-500' },
    CLASSROOM: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '教室', colorClass: 'bg-emerald-500' },
    OTHERS: { bg: 'bg-slate-50', text: 'text-slate-700', label: 'その他', colorClass: 'bg-slate-500' }
  };

  const memberAttendanceMap = useMemo(() => {
    const map: Record<string, { 
      type: AttendanceType | 'NEVER', 
      timestamp: string, 
      locationCategory?: LocationCategory, 
      locationDetail?: string 
    }> = {};
    
    members.forEach(m => { map[m] = { type: 'NEVER', timestamp: '' }; });
    
    const sorted = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    sorted.forEach(record => { 
      map[record.memberName] = { 
        type: record.type, 
        timestamp: record.timestamp, 
        locationCategory: record.locationCategory,
        locationDetail: record.locationDetail
      }; 
    });
    return map;
  }, [members, records]);

  const locationCounts = useMemo(() => {
    const counts: Record<LocationCategory | 'TOTAL', number> = {
      GYM: 0, SHOPPING: 0, CLASSROOM: 0, OTHERS: 0, TOTAL: 0
    };
    members.forEach(m => {
      const att = memberAttendanceMap[m];
      if (att.type === 'CHECK_IN' && att.locationCategory) {
        counts[att.locationCategory]++;
        counts.TOTAL++;
      }
    });
    return counts;
  }, [members, memberAttendanceMap]);

  const handleAction = (type: AttendanceType) => {
    const timestamp = new Date().toISOString(); // Use ISO for accurate sorting, format for display
    addAttendance({ 
      memberName: currentUser.name, 
      eventId: events[0]?.id || '000', 
      type, 
      timestamp,
      locationCategory: type === 'CHECK_IN' ? selectedLocation : undefined,
      locationDetail: type === 'CHECK_IN' ? (selectedLocation === 'OTHERS' ? locationDetail : '') : ''
    });
    if (type === 'CHECK_IN') setLocationDetail('');
  };

  const submitStatus = () => {
    onUpdateStatus({
      memberName: currentUser.name,
      statusType: customStatus.type,
      message: customStatus.message,
      updatedAt: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    });
    setCustomStatus({ ...customStatus, message: '' });
  };

  const statusThemes: Record<string, { bg: string, text: string, label: string }> = {
    AVAILABLE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '作業可能' },
    BUSY: { bg: 'bg-rose-100', text: 'text-rose-700', label: '忙しい' },
    LATER: { bg: 'bg-amber-100', text: 'text-amber-700', label: '後ほど参加' },
    CLUB: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '部活・授業中' }
  };

  const filteredMembers = members.filter(m => {
    if (filter === 'ALL') return true;
    const att = memberAttendanceMap[m];
    return att.type === 'CHECK_IN' && att.locationCategory === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Location Summary Bar */}
      <div className="bg-white rounded-[40px] p-6 shadow-xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3 px-2">
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-lg">📍</div>
             <div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">現在の居場所集計</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Where is everyone now?</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <SummaryTag label="全員" count={locationCounts.TOTAL} active={filter === 'ALL'} onClick={() => setFilter('ALL')} color="bg-slate-900" />
            {(Object.keys(locationThemes) as LocationCategory[]).map(cat => (
              <SummaryTag 
                key={cat} 
                label={locationThemes[cat].label} 
                count={locationCounts[cat]} 
                active={filter === cat} 
                onClick={() => setFilter(cat)} 
                color={locationThemes[cat].colorClass} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attendance Check-in with Enhanced Locations */}
        <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs">⚡</span>
            クイック打刻
          </h3>
          <div className="space-y-6 flex-1">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">活動場所を選択</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(locationThemes) as LocationCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedLocation(cat)}
                    className={`p-4 rounded-2xl text-xs font-black transition-all border-2 ${
                      selectedLocation === cat 
                        ? `${locationThemes[cat].colorClass} text-white border-transparent shadow-lg scale-105` 
                        : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {locationThemes[cat].label}
                  </button>
                ))}
              </div>
            </div>

            {selectedLocation === 'OTHERS' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">具体的な場所</label>
                <input 
                  type="text" 
                  value={locationDetail} 
                  onChange={e => setLocationDetail(e.target.value)}
                  placeholder="例: 中庭、職員室など"
                  className="w-full p-4 bg-slate-50 border-2 border-indigo-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-inner"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button onClick={() => handleAction('CHECK_IN')} className="py-6 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">集合</button>
              <button onClick={() => handleAction('CHECK_OUT')} className="py-6 bg-white border-2 border-slate-100 text-slate-400 rounded-[24px] font-black text-lg hover:border-rose-400 hover:text-rose-400 transition-all">解散</button>
            </div>
            
            <p className="text-[9px] font-bold text-slate-300 text-center leading-relaxed mt-2">
              既に集合中の場合、新しい場所を選んで<br/>「集合」を押すと場所情報が更新されます。
            </p>
          </div>
        </div>

        {/* Status Messenger */}
        <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 lg:col-span-2">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center text-white text-xs">💬</span>
            ひとこと状況報告
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">ステータス</label>
              <select value={customStatus.type} onChange={e => setCustomStatus({...customStatus, type: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all appearance-none">
                <option value="AVAILABLE">✅ 作業可能</option>
                <option value="BUSY">⚠️ 忙しい・集中中</option>
                <option value="CLUB">🏸 部活・授業中</option>
                <option value="LATER">🕒 後ほど参加</option>
              </select>
            </div>
            <div className="md:col-span-8 flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">メッセージ (合流時間など)</label>
              <div className="flex gap-3">
                <input 
                  type="text" value={customStatus.message} onChange={e => setCustomStatus({...customStatus, message: e.target.value})}
                  placeholder="例: 17時から合流します / 資料作成中"
                  className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner"
                />
                <button onClick={submitStatus} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">更新</button>
              </div>
            </div>
          </div>
          <div className="mt-8 p-5 bg-indigo-50 rounded-[28px] flex items-center gap-4">
            <span className="text-3xl animate-pulse">💡</span>
            <p className="text-[11px] font-bold text-indigo-700 leading-relaxed">
              作業可能なメンバーは「作業可能」に設定しましょう。手が空いている人にリーダーから仕事の依頼が行くかもしれません！
            </p>
          </div>
        </div>
      </div>

      {/* Member List with Location-Based Coloring */}
      <div className="bg-white rounded-[48px] p-10 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">メンバー稼働状況</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {filter === 'ALL' ? '全メンバー表示中' : `${locationThemes[filter as LocationCategory].label} のメンバーを表示中`}
            </p>
          </div>
          <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            TOTAL: {members.length} MEMBERS
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[40px]">
            <span className="text-5xl block mb-4 grayscale opacity-30">🔍</span>
            <p className="font-black text-slate-300">該当するメンバーは見つかりませんでした</p>
            <button onClick={() => setFilter('ALL')} className="mt-4 text-indigo-500 font-bold text-xs underline">全てのフィルターを解除</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => {
              const att = memberAttendanceMap[member];
              const active = att.type === 'CHECK_IN';
              const status = memberStatuses[member];
              const theme = status ? statusThemes[status.statusType] : null;
              const locationTheme = active && att.locationCategory ? locationThemes[att.locationCategory] : null;
              
              return (
                <div 
                  key={member} 
                  className={`p-6 rounded-[32px] border-2 transition-all relative overflow-hidden group ${
                    active ? (locationTheme?.bg || 'bg-indigo-50') + ' border-white shadow-md' : 'bg-slate-50 border-transparent opacity-60 grayscale-[0.5]'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                      active ? (locationTheme?.colorClass || 'bg-indigo-600') + ' text-white shadow-lg' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {member.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-800 truncate">{member}</p>
                      {active && locationTheme && (
                        <div className={`flex items-center gap-1 mt-0.5`}>
                          <span className={`text-[9px] font-black ${locationTheme.text} uppercase tracking-tighter`}>
                             📍 {locationTheme.label} {att.locationDetail && `(${att.locationDetail})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {status ? (
                    <div className={`mt-2 p-4 rounded-2xl ${theme?.bg} ${theme?.text} border border-white/50 shadow-sm transition-all group-hover:scale-[1.02]`}>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">
                        {theme?.label}
                      </p>
                      <p className="text-xs font-bold leading-relaxed line-clamp-2">
                        {status.message || '状況報告なし'}
                      </p>
                      <p className="text-[8px] opacity-40 text-right mt-2 font-black">{status.updatedAt} 更新</p>
                    </div>
                  ) : (
                    <div className={`mt-2 p-4 rounded-2xl border border-dashed text-center flex items-center justify-center min-h-[80px] ${active ? 'border-white/40' : 'border-slate-200'}`}>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">詳細状況未報告</p>
                    </div>
                  )}

                  {!active && (
                    <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Fix: Add interface and use React.FC for SummaryTag to correctly handle key and other props
interface SummaryTagProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
}

const SummaryTag: React.FC<SummaryTagProps> = ({ label, count, active, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-all ${
      active ? `${color} text-white shadow-lg scale-105` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
    }`}
  >
    <span className="text-xs font-black">{label}</span>
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${active ? 'bg-white/20' : 'bg-slate-200 text-slate-50'}`}>
      {count}
    </span>
  </button>
);

export default AttendanceManager;
