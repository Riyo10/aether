
import React, { useMemo } from 'react';
import { User, View, WorkflowNode, NodeType } from '../types';
import { ArrowRight, CreditCard, Shield, Key, HardDrive, Zap, Clock, User as UserIcon, Mail, Building, MapPin } from 'lucide-react';

interface ProfileProps {
  user: User;
  onNavigate: (view: View) => void;
  nodes: WorkflowNode[];
}

export const Profile: React.FC<ProfileProps> = ({ user, onNavigate, nodes }) => {
  
  // Calculate Dynamic Stats based on actual workflow usage
  const stats = useMemo(() => {
     const agentCount = nodes.filter(n => n.type === NodeType.AGENT).length;
     const triggerCount = nodes.filter(n => n.type === NodeType.TRIGGER || n.type === NodeType.WEBHOOK).length;
     const totalNodes = nodes.length;
     
     // Mock calculations for realism based on node count
     const computeHours = (agentCount * 12.5) + 4.2; 
     const vectorStorage = (agentCount * 0.8) + 1.2;
     const monthlyCost = agentCount > 5 ? 49 + ((agentCount - 5) * 5) : 0; // $5 per extra agent
     
     return { agentCount, triggerCount, totalNodes, computeHours, vectorStorage, monthlyCost };
  }, [nodes]);

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 flex justify-center">
       <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Breadcrumb */}
          <button 
            onClick={() => onNavigate('BUILDER')}
            className="text-xs font-mono text-gray-500 hover:text-white mb-8 flex items-center gap-2 uppercase tracking-widest transition-colors"
          >
             <ArrowRight className="w-3 h-3 rotate-180" /> Back to Console
          </button>

          {/* --- HEADER SECTION --- */}
          <div className="relative group rounded-3xl mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-cherry/10 to-transparent rounded-3xl blur-xl opacity-50 pointer-events-none"></div>
              <div className="glass-panel p-8 md:p-12 rounded-3xl relative z-10 overflow-hidden">
                   {/* Background Decor */}
                   <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-white/5 to-transparent blur-[100px] rounded-full pointer-events-none"></div>

                   <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                       <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-br from-cherry to-violet-600 rounded-full blur opacity-40"></div>
                            <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/10 bg-black object-cover shadow-2xl" 
                            />
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-black rounded-full" title="Online"></div>
                       </div>
                       
                       <div className="flex-1 text-center md:text-left">
                           <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                               <div>
                                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">{user.name}</h1>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-400 font-mono mb-4">
                                        <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {user.email}</span>
                                        <span className="hidden md:inline text-white/10">|</span>
                                        <span className="flex items-center gap-2"><Shield className="w-3 h-3 text-cherry" /> ID: {user.id}</span>
                                    </div>
                               </div>
                               <div className="flex gap-3">
                                   <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-all">Edit Profile</button>
                                   <button className="px-6 py-2 bg-cherry hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_-5px_rgba(217,4,41,0.4)]">Upgrade Plan</button>
                               </div>
                           </div>
                           
                           {/* Mini Stats in Header */}
                           <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                               <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wide text-gray-300">
                                  {stats.monthlyCost > 0 ? 'Pro Plan' : 'Free Plan'}
                               </span>
                               <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wide text-gray-300">India</span>
                               <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wide text-gray-300">Member since {user.joinedAt || 'Oct 23'}</span>
                           </div>
                       </div>
                   </div>
              </div>
          </div>

          {/* --- BENTO GRID STATS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-24 h-24 text-white rotate-12" />
                  </div>
                  <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Compute Usage</span>
                      </div>
                      <div className="text-3xl font-display font-bold text-white mb-1">{stats.computeHours.toFixed(1)}h</div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-4">
                          <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: `${Math.min((stats.computeHours/200)*100, 100)}%` }}></div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-500 font-mono">Based on {stats.agentCount} active agents</div>
                  </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <HardDrive className="w-24 h-24 text-white rotate-12" />
                  </div>
                  <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                          <HardDrive className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vector Storage</span>
                      </div>
                      <div className="text-3xl font-display font-bold text-white mb-1">{stats.vectorStorage.toFixed(1)} GB</div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-4">
                          <div className="bg-blue-400 h-full transition-all duration-1000" style={{ width: `${Math.min((stats.vectorStorage/10)*100, 100)}%` }}></div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-500 font-mono">State persistence for {stats.totalNodes} nodes</div>
                  </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <CreditCard className="w-24 h-24 text-white rotate-12" />
                  </div>
                  <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Billing</span>
                      </div>
                      <div className="text-3xl font-display font-bold text-white mb-1">${stats.monthlyCost.toFixed(2)}</div>
                      <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-mono bg-white/5 p-2 rounded w-fit">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Next Invoice: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* --- API KEYS --- */}
              <div className="lg:col-span-2 glass-panel p-8 rounded-2xl">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="font-display text-xl font-bold text-white">API Keys</h3>
                      <button className="text-xs font-bold uppercase tracking-widest text-cherry hover:text-white transition-colors">
                          + Generate New Key
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      {[
                          { name: "Production-01", prefix: "sk_live_...", created: "2d ago", lastUsed: "Just now" },
                          { name: "Dev-Local", prefix: "sk_test_...", created: "1mo ago", lastUsed: "5h ago" },
                      ].map((key, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center text-gray-400 group-hover:text-white">
                                      <Key className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-white">{key.name}</div>
                                      <div className="text-xs text-gray-500 font-mono">{key.prefix}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-xs text-gray-400">Last used: <span className="text-white">{key.lastUsed}</span></div>
                                  <div className="text-[10px] text-gray-600">Created {key.created}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* --- RECENT ACTIVITY (DYNAMIC) --- */}
              <div className="lg:col-span-1 glass-panel p-8 rounded-2xl">
                  <h3 className="font-display text-xl font-bold text-white mb-8">Audit Log</h3>
                  <div className="relative border-l border-white/10 pl-6 space-y-8">
                      {/* Dynamic Audit Log based on actual Nodes */}
                      {nodes.slice(0, 4).map((node, i) => (
                          <div key={node.id} className="relative animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms`}}>
                              <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-white/20 border-2 border-black"></div>
                              <div className="text-sm text-gray-300 font-medium">Configured "{node.data.label}"</div>
                              <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-gray-600" />
                                  <span className="text-[10px] text-gray-500 font-mono">Just now • {user.name}</span>
                              </div>
                          </div>
                      ))}
                      {nodes.length === 0 && (
                          <div className="text-xs text-gray-500 italic">No recent activity detected.</div>
                      )}
                  </div>
                  <button className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                      View Full History
                  </button>
              </div>
          </div>

       </div>
    </div>
  );
};
