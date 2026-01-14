
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'splash' | 'email' | 'teacher'>('splash');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    onLogin({
      id: `email-${email}`,
      name: name || email.split('@')[0],
      email: email,
      isGoogleUser: false,
      role: 'UNSET' // Students will choose role after first login
    });
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'teacher') {
      onLogin({
        id: `teacher-admin`,
        name: name || '先生',
        email: 'teacher@school.ed.jp',
        isGoogleUser: false,
        role: 'TEACHER'
      });
    } else {
      setError('パスワードが正しくありません');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleGoogleLogin = () => {
    onLogin({
      id: `google-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Google ユーザー',
      email: 'user@gmail.com',
      isGoogleUser: true,
      role: 'UNSET',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden text-center">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl relative z-10 animate-in zoom-in fade-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-4xl text-white font-black shadow-2xl shadow-indigo-500/40 mx-auto mb-6">
            L
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">LinkFes</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Real-time Festival Manager</p>
        </div>

        {view === 'splash' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setView('teacher')}
              className="w-full py-5 bg-indigo-50 border-2 border-indigo-100 hover:bg-indigo-100 rounded-[24px] flex items-center justify-center gap-3 transition-all group"
            >
              <span className="text-2xl">🎓</span>
              <div className="text-left">
                <span className="font-black text-indigo-700 block text-sm">先生としてログイン</span>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Admin Mode</span>
              </div>
            </button>

            <button 
              onClick={() => setView('email')}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1"
            >
              生徒としてログイン
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">または</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
            
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white border-2 border-slate-100 rounded-[20px] flex items-center justify-center gap-3 transition-all hover:bg-slate-50"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
              <span className="font-bold text-slate-600 text-sm">Googleログイン</span>
            </button>
            
            <button 
              onClick={() => onLogin({ id: 'guest', name: 'ゲスト', email: 'guest@example.com', isGoogleUser: false, role: 'GUEST' })}
              className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-500 transition-colors"
            >
              ゲストとして閲覧（読み取り専用）
            </button>
          </div>
        )}

        {view === 'teacher' && (
          <form onSubmit={handleTeacherLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
            <h2 className="text-xl font-black text-slate-800 mb-2">管理者認証</h2>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">パスワード</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-slate-700 outline-none"
              />
              {error && <p className="text-rose-500 text-[10px] font-black mt-2 ml-2">{error}</p>}
            </div>
            
            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 transition-all"
            >
              認証してログイン
            </button>
            
            <button 
              type="button"
              onClick={() => setView('splash')}
              className="w-full text-center text-slate-400 text-xs font-black uppercase tracking-widest py-2"
            >
              ← 戻る
            </button>
          </form>
        )}

        {view === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
            <h2 className="text-xl font-black text-slate-800 mb-2">生徒ログイン</h2>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">お名前</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="佐藤 太郎"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">メールアドレス</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="school@example.jp"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-slate-700 outline-none"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 transition-all"
            >
              LinkFesを開始する
            </button>
            
            <button 
              type="button"
              onClick={() => setView('splash')}
              className="w-full text-center text-slate-400 text-xs font-black uppercase tracking-widest py-2"
            >
              ← 戻る
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
