
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, TaskComment } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  members: string[];
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  currentUserName: string;
  readOnly?: boolean;
  canManage?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, members, updateTaskStatus, updateTask, deleteTask, addTask, selectedTask, setSelectedTask, currentUserName, readOnly = false, canManage = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'prio'>('id');
  const [commentInput, setCommentInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignees: [] as string[],
    priority: 'MEDIUM' as Priority,
    isHelpRequired: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    endTime: '18:00',
    progress: 0,
    comments: [] as TaskComment[]
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isExpired = (task: Task) => {
    if (task.status === TaskStatus.DONE) return false;
    const deadlineStr = `${task.endDate}T${task.endTime || '23:59'}:00`;
    const deadline = new Date(deadlineStr);
    return currentTime > deadline;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (readOnly) return;
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    if (readOnly) return;
    const taskId = e.dataTransfer.getData('taskId');
    updateTaskStatus(taskId, status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      ...newTask,
      status: TaskStatus.TODO
    });
    setIsModalOpen(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentInput.trim() || readOnly) return;

    const newComment: TaskComment = {
      id: crypto.randomUUID(),
      senderName: currentUserName,
      text: commentInput.trim(),
      timestamp: new Date().toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    };

    const updatedComments = [...(selectedTask.comments || []), newComment];
    updateTask(selectedTask.id, { comments: updatedComments });
    setCommentInput('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このタスクを完全に削除しますか？')) {
      deleteTask(id);
      setSelectedTask(null);
    }
  };

  const priorityColors: Record<Priority, string> = {
    HIGH: 'bg-rose-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-slate-400'
  };

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: '未着手', status: TaskStatus.TODO, color: 'bg-slate-300' },
    { title: '進行中', status: TaskStatus.IN_PROGRESS, color: 'bg-indigo-500' },
    { title: '完了', status: TaskStatus.DONE, color: 'bg-emerald-500' },
  ];

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'id') return a.id.localeCompare(b.id);
    const prioWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return prioWeight[b.priority] - prioWeight[a.priority];
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">並び替え:</span>
          <button onClick={() => setSortBy('id')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${sortBy === 'id' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>番号順</button>
          <button onClick={() => setSortBy('prio')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${sortBy === 'prio' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-slate-100 text-slate-400'}`}>優先度順</button>
        </div>
        {canManage && (
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-800 hover:bg-slate-900 text-white font-black py-3 px-8 rounded-2xl shadow-lg transition-all">+ 新規タスク</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col bg-slate-100/40 rounded-3xl p-4 min-h-[600px] border border-slate-200/50" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.status)}>
            <div className="flex items-center gap-3 mb-6 px-2 pt-2">
              <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
              <h3 className="font-black text-slate-700 text-lg">{col.title}</h3>
              <span className="ml-auto bg-white/80 text-slate-500 text-xs font-black px-3 py-1 rounded-full border border-slate-200 shadow-sm">{sortedTasks.filter(t => t.status === col.status).length}</span>
            </div>
            <div className="space-y-4">
              {sortedTasks.filter(t => t.status === col.status).map((task) => {
                const expired = isExpired(task);
                return (
                  <div key={task.id} draggable={!readOnly} onDragStart={(e) => handleDragStart(e, task.id)} onClick={() => setSelectedTask(task)} className={`bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-grab border group relative overflow-hidden ${expired ? 'border-rose-400 bg-rose-50/20' : 'border-slate-100'}`}>
                    <div className="absolute top-0 left-0 bg-slate-900 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-br-xl font-mono shadow-sm">#{task.id}</div>
                    {task.isHelpRequired && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl shadow-sm animate-pulse z-10">HELP!</div>}
                    {expired && <div className="absolute top-0 right-0 bg-rose-600 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl shadow-sm z-10">期限超過!</div>}
                    <div className="flex justify-between items-start mb-2 pr-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority]}`}></div>
                        <h4 className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${task.status === TaskStatus.DONE ? 'bg-emerald-400' : expired ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {task.assignees.slice(0, 3).map((a, idx) => (
                          <div key={idx} className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm">{a.charAt(0)}</div>
                        ))}
                      </div>
                      <div className={`text-[9px] font-bold px-2 py-1 rounded-lg ${expired ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>{task.endTime || '18:00'} 〆</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-start mb-6 sticky top-0 bg-white py-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedTask.title}</h2>
                <button onClick={() => setSelectedTask(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl">&times;</button>
             </div>
             <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl text-sm font-bold text-slate-600">{selectedTask.description}</div>
                {!readOnly && (
                  <>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">現在の進捗 ({selectedTask.progress}%)</label>
                      <input type="range" min="0" max="100" step="5" value={selectedTask.progress} onChange={(e) => updateTask(selectedTask.id, { progress: parseInt(e.target.value) })} className="w-full h-2 bg-indigo-100 rounded-lg accent-indigo-600" />
                    </div>
                    {canManage && (
                      <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={selectedTask.endDate} onChange={(e) => updateTask(selectedTask.id, { endDate: e.target.value })} className="w-full bg-slate-50 p-3 rounded-xl font-bold" />
                        <input type="time" value={selectedTask.endTime || '18:00'} onChange={(e) => updateTask(selectedTask.id, { endTime: e.target.value })} className="w-full bg-slate-50 p-3 rounded-xl font-bold" />
                      </div>
                    )}
                  </>
                )}
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">チーム内連絡</label>
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {(selectedTask.comments || []).map(comment => (
                      <div key={comment.id} className="bg-slate-50 p-3 rounded-2xl">
                        <div className="flex justify-between items-center mb-1 text-[9px] font-black text-indigo-600"><span>{comment.senderName}</span><span>{comment.timestamp}</span></div>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  {!readOnly && (
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input type="text" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="コメント..." className="flex-1 bg-slate-50 px-4 py-3 rounded-xl text-xs font-bold outline-none" />
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-xs font-black">送信</button>
                    </form>
                  )}
                </div>
                <div className="pt-6 flex gap-3">
                  {canManage && <button onClick={() => handleDelete(selectedTask.id)} className="flex-1 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl">🗑️ 削除</button>}
                  <button onClick={() => setSelectedTask(null)} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl">閉じる</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
