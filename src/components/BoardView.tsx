import React, { useState } from 'react';
import { Task, TeamMember, TaskStatus, TaskPriority } from '../types';
import { Plus, Search, Filter, Trash2, Edit2, Check, ArrowRightLeft, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BoardViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string; colorClass: string; bgClass: string; borderClass: string; textClass: string }[] = [
  { id: 'to-do', label: 'To Do', colorClass: 'bg-blue-500', bgClass: 'bg-blue-50/50', borderClass: 'border-blue-100', textClass: 'text-blue-700' },
  { id: 'in-progress', label: 'In Progress', colorClass: 'bg-amber-500', bgClass: 'bg-amber-50/50', borderClass: 'border-amber-100', textClass: 'text-amber-700' },
  { id: 'done', label: 'Done', colorClass: 'bg-emerald-500', bgClass: 'bg-emerald-50/10', borderClass: 'border-emerald-100', textClass: 'text-emerald-700' },
  { id: 'blocked', label: 'Blocked', colorClass: 'bg-red-500', bgClass: 'bg-red-50/50', borderClass: 'border-red-100', textClass: 'text-red-700' }
];

export default function BoardView({
  tasks,
  teamMembers,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: BoardViewProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Forms and Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('to-do');
  const [taskAssignee, setTaskAssignee] = useState(teamMembers[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle click move panel
  const [activeMoveTask, setActiveMoveTask] = useState<string | null>(null);

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = selectedAssignee === 'all' || task.assigneeId === selectedAssignee;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesAssignee && matchesPriority;
  });

  const handleOpenAddModal = (status: TaskStatus = 'to-do') => {
    setTaskStatus(status);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('medium');
    setTaskAssignee(teamMembers[0]?.id || '');
    setTaskDueDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    
    onAddTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || 'No description provided.',
      status: taskStatus,
      priority: taskPriority,
      assigneeId: taskAssignee,
      dueDate: taskDueDate
    });
    
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description);
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskAssignee(task.assigneeId);
    setTaskDueDate(task.dueDate);
    setIsEditModalOpen(true);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !taskTitle.trim()) return;

    onUpdateTask({
      ...selectedTask,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      status: taskStatus,
      priority: taskPriority,
      assigneeId: taskAssignee,
      dueDate: taskDueDate
    });

    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const moveTask = (task: Task, newStatus: TaskStatus) => {
    onUpdateTask({ ...task, status: newStatus });
    setActiveMoveTask(null);
  };

  return (
    <div className="flex flex-col gap-6" id="board-view-root">
      
      {/* Search panel, priority Filter and assignee Filter */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-3 items-center justify-between" id="board-filters-panel">
        <div className="flex items-center gap-2.5 relative w-full md:w-80" id="search-box-wrapper">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
          <input
            id="board-search-input"
            type="text"
            placeholder="Search board tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-150 rounded-2xl text-sm font-sans placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end" id="filters-controls">
          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 border border-neutral-150 rounded-2xl px-3 py-2 flex-1 md:flex-none" id="assignee-select-box">
            <User className="w-3.5 h-3.5" />
            <select
              id="select-assignee-filter"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-transparent border-0 outline-hidden font-sans font-medium text-neutral-700 cursor-pointer text-xs md:text-sm"
            >
              <option value="all">Everyone</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 border border-neutral-150 rounded-2xl px-3 py-2 flex-1 md:flex-none" id="priority-select-box">
            <Filter className="w-3.5 h-3.5" />
            <select
              id="select-priority-filter"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent border-0 outline-hidden font-sans font-medium text-neutral-700 cursor-pointer text-xs md:text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <button
            id="btn-add-global-task"
            onClick={() => handleOpenAddModal('to-do')}
            className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-black text-white px-4 py-2 text-xs md:text-sm font-sans font-semibold rounded-2xl cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Grid structure of lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="board-columns-grid">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              id={`board-column-${col.id}`}
              className={`flex flex-col rounded-3xl border border-neutral-150 p-4 shrink-0 transition-colors ${col.bgClass}`}
            >
              {/* Header column */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100" id={`column-header-box-${col.id}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${col.colorClass}`} />
                  <h4 className="font-sans font-bold text-sm text-neutral-800">{col.label}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${col.textClass} bg-white border border-neutral-100 shadow-2xs`}>
                    {colTasks.length}
                  </span>
                  <button 
                    id={`btn-col-add-${col.id}`}
                    onClick={() => handleOpenAddModal(col.id)}
                    className="p-1 hover:bg-white rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tasks cards list */}
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px]" id={`column-tasks-scroller-${col.id}`}>
                {colTasks.length === 0 ? (
                  <div className="h-44 border-2 border-dashed border-neutral-200/50 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <span className="text-xs font-sans text-neutral-400 font-medium">No tasks here</span>
                    <button 
                      id={`btn-empty-add-task-${col.id}`}
                      onClick={() => handleOpenAddModal(col.id)}
                      className="text-xs text-blue-500 font-medium font-sans mt-2 hover:underline cursor-pointer"
                    >
                      Create one
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {colTasks.map((task) => {
                      const assignee = teamMembers.find(t => t.id === task.assigneeId);
                      
                      // Priority banner
                      let priorityBg = 'bg-slate-100 text-slate-700';
                      if (task.priority === 'high') priorityBg = 'bg-red-50 text-red-500 border border-red-100/50';
                      if (task.priority === 'medium') priorityBg = 'bg-amber-50 text-amber-500 border border-amber-100/50';
                      if (task.priority === 'low') priorityBg = 'bg-emerald-50 text-emerald-500 border border-emerald-100/50';

                      const isMoveActive = activeMoveTask === task.id;

                      return (
                        <motion.div
                          key={task.id}
                          id={`task-card-${task.id}`}
                          layoutId={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white p-4 rounded-2xl shadow-2xs border border-neutral-100 hover:shadow-xs transition-shadow flex flex-col gap-3 group relative"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className={`text-[10px] font-sans font-bold capitalize px-2 py-0.5 rounded-md ${priorityBg}`}>
                              {task.priority}
                            </span>
                            
                            {/* Actions controls */}
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1" id={`task-controls-${task.id}`}>
                              <button
                                id={`btn-edit-task-${task.id}`}
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1 text-neutral-400 hover:text-blue-500 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`btn-delete-task-${task.id}`}
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 text-neutral-400 hover:text-red-500 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-sans font-semibold text-sm text-neutral-800 leading-snug group-hover:text-neutral-950 transition-colors">
                              {task.title}
                            </h5>
                            <p className="text-xs font-sans text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-neutral-50 pt-3 mt-1" id={`card-footer-${task.id}`}>
                            {/* Assignee Avatar */}
                            {assignee ? (
                              <div className="flex items-center gap-1.5" title={assignee.name} id={`task-assignee-box-${task.id}`}>
                                <img
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  className="w-5.5 h-5.5 rounded-full object-cover border border-white"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="text-[10px] font-sans font-medium text-neutral-500 truncate max-w-[60px]">
                                  {assignee.name.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <div className="w-5.5 h-5.5 rounded-full bg-neutral-100 flex items-center justify-center text-[9px] text-neutral-400 font-bold border border-white">
                                ?
                              </div>
                            )}

                            {/* Due date and move selector */}
                            <div className="flex items-center gap-2" id={`card-interactive-controls-${task.id}`}>
                              <span className="text-[10px] font-mono font-medium text-neutral-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-neutral-300" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>

                              {/* State Transition Trigger (Touch friendly popup) */}
                              <div className="relative">
                                <button
                                  id={`btn-trigger-move-${task.id}`}
                                  onClick={() => setActiveMoveTask(isMoveActive ? null : task.id)}
                                  className="p-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 rounded-lg border border-neutral-100 transition-colors cursor-pointer"
                                  title="Change Status"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>

                                <AnimatePresence>
                                  {isMoveActive && (
                                    <>
                                      {/* Click outdoor shield */}
                                      <div id={`shield-${task.id}`} className="fixed inset-0 z-10" onClick={() => setActiveMoveTask(null)} />
                                      <motion.div
                                        id={`move-menu-${task.id}`}
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        className="absolute right-0 bottom-full mb-1.5 z-20 w-40 bg-white border border-neutral-150 shadow-md rounded-xl p-1.5 flex flex-col"
                                      >
                                        <div className="text-[10px] font-sans font-bold text-neutral-400 px-2 py-1 select-none">Send to col:</div>
                                        {COLUMNS.map(colTarget => (
                                          <button
                                            id={`btn-shift-${task.id}-to-${colTarget.id}`}
                                            key={colTarget.id}
                                            onClick={() => moveTask(task, colTarget.id)}
                                            disabled={task.status === colTarget.id}
                                            className={`text-left text-xs font-sans px-2.5 py-1.5 rounded-lg font-medium w-full flex items-center justify-between cursor-pointer ${
                                              task.status === colTarget.id 
                                                ? 'bg-neutral-50 text-neutral-300 pointer-events-none' 
                                                : 'text-neutral-700 hover:bg-neutral-50'
                                            }`}
                                          >
                                            {colTarget.label}
                                            {task.status === colTarget.id && <Check className="w-3 h-3 text-neutral-300" />}
                                          </button>
                                        ))}
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Dialog Trigger: Add and edit modally */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="board-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-neutral-100 z-10 overflow-hidden relative p-6 flex flex-col gap-4"
              id="board-task-modal"
            >
              <h3 className="text-xl font-sans font-bold text-neutral-800">
                {isAddModalOpen ? 'Create New Board Task' : 'Edit Board Task'}
              </h3>

              <form onSubmit={isAddModalOpen ? handleCreateTask : handleSaveEditTask} className="space-y-4" id="modal-task-form">
                <div className="flex flex-col gap-1.5" id="form-title-group">
                  <label htmlFor="task-title-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Task Title *</label>
                  <input
                    id="task-title-input"
                    type="text"
                    required
                    placeholder="e.g. Implement user login flow"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5" id="form-desc-group">
                  <label htmlFor="task-desc-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Description</label>
                  <textarea
                    id="task-desc-input"
                    placeholder="Provide actionable summary items or sub-tasks..."
                    rows={3}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4" id="form-grid-1">
                  <div className="flex flex-col gap-1.5" id="form-status-group">
                    <label htmlFor="task-status-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Column Status</label>
                    <select
                      id="task-status-input"
                      value={taskStatus}
                      onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      {COLUMNS.map(col => (
                        <option key={col.id} value={col.id}>{col.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5" id="form-priority-group">
                    <label htmlFor="task-priority-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Priority Level</label>
                    <select
                      id="task-priority-input"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="low">🟡 Low</option>
                      <option value="medium">🟠 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4" id="form-grid-2">
                  <div className="flex flex-col gap-1.5" id="form-assignee-group">
                    <label htmlFor="task-assignee-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Assignee</label>
                    <select
                      id="task-assignee-input"
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5" id="form-date-group">
                    <label htmlFor="task-date-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Due Date</label>
                    <input
                      id="task-date-input"
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100" id="form-actions-bar">
                  <button
                    id="btn-modal-cancel"
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    className="px-5 py-2.5 text-neutral-500 hover:bg-neutral-50 border border-neutral-200 font-sans font-semibold rounded-2xl text-xs md:text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-modal-submit"
                    type="submit"
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white font-sans font-semibold rounded-2xl text-xs md:text-sm transition-colors cursor-pointer"
                  >
                    {isAddModalOpen ? 'Create Task' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
