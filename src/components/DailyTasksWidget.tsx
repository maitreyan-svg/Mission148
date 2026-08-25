import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Atom, 
  FlaskConical, 
  Calculator, 
  Zap,
  ListTodo,
  RotateCw
} from 'lucide-react';
import { SubjectType, DailyTask } from '../types';
import { useMission } from '../context/MissionContext';

interface DailyTasksWidgetProps {
  dayNumber: number;
}

export const DailyTasksWidget: React.FC<DailyTasksWidgetProps> = ({ dayNumber }) => {
  const { tasks, addDailyTask, toggleDailyTask, deleteDailyTask } = useMission();
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'general' | 'backlog'>('physics');

  const dayTasks = tasks.filter(t => t.dayNumber === dayNumber);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addDailyTask(dayNumber, selectedSubject, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const getSubjectBadge = (subj: SubjectType | 'general' | 'backlog') => {
    switch (subj) {
      case 'physics':
        return { label: 'Physics', icon: Atom, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'chemistry':
        return { label: 'Chemistry', icon: FlaskConical, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'mathematics':
        return { label: 'Math', icon: Calculator, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 'backlog':
        return { label: 'Backlog', icon: RotateCw, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: 'General', icon: Zap, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    }
  };

  const completedCount = dayTasks.filter(t => t.completed).length;

  return (
    <div id="daily-tasks-widget" className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Daily Tasks & Checklist</h3>
            <p className="text-xs text-slate-400 font-mono">Day {dayNumber} Targets</p>
          </div>
        </div>
        <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/30 font-bold">
          {completedCount}/{dayTasks.length} Completed
        </span>
      </div>

      {/* Task Input Form */}
      <form onSubmit={handleAddTask} className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          {/* Subject Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as any)}
            className="px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="physics">⚛ Physics</option>
            <option value="chemistry">🧪 Chem</option>
            <option value="mathematics">📐 Math</option>
            <option value="backlog">🔄 Backlog</option>
            <option value="general">⚡ General</option>
          </select>

          {/* Task Title Input */}
          <input
            type="text"
            placeholder="e.g. Kinematics — Lecture 1, Chemical Bonding — PYQs..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {dayTasks.map((task) => {
          const badge = getSubjectBadge(task.subject);
          const Icon = badge.icon;
          return (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                task.completed
                  ? 'bg-slate-950/60 border-slate-800/60 text-slate-500'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleDailyTask(task.id)}
                  className="cursor-pointer text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-mono font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border flex items-center space-x-1 ${badge.color}`}>
                  <Icon className="w-3 h-3" />
                  <span>{badge.label}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => deleteDailyTask(task.id)}
                className="ml-2 p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {dayTasks.length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-800/80 rounded-2xl">
            <p className="text-xs text-slate-500 font-mono">No tasks scheduled for Day {dayNumber}.</p>
            <p className="text-[11px] text-slate-600 font-mono mt-0.5">Add key lectures or PYQ sets above to stay on track.</p>
          </div>
        )}
      </div>
    </div>
  );
};
