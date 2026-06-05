import React, { useState, useEffect } from 'react';
import { Task, TeamMember, ActivityLog, ProjectMeta, TaskStatus } from './types';
import { 
  seedTasks, 
  DEFAULT_TEAM_MEMBERS, 
  DEFAULT_ACTIVITY_LOGS 
} from './data';
import DashboardView from './components/DashboardView';
import BoardView from './components/BoardView';
import CalendarView from './components/CalendarView';
import TeamView from './components/TeamView';
import SettingsView from './components/SettingsView';
import AIAssistant from './components/AIAssistant';
import { 
  Home, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Users, 
  Settings, 
  Smartphone, 
  Laptop, 
  RotateCcw,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'ais_project_dashboard_state_v1';

export default function App() {
  // 1. Core States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [projectMeta, setProjectMeta] = useState<ProjectMeta>({
    name: 'Project Dashboard Overview',
    description: 'Metrics analytics tracking panel',
    managerId: 'sarah'
  });

  // Navigation and aesthetic preferences
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [phoneViewMode, setPhoneViewMode] = useState<boolean>(true); // default to iPhone mode to mirror screenshot
  const [activeAccent, setActiveAccent] = useState<string>('standard');

  // 2. Local Storage Sync / Seeding on Startup
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.tasks && parsed.tasks.length > 0) {
          setTasks(parsed.tasks);
          setTeamMembers(parsed.teamMembers || DEFAULT_TEAM_MEMBERS);
          setActivities(parsed.activities || DEFAULT_ACTIVITY_LOGS);
          setProjectMeta(parsed.projectMeta || {
            name: 'Project Dashboard Overview',
            description: 'Metrics analytics tracking panel',
            managerId: 'sarah'
          });
          if (parsed.activeAccent) setActiveAccent(parsed.activeAccent);
          if (parsed.phoneViewMode !== undefined) setPhoneViewMode(parsed.phoneViewMode);
          return;
        }
      }
    } catch (e) {
      console.warn('Unable to load localStorage state, seeding defaults.', e);
    }

    // Seed defaults
    setTasks(seedTasks());
    setTeamMembers(DEFAULT_TEAM_MEMBERS);
    setActivities(DEFAULT_ACTIVITY_LOGS);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (tasks.length === 0) return; // avoid saving half-baked state
    const state = {
      tasks,
      teamMembers,
      activities,
      projectMeta,
      activeAccent,
      phoneViewMode
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [tasks, teamMembers, activities, projectMeta, activeAccent, phoneViewMode]);

  // 3. Command handlings
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const fresh: Task = {
      ...newTaskData,
      id: `task-custom-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [fresh, ...prev]);

    // Record activity
    const assignee = teamMembers.find(m => m.id === fresh.assigneeId);
    const logText = `Task "${fresh.title}" created. Assigned to ${assignee ? assignee.name : 'Unassigned'}.`;
    handleAddActivityLog(logText, 'create', 'sarah');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    // Check if status has changed
    const original = tasks.find(t => t.id === updatedTask.id);
    const statusChanged = original && original.status !== updatedTask.status;

    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    if (statusChanged && original) {
      const activeUser = teamMembers.find(m => m.id === updatedTask.assigneeId) || teamMembers[0];
      const columnLabels: Record<TaskStatus, string> = {
        'to-do': 'To Do',
        'in-progress': 'In Progress',
        'done': 'Done',
        'blocked': 'Blocked'
      };
      
      const logText = `Task "${updatedTask.title}" moved to ${columnLabels[updatedTask.status]} by ${activeUser.name}`;
      handleAddActivityLog(logText, 'move', activeUser.id);
      
      if (updatedTask.status === 'done') {
        const compText = `Task "${updatedTask.title}" completed by ${activeUser.name}`;
        handleAddActivityLog(compText, 'complete', activeUser.id);
      }
    } else {
      handleAddActivityLog(`Task "${updatedTask.title}" details modified.`, 'system', 'sarah');
    }
  };

  const handleDeleteTask = (targetId: string) => {
    const original = tasks.find(t => t.id === targetId);
    setTasks(prev => prev.filter(t => t.id !== targetId));
    if (original) {
      handleAddActivityLog(`Task "${original.title}" was removed from the sprint.`, 'system', 'sarah');
    }
  };

  const handleAddTeamMember = (freshMember: Omit<TeamMember, 'id'>) => {
    const fresh: TeamMember = {
      ...freshMember,
      id: `member-${Date.now()}`
    };
    setTeamMembers(prev => [...prev, fresh]);
    handleAddActivityLog(`New team member "${fresh.name}" onboarded as ${fresh.role}.`, 'create', 'sarah');
  };

  const handleUpdateProjectMeta = (meta: ProjectMeta) => {
    setProjectMeta(meta);
    handleAddActivityLog(`Project parameters updated: "${meta.name}"`, 'system', 'sarah');
  };

  const handleUpdateOwner = (owner: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === owner.id ? owner : m));
    handleAddActivityLog(`Project Lead profile synchronized.`, 'system', owner.id);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTasks(seedTasks());
    setTeamMembers(DEFAULT_TEAM_MEMBERS);
    setActivities(DEFAULT_ACTIVITY_LOGS);
    setProjectMeta({
      name: 'Project Dashboard Overview',
      description: 'Metrics analytics tracking panel',
      managerId: 'sarah'
    });
    setActiveAccent('standard');
    setActiveTab('dashboard');
  };

  const handleAddActivityLog = (text: string, type: 'comment' | 'create' | 'move' | 'complete' | 'system', userId?: string) => {
    const fresh: ActivityLog = {
      id: `act-log-${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      type,
      userId
    };
    setActivities(prev => [fresh, ...prev]);
  };

  // Seek Sarah (Leader details for top profile)
  const manager = teamMembers.find(m => m.id === 'sarah') || DEFAULT_TEAM_MEMBERS[0];

  // Accent mapping color helper classes for layout borders/headings
  const ACCENT_TEXT_CLASSES: Record<string, string> = {
    standard: 'text-indigo-650',
    emerald: 'text-emerald-600',
    ocean: 'text-blue-650',
    charcoal: 'text-neutral-800'
  };

  const ACCENT_BORDER_CLASSES: Record<string, string> = {
    standard: 'border-indigo-500/20',
    emerald: 'border-emerald-500/20',
    ocean: 'border-blue-500/20',
    charcoal: 'border-neutral-500/20'
  };

  const activeAccentText = ACCENT_TEXT_CLASSES[activeAccent] || 'text-indigo-600';
  const activeAccentBorder = ACCENT_BORDER_CLASSES[activeAccent] || 'border-indigo-500/20';

  // Inside layout component renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            tasks={tasks}
            teamMembers={teamMembers}
            activities={activities}
            onNavigateToTab={setActiveTab}
            onAddActivity={(text, type) => handleAddActivityLog(text, type, 'sarah')}
          />
        );
      case 'board':
        return (
          <BoardView
            tasks={tasks}
            teamMembers={teamMembers}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={tasks}
            teamMembers={teamMembers}
            onAddTask={handleAddTask}
          />
        );
      case 'team':
        return (
          <TeamView
            teamMembers={teamMembers}
            tasks={tasks}
            onAddTeamMember={handleAddTeamMember}
          />
        );
      case 'settings':
        return (
          <SettingsView
            projectMeta={projectMeta}
            teamMembers={teamMembers}
            onUpdateProjectMeta={handleUpdateProjectMeta}
            onUpdateOwner={handleUpdateOwner}
            onResetData={handleResetData}
            activeAccent={activeAccent}
            onSelectAccent={setActiveAccent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text font-sans" id="app-viewport">
      
      {/* Top Application Ribbon Control panel (Web environment only) */}
      <header className="bg-brand-card border-b border-brand-muted/20 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-40 shadow-sm" id="app-web-header">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-brand-bg border border-brand-muted/25 rounded-xl text-brand-accent">
            <LayoutGrid className="w-5 h-5" />
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm font-sans font-bold text-brand-heading leading-tight tracking-wide">Sprint Analytics Engine</h1>
            <span className="text-[10px] font-mono font-medium text-brand-muted">STATUS: INTERACTIVE CLIENT PERSISTENCE</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5" id="global-action-controls">
          {/* Mode Switcher */}
          <div className="bg-brand-bg border border-brand-muted/20 rounded-xl p-1 flex">
               <button
                 id="btn-layout-phone"
                 onClick={() => setPhoneViewMode(true)}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-120 cursor-pointer ${
                   phoneViewMode 
                     ? 'bg-brand-muted text-brand-bg shadow-xs' 
                     : 'text-brand-text hover:text-brand-accent'
                 }`}
                 title="Toggle iPhone Simulator"
               >
              <Smartphone className="w-3.5 h-3.5" />
              Simulator
            </button>
               <button
                 id="btn-layout-desktop"
                 onClick={() => setPhoneViewMode(false)}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-120 cursor-pointer ${
                   !phoneViewMode 
                     ? 'bg-brand-muted text-brand-bg shadow-xs' 
                     : 'text-brand-text hover:text-brand-accent'
                 }`}
              title="Toggle Fluid Wide Canvas Layout"
            >
              <Laptop className="w-3.5 h-3.5" />
              Fluid Wide
            </button>
          </div>

          {/* Quick Reseed */}
          <button
            id="btn-header-reseed"
            onClick={handleResetData}
            className="p-2 border border-brand-muted/25 bg-brand-card hover:bg-brand-bg rounded-xl text-brand-muted hover:text-brand-accent transition-colors cursor-pointer capitalize"
            title="Reseed screenshots parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>
      {/* Main Canvas rendering either Desktop layout or Phone Simulator frame */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:p-12 flex justify-center items-start" id="app-canvas">
        <AnimatePresence mode="wait">
          {phoneViewMode ? (
            
            /* iPhone Simulator View Mode - Styled EXACTLY like screenshot */
            <motion.div
              key="phone-viewport"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              id="ios-phone-simulator-frame"
              className="relative w-full max-w-[425px] h-[880px] bg-brand-bg rounded-[48px] shadow-2xl border-[11px] border-neutral-950 overflow-hidden flex flex-col shrink-0 select-none pb-4"
              style={{
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), inset 0 0 4px 2px rgba(255,255,255,0.05)'
              }}
            >
              {/* iOS Physical Notch & StatusBar */}
              <div id="simulated-ios-status-bar" className="h-10 pt-3.5 px-7 flex items-center justify-between shrink-0 bg-brand-bg text-brand-heading text-xs font-semibold z-30 select-none relative">
                <span className="text-xs font-sans text-brand-heading">9:41</span>
                
                {/* Physical Camera Pill element */}
                <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-[20px] bg-black rounded-full flex items-center justify-end pr-5 z-40">
                  {/* Camera lens circle */}
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mr-2 border border-neutral-800" />
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-brand-heading">
                  <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
                  <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                  <Battery className="w-4 h-4 fill-brand-accent stroke-[1.5]" />
                </div>
              </div>

              {/* simulated Content Canvas box */}
              <div id="simulated-screen-scroller" className="flex-1 overflow-y-auto bg-brand-bg px-5 py-6 flex flex-col gap-6 scrollbar-none pb-12">
                
                {/* Header Row matching the exact screenshot visual layout */}
                <div id="simulated-header-row" className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black tracking-tight text-brand-heading font-sans leading-tight max-w-[280px]">
                      {projectMeta.name}
                    </h2>
                  </div>
                  {manager && (
                    <img
                      src={manager.avatar}
                      alt={manager.name}
                      onClick={() => setActiveTab('settings')}
                      className="w-11 h-11 rounded-full object-cover border-2 border-brand-accent shadow-xs hover:scale-105 transition-transform duration-250 hover:cursor-pointer mr-0.5"
                      referrerPolicy="no-referrer"
                      title="Edit Profile"
                    />
                  )}
                </div>

                {/* Sub-view Content renderer */}
                <div className="flex-1 text-brand-text font-sans" id="simulated-view-viewport">
                  {renderTabContent()}
                </div>

              </div>

              {/* iOS bottom navigational navigation deck */}
              <nav id="simulated-ios-navbar" className="bg-brand-card/95 backdrop-blur-md border-t border-brand-muted/15 py-2.5 px-4.5 flex justify-between items-center z-30 shrink-0 select-none relative rounded-b-[38px] pb-5">
                
                {/* Dashboard Nav Trigger */}
                <button
                  id="tab-btn-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors ${
                    activeTab === 'dashboard' ? 'text-brand-accent font-bold' : 'text-brand-text/50 hover:text-brand-text'
                  }`}
                >
                  <Home className="w-[19px] h-[19px]" />
                  <span className="text-[10px] font-sans font-medium mt-1">Dashboard</span>
                </button>

                {/* Board Nav Trigger */}
                <button
                  id="tab-btn-board"
                  onClick={() => setActiveTab('board')}
                  className={`flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors ${
                    activeTab === 'board' ? 'text-brand-accent font-bold' : 'text-brand-text/50 hover:text-brand-text'
                  }`}
                >
                  <LayoutGrid className="w-[19px] h-[19px]" />
                  <span className="text-[10px] font-sans font-medium mt-1">Board</span>
                </button>

                {/* Calendar Nav Trigger */}
                <button
                  id="tab-btn-calendar"
                  onClick={() => setActiveTab('calendar')}
                  className={`flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors ${
                    activeTab === 'calendar' ? 'text-brand-accent font-bold' : 'text-brand-text/50 hover:text-brand-text'
                  }`}
                >
                  <CalendarIcon className="w-[19px] h-[19px]" />
                  <span className="text-[10px] font-sans font-medium mt-1">Calendar</span>
                </button>

                {/* Team Nav Trigger */}
                <button
                  id="tab-btn-team"
                  onClick={() => setActiveTab('team')}
                  className={`flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors ${
                    activeTab === 'team' ? 'text-brand-accent font-bold' : 'text-brand-text/50 hover:text-brand-text'
                  }`}
                >
                  <Users className="w-[19px] h-[19px]" />
                  <span className="text-[10px] font-sans font-medium mt-1">Team</span>
                </button>

                {/* Settings Nav Trigger */}
                <button
                  id="tab-btn-settings"
                  onClick={() => setActiveTab('settings')}
                  className={`flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors ${
                    activeTab === 'settings' ? 'text-brand-accent font-bold' : 'text-brand-text/50 hover:text-brand-text'
                  }`}
                >
                  <Settings className="w-[19px] h-[19px]" />
                  <span className="text-[10px] font-sans font-medium mt-1">Settings</span>
                </button>

                {/* Physical iOS home indicator accent spacer */}
                <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-32 h-[4px] bg-brand-muted/45 rounded-full" />
              </nav>

            </motion.div>

          ) : (

             /* Fluid Desktop Mode Workspace */
            <motion.div
              key="desktop-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              id="wide-desktop-canvas"
              className="w-full max-w-7xl mx-auto flex flex-col gap-8 bg-brand-bg p-6 md:p-8 rounded-[36px] shadow-2xl border border-brand-muted/15"
            >
              
              {/* Desktop Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-brand-muted/15" id="desktop-header-row">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-sans font-black tracking-tight text-brand-heading">{projectMeta.name}</h2>
                  <p className="text-xs md:text-sm font-sans font-normal text-brand-muted mt-1">{projectMeta.description}</p>
                </div>

                <div className="flex items-center gap-3.5 bg-brand-card px-4 py-2 rounded-2xl border border-brand-muted/15 shadow-sm" id="desktop-header-profile">
                  {manager && (
                    <>
                      <div className="text-right flex flex-col">
                        <span className="text-sm font-sans font-bold text-brand-heading leading-tight">{manager.name}</span>
                        <span className="text-[11px] font-sans font-semibold text-brand-muted mt-0.5">{manager.role}</span>
                      </div>
                      <img
                        src={manager.avatar}
                        alt={manager.name}
                        onClick={() => setActiveTab('settings')}
                        className="w-10 h-10 rounded-full object-cover border-2 border-brand-accent shadow-xs hover:scale-105 cursor-pointer"
                        referrerPolicy="no-referrer"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Double pane layout: Left side index Navigation bar, Right side active view */}
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-start" id="desktop-double-pane-container">
                
                {/* Lateral Left Navigation Bar with quick indices */}
                <div className="lg:col-span-1 flex flex-row lg:flex-col gap-1.5 p-1.2 bg-brand-card border border-brand-muted/15 rounded-2xl overflow-x-auto lg:overflow-visible shrink-0" id="desktop-sidebar-navbar">
                  
                  {/* Dashboard */}
                  <button
                    id="desktop-nav-dashboard"
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-bold transition-all cursor-pointer w-full text-left shrink-0 ${
                      activeTab === 'dashboard' 
                        ? 'bg-brand-muted text-brand-bg shadow-sm' 
                        : 'text-brand-text hover:bg-brand-muted/10 hover:text-brand-accent'
                    }`}
                  >
                    <Home className="w-4.5 h-4.5" />
                    <span>Dashboard</span>
                  </button>

                  {/* Board */}
                  <button
                    id="desktop-nav-board"
                    onClick={() => setActiveTab('board')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-bold transition-all cursor-pointer w-full text-left shrink-0 ${
                      activeTab === 'board' 
                        ? 'bg-brand-muted text-brand-bg shadow-sm' 
                        : 'text-brand-text hover:bg-brand-muted/10 hover:text-brand-accent'
                    }`}
                  >
                    <LayoutGrid className="w-4.5 h-4.5" />
                    <span>Board</span>
                  </button>

                  {/* Calendar */}
                  <button
                    id="desktop-nav-calendar"
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-bold transition-all cursor-pointer w-full text-left shrink-0 ${
                      activeTab === 'calendar' 
                        ? 'bg-brand-muted text-brand-bg shadow-sm' 
                        : 'text-brand-text hover:bg-brand-muted/10 hover:text-brand-accent'
                    }`}
                  >
                    <CalendarIcon className="w-4.5 h-4.5" />
                    <span>Calendar</span>
                  </button>

                  {/* Team */}
                  <button
                    id="desktop-nav-team"
                    onClick={() => setActiveTab('team')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-bold transition-all cursor-pointer w-full text-left shrink-0 ${
                      activeTab === 'team' 
                        ? 'bg-brand-muted text-brand-bg shadow-sm' 
                        : 'text-brand-text hover:bg-brand-muted/10 hover:text-brand-accent'
                    }`}
                  >
                    <Users className="w-4.5 h-4.5" />
                    <span>Team</span>
                  </button>

                  {/* Settings */}
                  <button
                    id="desktop-nav-settings"
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-bold transition-all cursor-pointer w-full text-left shrink-0 ${
                      activeTab === 'settings' 
                        ? 'bg-brand-muted text-brand-bg shadow-sm' 
                        : 'text-brand-text hover:bg-brand-muted/10 hover:text-brand-accent'
                    }`}
                  >
                    <Settings className="w-4.5 h-4.5" />
                    <span>Settings</span>
                  </button>

                </div>

                {/* Primary Content Panel */}
                <div className="lg:col-span-5" id="desktop-primary-view-frame">
                  {renderTabContent()}
                </div>

              </div>

            </motion.div>

          )}

        </AnimatePresence>
      </main>

      <AIAssistant
        tasks={tasks}
        teamMembers={teamMembers}
        projectMeta={projectMeta}
      />

    </div>
  );
}
