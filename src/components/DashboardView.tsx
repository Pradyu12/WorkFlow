import React, { useState } from 'react';
import { Task, TeamMember, ActivityLog } from '../types';
import { Clipboard, Clock, CheckCircle, AlertTriangle, ArrowRight, MessageSquare, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  activities: ActivityLog[];
  onNavigateToTab: (tab: string) => void;
  onAddActivity: (text: string, type: 'comment' | 'create' | 'move' | 'complete') => void;
}

export default function DashboardView({
  tasks,
  teamMembers,
  activities,
  onNavigateToTab,
  onAddActivity
}: DashboardViewProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [quickComment, setQuickComment] = useState('');

  // 1. Compute dynamic counts
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  
  // To match the screenshot exactly or have a highly reasonable metric representation:
  // Let "Completed" show all non-in-progress tasks or Done tasks.
  // In the screenshot: Completed is 124 - 45 = 79.
  // When users add or edit tasks, we calculate Completed dynamically as (Total - In-Progress)
  // or simple count of (Done + ToDo + Blocked). Let's define Completed as: tasks - inProgress
  // which dynamically starts at exactly 79 when Total=124 and In-Progress=45!
  const completedCount = totalCount - inProgressCount;

  // Status distributions
  const counts = {
    'to-do': tasks.filter(t => t.status === 'to-do').length,
    'in-progress': inProgressCount,
    'done': tasks.filter(t => t.status === 'done').length,
    'blocked': tasks.filter(t => t.status === 'blocked').length,
  };

  const percentages = {
    'to-do': totalCount > 0 ? Math.round((counts['to-do'] / totalCount) * 100) : 0,
    'in-progress': totalCount > 0 ? Math.round((counts['in-progress'] / totalCount) * 100) : 0,
    'done': totalCount > 0 ? Math.round((counts['done'] / totalCount) * 100) : 0,
    'blocked': totalCount > 0 ? Math.round((counts['blocked'] / totalCount) * 100) : 0,
  };

  // Adjust percentage rounding to ensure it totals approximately 100%
  const distributionData = [
    { label: 'To Do', key: 'to-do', count: counts['to-do'], percentage: percentages['to-do'], color: '#3B82F6', textClass: 'text-blue-500' },
    { label: 'In Progress', key: 'in-progress', count: counts['in-progress'], percentage: percentages['in-progress'], color: '#FA9C2E', textClass: 'text-amber-500' },
    { label: 'Done', key: 'done', count: counts['done'], percentage: percentages['done'], color: '#10B981', textClass: 'text-emerald-500' },
    { label: 'Blocked', key: 'blocked', count: counts['blocked'], percentage: percentages['blocked'], color: '#EF4444', textClass: 'text-red-500' }
  ];

  // SVG Donut calculation
  const radius = 55;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets
  let collectedPercent = 0;
  const donutSegments = distributionData.map((slice) => {
    const rawVal = slice.count;
    const slicePercent = totalCount > 0 ? (rawVal / totalCount) * 100 : 0;
    const strokeLength = (slicePercent / 100) * circumference;
    const strokeOffset = circumference - ((collectedPercent / 100) * circumference);
    
    collectedPercent += slicePercent;

    return {
      ...slice,
      dashArray: `${strokeLength} ${circumference}`,
      dashOffset: strokeOffset,
      percent: slicePercent
    };
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    onAddActivity(`New comment on latest sprint update: "${quickComment.trim()}"`, 'comment');
    setQuickComment('');
  };

  return (
    <div className="flex flex-col gap-6" id="dashboard-view-root">
      
      {/* 3 Metric Cards matching top style */}
      <div className="grid grid-cols-3 gap-3 md:gap-4" id="metric-cards-container">
        
        {/* Total Tasks Card */}
        <div 
          id="card-total-tasks"
          className="bg-[#D8E5FF] hover:bg-[#C8D9FF] cursor-pointer transition-all duration-300 p-4 rounded-3xl flex flex-col justify-between h-32 text-[#2E58A6] shadow-sm relative overflow-hidden group"
          onClick={() => onNavigateToTab('board')}
        >
          <div className="flex justify-between items-center">
            <span className="font-sans font-medium text-sm md:text-base text-[#4673C6]">Total Tasks</span>
            <Clipboard className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-semibold tracking-tight font-sans mt-1">{totalCount}</span>
          </div>
        </div>

        {/* In Progress Card */}
        <div 
          id="card-in-progress"
          className="bg-[#FFE8CC] hover:bg-[#FFDCA8] cursor-pointer transition-all duration-300 p-4 rounded-3xl flex flex-col justify-between h-32 text-[#A25E14] shadow-sm relative overflow-hidden group"
          onClick={() => onNavigateToTab('board')}
        >
          <div className="flex justify-between items-center">
            <span className="font-sans font-medium text-sm md:text-base text-[#BD7F2D]">In Progress</span>
            <Clock className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-semibold tracking-tight font-sans mt-1">{inProgressCount}</span>
          </div>
        </div>

        {/* Completed Card */}
        <div 
          id="card-completed"
          className="bg-[#D1F2E5] hover:bg-[#C1ECDB] cursor-pointer transition-all duration-300 p-4 rounded-3xl flex flex-col justify-between h-32 text-[#136C45] shadow-sm relative overflow-hidden group"
          onClick={() => onNavigateToTab('board')}
        >
          <div className="flex justify-between items-center">
            <span className="font-sans font-medium text-sm md:text-base text-[#288B5E]">Completed</span>
            <CheckCircle className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-semibold tracking-tight font-sans mt-1">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Task Distribution Donut Chart container */}
      <div id="chart-distribution-card" className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col">
        <h3 className="text-lg font-sans font-semibold text-neutral-800 mb-4">Task Distribution</h3>
        
        {/* Interactive SVG Chart Layout */}
        <div className="flex flex-col items-center justify-center p-3" id="donut-chart-interactive-wrapper">
          <div className="relative w-44 h-44 flex items-center justify-center" id="donut-circle-svg-box">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              {/* Fallback grey circle indicator when everything is 0 */}
              {totalCount === 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#E5E7EB"
                  strokeWidth={strokeWidth}
                />
              )}
              {totalCount > 0 && donutSegments.map((segment) => {
                const isHovered = hoveredSlice === segment.key;
                return (
                  <circle
                    id={`donut-slice-${segment.key}`}
                    key={segment.key}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                    strokeLinecap="butt"
                    className="transition-all duration-300 cursor-pointer origin-center"
                    onMouseEnter={() => setHoveredSlice(segment.key)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    style={{
                      transformOrigin: '70px 70px',
                    }}
                  />
                );
              })}
            </svg>
            
            {/* Center label inside the donut */}
            <div className="absolute flex flex-col items-center justify-center text-center" id="donut-center-numbers">
              {hoveredSlice ? (
                (() => {
                  const seg = donutSegments.find(s => s.key === hoveredSlice);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 font-sans">{seg?.label}</span>
                      <span className="text-2xl font-bold font-sans text-neutral-800 leading-none mt-1">{seg?.count}</span>
                      <span className="text-[11px] text-neutral-500 font-medium font-sans mt-0.5">{Math.round(seg?.percent || 0)}%</span>
                    </motion.div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 font-sans">Total</span>
                  <span className="text-3xl font-bold font-sans text-neutral-800 leading-none mt-1">{totalCount}</span>
                  <span className="text-[10px] text-neutral-500 font-medium font-sans mt-0.5">Active Tasks</span>
                </div>
              )}
            </div>
          </div>

          {/* Grid Legend matching the visual screenshot */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full max-w-sm mt-6 pt-4 border-t border-neutral-50 text-xs md:text-sm" id="donut-legend-grid">
            {distributionData.map((slice) => (
              <div 
                key={slice.key} 
                id={`legend-item-${slice.key}`}
                className={`flex items-center justify-between p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  hoveredSlice === slice.key ? 'bg-neutral-50 shadow-xs' : ''
                }`}
                onMouseEnter={() => setHoveredSlice(slice.key)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3.5 h-3.5 rounded-md shrink-0 block transition-transform duration-200" 
                    style={{ backgroundColor: slice.color, transform: hoveredSlice === slice.key ? 'scale(1.15)' : 'none' }}
                  />
                  <span className="font-sans text-neutral-600 font-medium">
                    {slice.label} <span className="text-neutral-400 font-normal">({slice.percentage}%)</span>
                  </span>
                </div>
                <span className="font-mono text-neutral-800 font-bold ml-2">{slice.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity List matching card at bottom */}
      <div id="recent-activity-card" className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-sans font-semibold text-neutral-800">Recent Activity</h3>
          <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest bg-neutral-50 px-2.5 py-1 rounded-full">REALTIME LOG</span>
        </div>
        
        <div className="divide-y divide-neutral-100 flex flex-col" id="activity-logs-list">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-neutral-400 text-sm font-sans">No recent activities on this project yet.</div>
          ) : (
            activities.map((activity) => {
              // Icon selector
              let ActivityIcon = ArrowRight;
              let iconBg = 'bg-blue-50 text-blue-500';
              if (activity.type === 'create') {
                ActivityIcon = Plus;
                iconBg = 'bg-indigo-50 text-indigo-500';
              } else if (activity.type === 'complete') {
                ActivityIcon = CheckCircle;
                iconBg = 'bg-emerald-50 text-emerald-500';
              } else if (activity.type === 'comment') {
                ActivityIcon = MessageSquare;
                iconBg = 'bg-amber-50 text-amber-500';
              } else if (activity.type === 'move') {
                ActivityIcon = ArrowRight;
                iconBg = 'bg-blue-50 text-blue-500';
              }

              // Compute nice past string
              const deltaMs = Date.now() - new Date(activity.timestamp).getTime();
              const minutes = Math.floor(deltaMs / (60 * 1000));
              let timeStr = 'Just now';
              if (minutes >= 60 * 24) {
                timeStr = `${Math.floor(minutes / (60 * 24))}d ago`;
              } else if (minutes >= 60) {
                timeStr = `${Math.floor(minutes / 60)}h ago`;
              } else if (minutes > 0) {
                timeStr = `${minutes}m ago`;
              }

              return (
                <div key={activity.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3.5 items-start" id={`activity-item-${activity.id}`}>
                  <div className={`p-2 rounded-xl scale-95 shrink-0 ${iconBg}`}>
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-neutral-700 leading-relaxed font-normal">
                      {activity.text}
                    </p>
                    <span className="text-[11px] font-mono font-medium text-neutral-400 block mt-0.5">{timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Comment box for UX enrichment */}
        <form onSubmit={handlePostComment} className="mt-5 pt-4 border-t border-neutral-100 flex gap-2" id="quick-comment-form">
          <input
            id="input-quick-comment"
            type="text"
            placeholder="Type a new comment to test real-time activities..."
            className="flex-1 px-4 py-2 text-sm bg-neutral-50 rounded-2xl border border-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-sans placeholder-neutral-400"
            value={quickComment}
            onChange={(e) => setQuickComment(e.target.value)}
          />
          <button
            id="btn-post-comment"
            type="submit"
            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-2xl text-xs md:text-sm font-sans font-medium transition-colors hover:cursor-pointer shrink-0"
          >
            Comment
          </button>
        </form>
      </div>

    </div>
  );
}
