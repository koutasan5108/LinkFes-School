
import React, { useState } from 'react';
import { Event } from '../types';

interface QuickActionProps {
  events: Event[];
  currentUser: string;
  onEventJump: (eventId: string) => void;
  toast: { message: string; type: 'success' | 'error' } | null;
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ events, currentUser, onEventJump, toast, setToast }) => {
  const [inputNumber, setInputNumber] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleNumberInput = (num: string) => {
    if (inputNumber.length < 3) {
      setInputNumber(prev => prev + num);
    }
  };

  const handleClear = () => setInputNumber('');

  const handleExecute = () => {
    const formattedId = inputNumber.padStart(3, '0');
    const event = events.find(e => e.id === formattedId);

    if (!event) {
      setIsShaking(true);
      setToast({ message: `イベント番号 ${formattedId} は存在しません`, type: 'error' });
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    onEventJump(event.id);
    setToast({ message: `${event.title} へ移動しました`, type: 'success' });
    setInputNumber('');
  };

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-2xl border-4 border-indigo-600 mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        
        <div className="w-full lg:w-1/3">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-black text-slate-800">イベント・ジャンプ</h2>
          </div>
          <div className={`relative ${isShaking ? 'animate-bounce' : ''}`}>
            <div className={`bg-slate-900 h-24 rounded-3xl flex items-center justify-center border-4 ${isShaking ? 'border-rose-500' : 'border-slate-800'} shadow-inner`}>
              <span className="text-5xl font-black tracking-[0.5em] text-emerald-400 font-mono">
                {inputNumber.padEnd(3, '_')}
              </span>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em] text-center">
            3桁のイベントIDを入力
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full lg:w-1/3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button 
              key={n} 
              onClick={() => handleNumberInput(n.toString())}
              className="h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl text-2xl font-black text-slate-700 transition-all active:scale-95"
            >
              {n}
            </button>
          ))}
          <button onClick={handleClear} className="h-14 bg-rose-50 text-rose-500 rounded-2xl text-xl font-black">C</button>
          <button onClick={() => handleNumberInput('0')} className="h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl text-2xl font-black text-slate-700">0</button>
          <button disabled={inputNumber.length < 3} onClick={handleExecute} className="h-14 bg-indigo-600 text-white rounded-2xl text-xl font-black disabled:opacity-30">↵</button>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-1/3 justify-center">
          <p className="text-sm font-bold text-slate-500 bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
            企画や部署ごとに割り振られた3桁のIDを入力してください。管理画面へ即座にアクセスできます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickAction;
