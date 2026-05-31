import React, { useState } from 'react';
import { TeamMember, ProjectMeta } from '../types';
import { ToggleLeft, RotateCcw, Save, ShieldAlert, BadgeCheck, FileText, Settings, User } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  projectMeta: ProjectMeta;
  teamMembers: TeamMember[];
  onUpdateProjectMeta: (meta: ProjectMeta) => void;
  onUpdateOwner: (owner: TeamMember) => void;
  onResetData: () => void;
  activeAccent: string;
  onSelectAccent: (accent: string) => void;
}

export default function SettingsView({
  projectMeta,
  teamMembers,
  onUpdateProjectMeta,
  onUpdateOwner,
  onResetData,
  activeAccent,
  onSelectAccent,
}: SettingsViewProps) {
  // Seek Sarah (default owner / project manager)
  const owner = teamMembers.find(m => m.id === 'sarah') || teamMembers[0];

  const [projectName, setProjectName] = useState(projectMeta.name);
  const [projectDesc, setProjectDesc] = useState(projectMeta.description);
  const [ownerName, setOwnerName] = useState(owner?.name || '');
  const [ownerEmail, setOwnerEmail] = useState(owner?.email || '');
  const [ownerRole, setOwnerRole] = useState(owner?.role || '');
  
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const ACCENTS = [
    { id: 'standard', label: 'Indigo Core', primaryColor: 'bg-indigo-650', border: 'border-indigo-200' },
    { id: 'emerald', label: 'Emerald Sage', primaryColor: 'bg-emerald-600', border: 'border-emerald-200' },
    { id: 'ocean', label: 'Ocean Tide', primaryColor: 'bg-blue-600', border: 'border-blue-200' },
    { id: 'charcoal', label: 'Sleek Dark', primaryColor: 'bg-neutral-800', border: 'border-neutral-200' }
  ];

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectMeta({
      ...projectMeta,
      name: projectName.trim(),
      description: projectDesc.trim(),
    });

    if (owner) {
      onUpdateOwner({
        ...owner,
        name: ownerName.trim(),
        email: ownerEmail.trim(),
        role: ownerRole.trim(),
      });
    }

    setSaveStatus('Success! Settings synchronized.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleFactoryReset = () => {
    if (window.confirm('This option will reset all tasks, logs, and members back to original screenshot fractions. Continue?')) {
      onResetData();
      setSaveStatus('Default data reseeded successfully.');
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-view-root">
      
      {/* Settings inputs panel */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col gap-6" id="settings-primary-card">
        <h3 className="text-lg font-sans font-bold text-neutral-800 flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Settings className="w-5 h-5 text-neutral-400" />
          General Project Configuration
        </h3>

        <form onSubmit={handleSaveConfigs} className="space-y-6" id="form-settings-options">
          {/* Metadata Section */}
          <div className="space-y-4" id="section-project-meta">
            <h4 className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Meta Identifiers
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5" id="group-settings-pname">
                <label htmlFor="settings-project-name" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Project Header Name</label>
                <input
                  id="settings-project-name"
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder-neutral-400"
                />
              </div>

              <div className="flex flex-col gap-1.5" id="group-settings-pdesc">
                <label htmlFor="settings-project-desc" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Dashboard Metric Description</label>
                <input
                  id="settings-project-desc"
                  type="text"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder-neutral-400"
                />
              </div>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Owner Project Manager Credentials */}
          <div className="space-y-4" id="section-owner-profile">
            <h4 className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Project Manager (Owner Profile)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5" id="group-settings-oname">
                <label htmlFor="settings-owner-name" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Leader Name</label>
                <input
                  id="settings-owner-name"
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col gap-1.5" id="group-settings-orole">
                <label htmlFor="settings-owner-role" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Corporate Role</label>
                <input
                  id="settings-owner-role"
                  type="text"
                  required
                  value={ownerRole}
                  onChange={(e) => setOwnerRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col gap-1.5" id="group-settings-oemail">
                <label htmlFor="settings-owner-email" className="text-xs font-sans font-bold text-neutral-500 uppercase tracking-wider">Public Mail</label>
                <input
                  id="settings-owner-email"
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Accent Color Palettes Selection */}
          <div className="space-y-4" id="section-theme-accent">
            <h4 className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider">Visual Interface Accents</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="accent-colors-grid">
              {ACCENTS.map((acc) => {
                const isActive = activeAccent === acc.id;
                return (
                  <button
                    key={acc.id}
                    id={`btn-accent-${acc.id}`}
                    type="button"
                    onClick={() => onSelectAccent(acc.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between items-start gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs' 
                        : 'border-neutral-150 bg-neutral-50/50 hover:bg-neutral-100/50 text-neutral-700'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full ${acc.primaryColor} shadow-3xs outline-2 outline-white`} />
                    <span className="text-xs font-sans font-bold">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Synchronization triggers bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5 border-t border-neutral-100" id="sync-bar">
            {saveStatus ? (
              <span className="text-xs font-sans font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100 animate-pulse">
                <BadgeCheck className="w-4 h-4" />
                {saveStatus}
              </span>
            ) : (
              <span className="text-xs text-neutral-400 font-sans tracking-wide">Sync parameters locally on this browser.</span>
            )}

            <button
              id="btn-settings-save"
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs md:text-sm font-sans font-bold transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Side tools panel (Factory controls & warning) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col justify-between" id="settings-secondary-card">
        <div id="settings-danger-top">
          <h3 className="text-sm font-sans font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 pb-3 border-b border-neutral-100 mb-5">
            <ShieldAlert className="w-4 h-4" />
            System Maintenance
          </h3>

          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs font-sans leading-relaxed text-red-600 mb-5" id="danger-advice-box">
            <h5 className="font-bold text-red-700 mb-1">Destructive Action</h5>
            To reset task counts, reset custom members, and clear the local storage back to matching screenshots coefficients (Total 124, 45 Progress, etc.), trigger the button below. This operation cannot be undone.
          </div>
        </div>

        <div id="settings-danger-bottom">
          <button
            id="btn-factory-reset"
            onClick={handleFactoryReset}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4.5 py-3 rounded-2xl text-xs md:text-sm font-sans font-bold transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Seed Default Fractions
          </button>
          
          <p className="text-[11px] font-sans text-neutral-400 text-center mt-3.5 leading-relaxed">
            Seeding loads 124 calculated cards matching standard performance KPIs.
          </p>
        </div>
      </div>

    </div>
  );
}
