
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';

interface ChatRoomProps {
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  eventTitle?: string;
  readOnly?: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, currentUser, onSendMessage, eventTitle, readOnly = false }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || readOnly) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 h-[calc(100vh-320px)] min-h-[500px] flex flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-100">💬</div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">{eventTitle || '連絡チャット'}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              {readOnly ? '閲覧専用モード' : 'オンライン・共有中'}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <span className="text-6xl mb-4 opacity-50">✨</span>
            <p className="font-black text-center">メッセージはありません。</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                {!isMe && <span className="text-[10px] font-black text-slate-500 mb-1 ml-1">{msg.senderName}</span>}
                <div className={`px-5 py-3 rounded-[24px] text-sm font-bold shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!readOnly && (
        <div className="p-6 border-t border-slate-50 bg-white">
          <form onSubmit={handleSend} className="flex gap-4">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="メッセージを入力..." className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl font-bold outline-none transition-all" />
            <button type="submit" disabled={!inputText.trim()} className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-[24px] flex items-center justify-center text-2xl shadow-xl transition-all">🚀</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
