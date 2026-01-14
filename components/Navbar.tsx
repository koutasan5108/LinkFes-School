
import React, { useState } from 'react';
import { User, ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onLogout: () => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  isCloudActive?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, currentUser, onLogout, selectedEventId, setSelectedEventId, isCloudActive = false }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => { setSelectedEventId(null); setActiveTab('dashboard'); }}
            className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 cursor-pointer"
          >
            L
          </div>
          <NavItem label="ホーム" isActive={activeTab === 'dashboard'} onClick={() => { setSelectedEventId(null); setActiveTab('dashboard'); }} />
          {currentUser.role === 'TEACHER' && (
            <NavItem label="統計" isActive={activeTab === 'teacher_stats'} onClick={() => { setSelectedEventId(null); setActiveTab('teacher_stats'); }} />
          )}
        </div>
        
        <div className="hidden md:flex gap-1">
          {selectedEventId ? (
            <>
              <div className="w-[1px] h-6 bg-slate-200 mx-2 self-center"></div>
              <NavItem label="タスク" isActive={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} />
              <NavItem label="工程管理" isActive={activeTab === 'gantt'} onClick={() => setActiveTab('gantt')} />
              <NavItem label="勤怠・稼働" isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
              <NavItem label="チャット" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          {/* Cloud Sync Status Indicator */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <div className={`w-2 h-2 rounded-full ${isCloudActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              {isCloudActive ? 'Link Sync' : 'Local Only'}
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-1.5 pr-4 rounded-full transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-black overflow-hidden relative">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="" /> : currentUser.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:block">
                {currentUser.name}
              </span>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2">
                <button 
                  onClick={() => { setActiveTab('profile'); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  👤 プロフィール・設定
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-sm font-bold text-rose-500 hover:bg-rose-50"
                >
                  🚪 ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
      isActive 
        ? 'bg-indigo-50 text-indigo-600' 
        : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

export default Navbar;
