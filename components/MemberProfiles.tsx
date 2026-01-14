
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface MemberProfilesProps {
  currentUser: User;
  onLogout: () => void;
  onUpdateProfile: (name: string, avatar: string) => void;
}

const MemberProfiles: React.FC<MemberProfilesProps> = ({ currentUser, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedAvatar, setEditedAvatar] = useState(currentUser.avatar || '');
  const [projectId, setProjectId] = useState(localStorage.getItem('cloud_project_id') || '');
  const [firebaseConfigStr, setFirebaseConfigStr] = useState(localStorage.getItem('firebase_config') || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!editedName.trim()) return;
    onUpdateProfile(editedName.trim(), editedAvatar.trim());
    setIsEditing(false);
  };

  const handleCloudSyncSetup = () => {
    if (!projectId.trim()) {
      alert("プロジェクト共有用の合言葉（ID）を入力してください");
      return;
    }
    
    // Check if it's valid JSON if config is provided
    if (firebaseConfigStr.trim()) {
      try {
        JSON.parse(firebaseConfigStr);
      } catch (e) {
        alert("Firebaseの設定（JSON）が正しくありません。コンソールからコピーした内容をそのまま貼り付けてください。");
        return;
      }
    }

    localStorage.setItem('cloud_project_id', projectId.trim());
    localStorage.setItem('firebase_config', firebaseConfigStr.trim());
    alert("クラウド同期設定を更新しました。アプリを再読み込みして接続を開始します。");
    window.location.reload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditedAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-[48px] p-10 md:p-12 shadow-xl border border-slate-100 text-center">
        <div className="relative group mx-auto mb-8 w-32 h-32">
          <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-5xl text-white font-black shadow-2xl shadow-indigo-100 overflow-hidden">
            {editedAvatar ? (
              <img src={editedAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              currentUser.name.charAt(0)
            )}
          </div>
          {isEditing && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-[40px] flex items-center justify-center hover:bg-black/60 transition-all"
            >
              <span className="text-white text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">変更</span>
            </button>
          )}
        </div>
        
        {!isEditing ? (
          <>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{currentUser.name}</h2>
            <p className="text-slate-400 font-bold mb-6">{currentUser.email}</p>
            <div className="flex justify-center gap-3 mb-8">
              <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                currentUser.role === 'TEACHER' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'
              }`}>
                {currentUser.role === 'TEACHER' ? '🎓 先生' : currentUser.role === 'GUEST' ? '👀 ゲスト' : '👤 生徒'}
              </span>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-indigo-600 font-black text-xs uppercase tracking-widest border-2 border-indigo-100 px-6 py-2 rounded-full hover:bg-indigo-50 mb-12">プロフィールを編集</button>
          </>
        ) : (
          <div className="space-y-6 mb-12 text-left">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">お名前</label>
              <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-indigo-100 rounded-3xl font-bold" />
            </div>
            <div className="flex gap-4">
              <button onClick={handleSave} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-3xl shadow-xl">保存</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-3xl">キャンセル</button>
            </div>
          </div>
        )}

        {/* Firebase Config Section */}
        <div className="bg-slate-900 rounded-[40px] p-8 md:p-10 text-left border border-slate-800 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <span className="text-8xl">☁️</span>
          </div>
          <h3 className="font-black text-white text-xl mb-6 flex items-center gap-3">
             <span className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-xs">Sync</span>
             クラウド連携設定
          </h3>
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">共有プロジェクトID（合言葉）</label>
              <input 
                type="text" 
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                placeholder="例: class-3a-2024"
                className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl font-mono font-bold text-emerald-400 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Firebase SDK設定 (JSON)</label>
              <textarea 
                value={firebaseConfigStr}
                onChange={e => setFirebaseConfigStr(e.target.value)}
                placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
                className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl font-mono text-[10px] text-slate-300 h-32 outline-none focus:border-indigo-500"
              />
              <p className="text-[9px] font-bold text-slate-500 mt-2">
                ※ Firebaseコンソールの「Webアプリ設定」からコピーした `firebaseConfig` の中身を {} ごと貼り付けてください。
              </p>
            </div>
            <button 
              onClick={handleCloudSyncSetup}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3"
            >
              🚀 クラウド同期を開始
            </button>
          </div>
        </div>

        <button onClick={onLogout} className="w-full py-5 bg-rose-500 text-white rounded-[24px] font-black text-lg shadow-xl shadow-rose-100">🚪 ログアウト</button>
      </div>
    </div>
  );
};

export default MemberProfiles;
