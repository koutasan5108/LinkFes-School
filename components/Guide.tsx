
import React, { useState } from 'react';
import { GUIDE_DATA } from '../constants';

const Guide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuide = GUIDE_DATA.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">🚀 使い方ガイド</h2>
        <p className="text-slate-400 font-bold">アプリを使いこなして文化祭を成功させよう！</p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="使い方を検索..."
          className="w-full px-8 py-5 bg-white border-2 border-indigo-100 rounded-[32px] font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-xl shadow-indigo-100 transition-all text-lg"
        />
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
      </div>

      <div className="space-y-8">
        {filteredGuide.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[48px] border-4 border-dashed border-slate-50">
            <p className="text-slate-300 font-black text-xl">該当するガイドが見つかりませんでした</p>
          </div>
        ) : (
          filteredGuide.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-[48px] p-10 shadow-xl border border-slate-50 overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
              <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4">
                <span className="w-10 h-10 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center font-mono text-lg">
                  {idx + 1}
                </span>
                {item.title}
              </h3>
              <div className="space-y-6">
                {item.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-6 items-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black mt-1 flex-shrink-0">
                      {sIdx + 1}
                    </div>
                    <p className="text-slate-600 font-bold leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-amber-50 p-8 rounded-[40px] border-2 border-amber-100 flex items-center gap-6">
        <span className="text-4xl">💡</span>
        <div className="text-sm font-bold text-amber-700">
          <p className="text-lg mb-1">困ったときは？</p>
          <p className="opacity-80">このガイドでも解決しない場合は、FAQページを確認するか、実行委員のリーダーまで直接お問い合わせください。</p>
        </div>
      </div>
    </div>
  );
};

export default Guide;
