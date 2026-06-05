import React, { useState } from 'react';
import { Task, TeamMember, TaskStatus } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, User, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export default function CalendarView({
  tasks,
  teamMembers,
  onAddTask,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAssignee, setQuickAssignee] = useState(teamMembers[0]?.id || 'sarah');

  // Month Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Generate Calendar Days list
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const daysGrid: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // 1. Padding from previous month
  const sundayBufferedOffset = firstDayOfMonth; // e.g. if Wed (3), Sunday/Monday/Tuesday are empty: 0, 1, 2. Let's pad standard.
  for (let i = sundayBufferedOffset - 1; i >= 0; i--) {
    const pYear = month === 0 ? year - 1 : year;
    const pMonth = month === 0 ? 11 : month - 1;
    const pDay = prevMonthDays - i;
    const monthStr = String(pMonth + 1).padStart(2, '0');
    const dayStr = String(pDay).padStart(2, '0');
    daysGrid.push({
      dayNumber: pDay,
      dateStr: `${pYear}-${monthStr}-${dayStr}`,
      isCurrentMonth: false
    });
  }

  // 2. Days of active month
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    daysGrid.push({
      dayNumber: d,
      dateStr: `${year}-${monthStr}-${dayStr}`,
      isCurrentMonth: true
    });
  }

  // 3. Padding from next month to round out the 6-row grid (42 cells)
  const remainingCells = 42 - daysGrid.length;
  for (let n = 1; n <= remainingCells; n++) {
    const nYear = month === 11 ? year + 1 : year;
    const nMonth = month === 11 ? 0 : month + 1;
    const monthStr = String(nMonth + 1).padStart(2, '0');
    const dayStr = String(n).padStart(2, '0');
    daysGrid.push({
      dayNumber: n,
      dateStr: `${nYear}-${monthStr}-${dayStr}`,
      isCurrentMonth: false
    });
  }

  const selectedDateTasks = tasks.filter(t => t.dueDate === selectedDateStr);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddTask({
      title: quickTitle.trim(),
      description: 'Created quickly via Calendar view.',
      status: 'to-do',
      priority: 'medium',
      assigneeId: quickAssignee,
      dueDate: selectedDateStr
    });

    setQuickTitle('');
    setIsQuickAddOpen(false);
  };

  const getStatusColorCircle = (status: TaskStatus) => {
    switch (status) {
      case 'to-do': return 'bg-blue-500';
      case 'in-progress': return 'bg-amber-500';
      case 'done': return 'bg-emerald-500';
      case 'blocked': return 'bg-red-500';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="calendar-view-root">
      
      {/* Calendar Grid card */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col h-full" id="calendar-main-grid-card">
        
        {/* Calendar Nav header */}
        <div className="flex items-center justify-between mb-5" id="calendar-date-navigator-bar">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-5 h-5 text-neutral-400 mr-1.5" />
            <h3 className="text-lg font-sans font-bold text-neutral-800">
              {monthNames[month]} <span className="text-neutral-400 font-normal">{year}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2" id="calendar-controls-buttons-bar">
            <button
              id="btn-calendar-prev"
              onClick={handlePrevMonth}
              className="p-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-150 text-neutral-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-calendar-today"
              onClick={handleGoToday}
              className="px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-xs text-neutral-600 font-sans font-semibold rounded-xl border border-neutral-150 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              id="btn-calendar-next"
              onClick={handleNextMonth}
              className="p-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-150 text-neutral-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week titles */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest" id="weekday-headers-bar">
          {weekdayNames.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Monthly Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 flex-1 grow" id="monthly-days-grid-cells">
          {daysGrid.map((cell, idx) => {
            const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
            const isSelected = cell.dateStr === selectedDateStr;
            
            // Filter tasks occurring on this cellular date
            const cellTasks = tasks.filter(t => t.dueDate === cell.dateStr);

            return (
              <div
                id={`calendar-cell-${cell.dateStr}`}
                key={`${cell.dateStr}-${idx}`}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`relative aspect-square md:aspect-auto md:min-h-[80px] p-2 rounded-2xl flex flex-col justify-between cursor-pointer transition-all border ${
                  isSelected 
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm' 
                    : isToday
                      ? 'border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 text-neutral-800'
                      : cell.isCurrentMonth
                        ? 'border-neutral-100 bg-neutral-50/20 hover:bg-neutral-100/50 text-neutral-800'
                        : 'border-transparent bg-transparent text-neutral-300 hover:bg-neutral-50/10'
                }`}
              >
                {/* Numeric top right indicator */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs md:text-sm font-semibold tracking-tight font-sans ${isToday && !isSelected ? 'text-blue-500 font-bold' : ''}`}>
                    {cell.dayNumber}
                  </span>
                  {cellTasks.length > 0 && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 md:hidden" />
                  )}
                </div>

                {/* Desktop view tasks mini bullet bars */}
                <div className="hidden md:flex flex-col gap-1 mt-1 overflow-hidden" id={`desktop-cell-bullets-${cell.dateStr}`}>
                  {cellTasks.slice(0, 3).map((t) => {
                    let taskDotBg = getStatusColorCircle(t.status);
                    return (
                      <div 
                        key={t.id} 
                        className={`text-[9px] font-sans truncate px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          isSelected 
                            ? 'bg-neutral-850 text-neutral-300' 
                            : 'bg-white shadow-2xs border border-neutral-100 text-neutral-600'
                        }`}
                        title={t.title}
                      >
                        <span className={`w-1 h-1 rounded-full shrink-0 ${taskDotBg}`} />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
                  {cellTasks.length > 3 && (
                    <span className={`text-[8px] font-mono font-bold pl-1 ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      +{cellTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day list details Panel */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col justify-between" id="calendar-day-detail-panel">
        <div id="day-detail-top-wrapper">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">SCHEDULE FOR</span>
              <span className="text-base font-sans font-bold text-neutral-800 leading-tight">
                {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            <button
              id="btn-calendar-trigger-quickadd"
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="p-2 bg-neutral-900 hover:bg-black text-white rounded-xl transition-all cursor-pointer"
              title="Add task for this day"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick-add inline box */}
          <AnimatePresence>
            {isQuickAddOpen && (
              <motion.form
                id="form-quickadd-task"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleQuickAdd}
                className="bg-neutral-50 border border-neutral-150 p-4 rounded-2xl mb-5 space-y-3 overflow-hidden"
              >
                <h4 className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Quick Add Task</h4>
                <div className="flex flex-col gap-2">
                  <input
                    id="input-quick-add-title"
                    type="text"
                    required
                    placeholder="Task summary/title..."
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder-neutral-400"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      id="select-quick-add-assignee"
                      value={quickAssignee}
                      onChange={(e) => setQuickAssignee(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-sans focus:outline-hidden"
                    >
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
                      ))}
                    </select>

                    <button
                      id="btn-quick-add-submit"
                      type="submit"
                      className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-sans font-semibold py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Save Task
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Task list for selected date */}
          <div className="space-y-3 overflow-y-auto max-h-[400px]" id="selected-day-tasks-scroller">
            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-150 p-6 flex flex-col items-center">
                <Info className="w-6 h-6 text-neutral-300 mb-2.5" />
                <p className="text-sm font-sans text-neutral-400 font-medium">No tasks scheduled</p>
                <button
                  id="btn-inline-sched-add"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="text-xs text-blue-500 font-semibold font-sans mt-2 underline hover:text-blue-600 cursor-pointer"
                >
                  Schedule one now
                </button>
              </div>
            ) : (
              selectedDateTasks.map((t) => {
                const assigneeVal = teamMembers.find(m => m.id === t.assigneeId);
                const isCompleted = t.status === 'done';

                return (
                  <div 
                    key={t.id} 
                    id={`sched-item-${t.id}`}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-shadow ${
                      isCompleted 
                        ? 'bg-neutral-50/50 border-neutral-100' 
                        : 'bg-white border-neutral-100 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 w-2.5 h-2.5 rounded-full ${getStatusColorCircle(t.status)}`} />
                    <div className="flex-1 min-w-0">
                      <h5 className={`font-sans font-semibold text-xs md:text-sm text-neutral-800 leading-tight ${isCompleted ? 'line-through text-neutral-400' : ''}`}>
                        {t.title}
                      </h5>
                      <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-neutral-400 block mt-1.5">
                        STATUS: {t.status.replace('-', ' ')}
                      </span>
                      
                      {assigneeVal && (
                        <div className="flex items-center gap-1.5 mt-2" id={`sched-assignee-row-${t.id}`}>
                          <img
                            src={assigneeVal.avatar}
                            alt={assigneeVal.name}
                            className="w-4.5 h-4.5 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[10px] font-sans text-neutral-500 font-medium font-medium">
                            {assigneeVal.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Informative calendar legend box on lower side */}
        <div className="mt-6 pt-5 border-t border-neutral-100 text-xs text-neutral-400 font-sans leading-relaxed" id="calendar-view-legend">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-2 font-medium justify-center lg:justify-start">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> To Do
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Blocked
            </span>
          </div>
          Click any day inside the monthly view grid selector to view details or overlay newly generated task milestones.
        </div>
      </div>

    </div>
  );
}
