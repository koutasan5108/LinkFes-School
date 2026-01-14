
import React, { useState } from 'react';
import { FAQ_DATA } from '../constants';

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaq = FAQ_DATA.filter(item => 
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">🙋‍♀️ よくある質問</h2>
        <p className="text-slate-400 font-bold">疑問やトラブルを素早く解決しましょう</p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="キーワードで検索..."
          className="w-full px-8 py-5 bg-white border-2 border-indigo-100 rounded-[32px] font-bold text-slate-700 outline-none focus:border-indigo-500 shadow-xl shadow-indigo-100 transition-all text-lg"
        />
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredFaq.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[48px] border-4 border-dashed border-slate-50">
            <p className="text-slate-300 font-black text-xl">該当する質問が見つかりませんでした</p>
          </div>
        ) : (
          filteredFaq.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-[32px] border transition-all cursor-pointer overflow-hidden ${
                openId === item.id ? 'border-indigo-500 shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-md'
              }`}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black text-indigo-600 opacity-20">Q.</span>
                  <h4 className="text-lg font-black text-slate-800">{item.q}</h4>
                </div>
                <span className={`text-2xl text-slate-300 transition-transform duration-300 ${openId === item.id ? 'rotate-180 text-indigo-500' : ''}`}>
                  ↓
                </span>
              </div>
              
              {openId === item.id && (
                <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-4 duration-300">
                  <div className="pl-[3.5rem] flex items-start gap-4">
                    <span className="text-2xl font-black text-emerald-500 opacity-20">A.</span>
                    <p className="text-slate-600 font-bold leading-relaxed text-lg">
                      {item.a}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="bg-indigo-600 rounded-[48px] p-12 text-white text-center shadow-2xl shadow-indigo-200">
        <h3 className="text-2xl font-black mb-4">まだ解決しない場合は？</h3>
        <p className="text-indigo-100 font-bold mb-8">各企画のチャットルームや全体連絡から、管理者に直接メンションを送ってください。</p>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-3xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">
            お問い合わせ窓口
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
