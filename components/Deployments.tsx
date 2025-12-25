
import React, { useState } from 'react';
import { Globe, Clock, CheckCircle, Activity, MoreHorizontal, ArrowUpRight, Play, Archive, Edit, Zap } from 'lucide-react';
import { View, WorkflowNode, NodeType } from '../types';

interface DeploymentsProps {
  onNavigate: (view: View) => void;
  nodes: WorkflowNode[];
}

export const Deployments: React.FC<DeploymentsProps> = ({ onNavigate, nodes }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleClickOutside = () => {
    if (openMenuId) setOpenMenuId(null);
  };

  // Logic: The entire workflow is ONE deployment.
  const hasNodes = nodes.length > 0;
  
  // Determine Deployment Identity based on the workflow content
  // Priority: Trigger Node -> First Agent Node -> First Node
  const primaryNode = nodes.find(n => n.type === NodeType.TRIGGER || n.type === NodeType.WEBHOOK) || 
                      nodes.find(n => n.type === NodeType.AGENT) || 
                      nodes[0];
  
  // Name derivation: Use primary node label. If multiple nodes exist, append "Pipeline" or similar indicator logic if desired,
  // but strictly following user request: "name of the agent that will be display here, will be based on what agent user have created"
  const deploymentName = primaryNode ? primaryNode.data.label : "Untitled Workflow";
  const deploymentId = primaryNode ? primaryNode.id : "null";
  
  // Aggregate Status
  const isExecuting = nodes.some(n => n.data.isExecuting);
  const totalNodes = nodes.length;
  
  // Mock Stats calculation based on workflow complexity
  const mockLatency = 120 + (totalNodes * 50); // Base 120ms + 50ms per node
  const mockUptime = 99.9;
  const requestCount = 1240 * totalNodes;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-12 pt-28" onClick={handleClickOutside}>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">Deployments</h1>
          <p className="text-gray-400">Manage your active agent endpoints and webhooks.</p>
        </div>
        <button 
            onClick={() => onNavigate('BUILDER')}
            className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-fuchsia-100 transition-colors"
        >
          New Deployment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="p-6 glass-panel rounded-2xl">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Requests (24h)</div>
          <div className="text-3xl font-display text-white">{hasNodes ? requestCount.toLocaleString() : 0}</div>
          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
             <ArrowUpRight className="w-3 h-3" /> +12%
          </div>
        </div>
        <div className="p-6 glass-panel rounded-2xl">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Latency</div>
          <div className="text-3xl font-display text-white">{hasNodes ? `${mockLatency}ms` : '-'}</div>
           <div className="mt-2 text-xs text-gray-500">Global Avg</div>
        </div>
        <div className="p-6 glass-panel rounded-2xl">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Error Rate</div>
          <div className="text-3xl font-display text-white">{hasNodes ? '0.02%' : '-'}</div>
           <div className="mt-2 text-xs text-green-400">Optimal</div>
        </div>
        <div className="p-6 glass-panel rounded-2xl">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Pipeline</div>
          <div className="text-3xl font-display text-white">{hasNodes ? 1 : 0}</div>
          <div className="mt-2 text-xs text-gray-500">{totalNodes} nodes linked</div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-visible">
        <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/[0.02]">
          <div className="col-span-4">Workflow Name</div>
          <div className="col-span-3">Endpoint</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Latency</div>
          <div className="col-span-1">Uptime</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {!hasNodes ? (
            <div className="p-12 text-center text-gray-500">
                No active workflow found. Go to the Builder to create one.
            </div>
        ) : (
            // Render SINGLE ROW for the entire workflow
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 items-center hover:bg-white/[0.04] transition-colors group relative">
                <div 
                    className="col-span-4 flex items-center gap-3 cursor-pointer"
                    onClick={() => onNavigate('BUILDER')}
                >
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white border border-white/10 group-hover:border-fuchsia-500/50 transition-colors">
                    {primaryNode?.type === NodeType.TRIGGER ? <Zap className="w-4 h-4 text-purple-400" /> : <Globe className="w-4 h-4 text-blue-400" />}
                </div>
                <div>
                    <div className="text-sm font-bold text-white group-hover:text-fuchsia-400 transition-colors flex items-center gap-2">
                        {deploymentName}
                        {totalNodes > 1 && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">Pipeline</span>}
                    </div>
                    <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        {deploymentId.substring(0,8)}... • {totalNodes} nodes
                    </div>
                </div>
                </div>
                <div className="col-span-3">
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400 font-mono truncate max-w-[180px] bg-black/30 px-2 py-1 rounded select-all">
                            api.aether.ai/v1/run/{deploymentId}
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                    ${isExecuting ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}
                `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isExecuting ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                    {isExecuting ? 'Processing' : 'Healthy'}
                </div>
                </div>
                <div className="col-span-1 text-sm text-white font-mono">{mockLatency}ms</div>
                <div className="col-span-1 text-sm text-white font-mono">{mockUptime}%</div>
                <div className="col-span-1 text-right relative">
                <button 
                    className={`transition-colors p-2 rounded hover:bg-white/10 ${openMenuId === 'main-workflow' ? 'text-white' : 'text-gray-500'}`}
                    onClick={(e) => toggleMenu('main-workflow', e)}
                >
                    <MoreHorizontal className="w-5 h-5 ml-auto" />
                </button>

                {/* Action Dropdown */}
                {openMenuId === 'main-workflow' && (
                    <div className="absolute right-0 top-10 w-48 glass-panel rounded-xl shadow-2xl z-50 border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col py-1">
                            <button onClick={(e) => { e.stopPropagation(); onNavigate('BUILDER'); }} className="text-left px-4 py-3 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2">
                                <Edit className="w-3 h-3" /> Edit Workflow
                            </button>
                            <button className="text-left px-4 py-3 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2">
                                <Play className="w-3 h-3 text-green-400" /> Test Endpoint
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button className="text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                <Archive className="w-3 h-3" /> Archive
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
