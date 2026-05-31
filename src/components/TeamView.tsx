import React, { useState } from 'react';
import { Task, TeamMember } from '../types';
import { Search, Plus, Mail, ShieldAlert, BadgeInfo, CheckSquare, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeamViewProps {
  teamMembers: TeamMember[];
  tasks: Task[];
  onAddTeamMember: (member: Omit<TeamMember, 'id'>) => void;
}

export default function TeamView({
  teamMembers,
  tasks,
  onAddTeamMember,
}: TeamViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberAvatarType, setNewMemberAvatarType] = useState('man'); // man, woman, tech

  const filteredMembers = teamMembers.filter(m => {
    return m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim() || !newMemberEmail.trim()) return;

    // We generate a high-quality free Unsplash photo URL based on choices
    let avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200'; // Default male avatar
    if (newMemberAvatarType === 'woman') {
      const womanIds = ['1494790108377-be9c29b29330', '1544005313-94ddf0286df2', '1438761681033-6461ffad8d80', '1534528741775-53994a69daeb'];
      const randomId = womanIds[Math.floor(Math.random() * womanIds.length)];
      avatarUrl = `https://images.unsplash.com/photo-${randomId}?auto=format&fit=crop&q=80&w=200&h=200`;
    } else {
      const maleIds = ['1535713875002-d1d0cf377fde', '1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1472099645785-5658abf4ff4e'];
      const randomId = maleIds[Math.floor(Math.random() * maleIds.length)];
      avatarUrl = `https://images.unsplash.com/photo-${randomId}?auto=format&fit=crop&q=80&w=200&h=200`;
    }

    onAddTeamMember({
      name: newMemberName.trim(),
      role: newMemberRole.trim(),
      email: newMemberEmail.trim(),
      avatar: avatarUrl
    });

    // Reset Form
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberEmail('');
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-6" id="team-view-root">
      
      {/* Filtering and interactive header panel */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-3 items-center justify-between" id="team-filters-panel">
        <div className="flex items-center gap-2.5 relative w-full md:w-80" id="team-search-wrapper">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
          <input
            id="team-search-input"
            type="text"
            placeholder="Search team members by name or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-150 rounded-2xl text-sm font-sans placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          id="btn-team-trigger-add"
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white px-4.5 py-2.5 text-xs md:text-sm font-sans font-semibold rounded-2xl cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Slide-out or collapsible Add Member drawer */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            id="team-add-drawer"
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            className="bg-white p-6 rounded-3xl shadow-xs border border-neutral-150 overflow-hidden"
          >
            <h3 className="text-base font-sans font-bold text-neutral-800 mb-4 flex items-center gap-1.5">
              Onboard New Project Contributor
            </h3>

            <form onSubmit={handleCreateMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" id="form-team-onboarding">
              <div className="flex flex-col gap-1.5" id="onboard-name-group">
                <label htmlFor="member-name-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Full Name *</label>
                <input
                  id="member-name-input"
                  type="text"
                  required
                  placeholder="e.g. Liam Martinez"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5" id="onboard-role-group">
                <label htmlFor="member-role-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Project Role *</label>
                <input
                  id="member-role-input"
                  type="text"
                  required
                  placeholder="e.g. Lead Devops"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5" id="onboard-email-group">
                <label htmlFor="member-email-input" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Work Email *</label>
                <input
                  id="member-email-input"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-2" id="onboard-avatar-actions-grid">
                <div className="flex flex-col gap-1.5" id="onboard-avatar-group">
                  <label htmlFor="member-avatar-select" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Avatar Style</label>
                  <select
                    id="member-avatar-select"
                    value={newMemberAvatarType}
                    onChange={(e) => setNewMemberAvatarType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans focus:outline-hidden"
                  >
                    <option value="man">Man Portfolio</option>
                    <option value="woman">Woman Portfolio</option>
                  </select>
                </div>

                <button
                  id="btn-onboard-submit"
                  type="submit"
                  className="w-full h-10 bg-neutral-900 hover:bg-black text-white text-xs md:text-sm font-sans font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Onboard
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Team Profile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="team-cards-grid">
        {filteredMembers.map((member) => {
          // Compute this developer's workload counts dynamically
          const memberTasks = tasks.filter(t => t.assigneeId === member.id);
          const activeTasksCount = memberTasks.filter(t => t.status !== 'done').length;
          const completedTasksCount = memberTasks.filter(t => t.status === 'done').length;

          return (
            <div
              key={member.id}
              id={`team-card-${member.id}`}
              className="bg-white border border-neutral-100 hover:border-neutral-200/80 rounded-3xl p-5 shadow-sm hover:shadow-xs transition-all flex flex-col gap-5 relative group"
            >
              {/* Header profile info */}
              <div className="flex gap-4 items-center" id={`team-profile-row-${member.id}`}>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-neutral-100 shadow-2xs group-hover:scale-105 transition-transform duration-350"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-sans font-bold text-base text-neutral-800 leading-tight truncate">
                    {member.name}
                  </h4>
                  <span className="text-xs font-sans font-medium text-neutral-400 block mt-0.5">
                    {member.role}
                  </span>
                  
                  <div className="flex items-center gap-1.5 mt-1.5" id={`team-mail-row-${member.id}`}>
                    <Mail className="w-3.5 h-3.5 text-neutral-300" />
                    <span className="text-[11px] font-mono text-neutral-500 truncate block">
                      {member.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic workload benchmarks indicators */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-50/50 p-3 rounded-2xl border border-neutral-100/50 text-center" id={`team-stats-box-${member.id}`}>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-sans font-medium text-xs mb-1">
                    <ListTodo className="w-3.5 h-3.5 text-blue-500" />
                    <span>In-flight</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-neutral-700">{activeTasksCount}</span>
                </div>

                <div className="flex flex-col items-center border-l border-neutral-150">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-sans font-medium text-xs mb-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-neutral-700">{completedTasksCount}</span>
                </div>
              </div>

              {/* Workload advice alert badge based on in-flight count */}
              <div className="flex justify-between items-center text-[10px] md:text-xs text-neutral-500 font-sans" id={`team-status-footer-${member.id}`}>
                <span className="text-neutral-400">Availability:</span>
                {activeTasksCount > 25 ? (
                  <span className="flex items-center gap-1 font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3" />
                    Saturated
                  </span>
                ) : activeTasksCount > 15 ? (
                  <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <BadgeInfo className="w-3 h-3" />
                    Full Load
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-emerald-500 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <CheckSquare className="w-3 h-3" />
                    Available
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
