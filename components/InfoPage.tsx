
import React, { useEffect } from 'react';
import { View } from '../types';
import { Activity, Book, Code, Users, HelpCircle, Shield, Briefcase, FileText, GitBranch, Terminal, Globe, ArrowRight, Cpu, Database, Zap, Layers } from 'lucide-react';

interface InfoPageProps {
  view: View;
  onNavigate: (view: View) => void;
}

type PageContent = {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  content: React.ReactNode;
};

const PAGE_DATA: Partial<Record<View, PageContent>> = {
  // --- ARCHITECTURE ---
  ARCHITECTURE: {
    title: 'System Architecture',
    subtitle: 'The deterministic engine powering autonomous workflows.',
    icon: Cpu,
    content: (
       <div className="space-y-12">
          {/* Section 1: Core Engine */}
          <div>
             <h3 className="text-2xl font-display font-bold text-white mb-4">DAG Execution Engine</h3>
             <p className="text-gray-400 leading-relaxed mb-6">
               At the heart of Aether lies a proprietary Directed Acyclic Graph (DAG) engine written in Rust. 
               Unlike traditional linear scripts, Aether treats every agent as a node and every prompt as a function.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                   <div className="flex items-center gap-3 mb-3">
                      <GitBranch className="w-5 h-5 text-cherry" />
                      <h4 className="font-bold text-white">Topological Sort</h4>
                   </div>
                   <p className="text-xs text-gray-400">Dependency resolution ensures that context is passed downstream only when upstream nodes are statistically confident.</p>
                </div>
                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                   <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-5 h-5 text-cherry" />
                      <h4 className="font-bold text-white">Parallel Inference</h4>
                   </div>
                   <p className="text-xs text-gray-400">Independent branches execute concurrently on distributed workers, reducing total latency by up to 60%.</p>
                </div>
             </div>
          </div>

          {/* Section 2: Memory */}
          <div>
             <h3 className="text-2xl font-display font-bold text-white mb-4">Immutable State Ledger</h3>
             <p className="text-gray-400 leading-relaxed mb-6">
               State management is the hardest part of agentic AI. We solved it by making state immutable. 
               Every step in a workflow generates a cryptographically signed "block" of context, creating a verifiable audit trail.
             </p>
             <div className="p-6 bg-black/40 rounded-xl border border-white/10 font-mono text-xs text-gray-500">
                <div className="mb-2 text-purple-400"># Ledger Entry: Block 4921</div>
                <div>{`{`}</div>
                <div className="pl-4">"node_id": "agent_research_01",</div>
                <div className="pl-4">"timestamp": "2024-02-14T10:22:00Z",</div>
                <div className="pl-4">"input_hash": "a1b2c3d4...",</div>
                <div className="pl-4 text-green-400">"output_vector": [0.22, 0.91, -0.44...],</div>
                <div className="pl-4">"confidence": 0.98</div>
                <div>{`}`}</div>
             </div>
          </div>

          {/* Section 3: Edge */}
          <div>
             <h3 className="text-2xl font-display font-bold text-white mb-4">Edge Native Runtime</h3>
             <p className="text-gray-400 leading-relaxed">
               Aether is built to run on the edge. Our runtime is V8 isolate-compatible, meaning your agents deploy to Cloudflare Workers or Deno Deploy in milliseconds. 
               No Docker containers, no cold starts.
             </p>
          </div>
       </div>
    )
  },

  // --- PLATFORM ---
  PLATFORM_OBSERVABILITY: {
    title: 'Observability',
    subtitle: 'Full-stack tracing for autonomous agents.',
    icon: Activity,
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Aether Observability provides a microscopic view into your agent's decision-making process. Unlike traditional APM tools, we trace the semantic logic flow, not just the HTTP requests.</p>
        <ul className="list-disc pl-5 space-y-2">
           <li><strong className="text-white">Live Trace View:</strong> Watch agent thoughts appear in real-time.</li>
           <li><strong className="text-white">Token Cost Analysis:</strong> Breakdown of spend per step, per model.</li>
           <li><strong className="text-white">Latency Waterfalls:</strong> Identify bottlenecks in tool calls or LLM inference.</li>
        </ul>
      </div>
    )
  },
  PLATFORM_EVALUATIONS: {
    title: 'Evaluations',
    subtitle: 'Unit tests for non-deterministic intelligence.',
    icon: Shield,
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Ensure your agents perform reliably before deployment. Define golden datasets and run automated scoring matrices against your prompts.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
           <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-bold mb-2">Semantic Similarity</h4>
              <p className="text-xs">Compare vector distance between expected and actual outputs.</p>
           </div>
           <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-bold mb-2">Factuality Check</h4>
              <p className="text-xs">Cross-reference generated claims against a knowledge base.</p>
           </div>
        </div>
      </div>
    )
  },
  PLATFORM_PROMPT_CHAIN: {
    title: 'Prompt Chain',
    subtitle: 'Visual orchestration for complex reasoning.',
    icon: GitBranch,
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Building a single prompt is easy. Orchestrating a chain of 50 dependent prompts is hard. Our Prompt Chain engine handles context passing, state management, and error recovery automatically.</p>
        <p>The visual builder allows you to drag-and-drop prompts as nodes, connecting them with logic gates and loops.</p>
      </div>
    )
  },
  PLATFORM_CHANGELOG: {
    title: 'Changelog',
    subtitle: 'Latest updates to the Aether Engine.',
    icon: Terminal,
    content: (
      <div className="space-y-8 relative border-l border-white/10 pl-8">
         <div className="relative">
            <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-cherry border-4 border-black"></div>
            <h3 className="text-white font-bold text-lg">v3.4.0 - "Nebula"</h3>
            <span className="text-xs font-mono text-gray-500">October 24, 2023</span>
            <p className="mt-2 text-sm text-gray-400">Introduced vector memory persistence and multi-modal input support for Gemini 1.5 Pro.</p>
         </div>
         <div className="relative">
            <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-white/20 border-4 border-black"></div>
            <h3 className="text-white font-bold text-lg">v3.3.0</h3>
            <span className="text-xs font-mono text-gray-500">October 10, 2023</span>
            <p className="mt-2 text-sm text-gray-400">Added Enterprise SSO and Audit Logs. Improved latency for edge deployments.</p>
         </div>
      </div>
    )
  },

  // --- RESOURCES ---
  RESOURCES_DOCS: {
    title: 'Documentation',
    subtitle: 'The architect\'s manual.',
    icon: Book,
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Comprehensive guides for integrating Aether into your stack.</p>
        <div className="grid grid-cols-1 gap-4">
           <button className="text-left p-4 hover:bg-white/5 rounded border border-white/10 flex justify-between items-center group">
              <span>Quick Start Guide</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cherry" />
           </button>
           <button className="text-left p-4 hover:bg-white/5 rounded border border-white/10 flex justify-between items-center group">
              <span>SDK Reference (Python/Node)</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cherry" />
           </button>
           <button className="text-left p-4 hover:bg-white/5 rounded border border-white/10 flex justify-between items-center group">
              <span>Architecture Patterns</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cherry" />
           </button>
        </div>
      </div>
    )
  },
  RESOURCES_API: {
    title: 'API Reference',
    subtitle: ' programmatic control.',
    icon: Code,
    content: (
      <div className="space-y-6 text-gray-400">
        <div className="bg-black/50 p-4 rounded-lg border border-white/10 font-mono text-xs">
           <div className="text-gray-500 mb-2">// Example: Execute Agent</div>
           <div className="text-purple-400">POST <span className="text-white">/v1/agents/execute</span></div>
           <div className="text-white mt-2">
             {`{
  "agent_id": "ag_123abc",
  "input": "Analyze Q3 revenue",
  "stream": true
}`}
           </div>
        </div>
        <p>REST and GraphQL endpoints available for all platform features. Rate limits apply based on plan tier.</p>
      </div>
    )
  },
  RESOURCES_COMMUNITY: {
    title: 'Community',
    subtitle: 'Join the hive mind.',
    icon: Users,
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Connect with 10,000+ AI engineers building on Aether.</p>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-[#5865F2] text-white rounded-lg font-bold hover:brightness-110 transition-all">Join Discord</button>
           <button className="px-6 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-all">Github Discussions</button>
        </div>
      </div>
    )
  },
  RESOURCES_HELP: {
    title: 'Help Center',
    subtitle: 'Support and troubleshooting.',
    icon: HelpCircle,
    content: (
      <div className="space-y-6 text-gray-400">
        <input type="text" placeholder="Search for help..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cherry" />
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 bg-white/5 rounded hover:bg-white/10 cursor-pointer">Billing & Accounts</div>
           <div className="p-4 bg-white/5 rounded hover:bg-white/10 cursor-pointer">API Keys</div>
           <div className="p-4 bg-white/5 rounded hover:bg-white/10 cursor-pointer">Deployment Issues</div>
           <div className="p-4 bg-white/5 rounded hover:bg-white/10 cursor-pointer">Security</div>
        </div>
      </div>
    )
  },

  // --- COMPANY ---
  COMPANY_ABOUT: {
    title: 'About Us',
    subtitle: 'Building the substrate for AGI.',
    icon: Globe,
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Aether was founded in Zurich with a singular mission: to provide the deterministic infrastructure required for probabilistic intelligence.</p>
        <p>We believe that for AI to integrate into critical economic systems, it must be observable, controllable, and secure. We are a team of distributed systems engineers and ML researchers working to bridge this gap.</p>
      </div>
    )
  },
  COMPANY_ENTERPRISE: {
    title: 'Enterprise',
    subtitle: 'Scale with confidence.',
    icon: Briefcase,
    content: (
      <div className="space-y-6 text-gray-400">
        <p>For organizations requiring custom SLAs, VPC peering, and dedicated support.</p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
           <li>SOC2 Type II Compliance</li>
           <li>HIPAA & GDPR Ready</li>
           <li>Single-tenant deployments</li>
           <li>24/7 Dedicated Engineering Support</li>
        </ul>
        <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200">Contact Sales</button>
      </div>
    )
  },
  COMPANY_CAREERS: {
    title: 'Careers',
    subtitle: 'Do your life\'s work here.',
    icon: Users,
    content: (
      <div className="space-y-4 text-gray-400">
         <div className="p-4 border border-white/10 rounded-lg hover:border-white/30 transition-colors flex justify-between items-center cursor-pointer">
            <div>
               <h4 className="text-white font-bold">Senior Distributed Systems Engineer</h4>
               <span className="text-xs uppercase tracking-wider">Remote / Zurich</span>
            </div>
            <ArrowRight className="w-4 h-4" />
         </div>
         <div className="p-4 border border-white/10 rounded-lg hover:border-white/30 transition-colors flex justify-between items-center cursor-pointer">
            <div>
               <h4 className="text-white font-bold">Developer Advocate</h4>
               <span className="text-xs uppercase tracking-wider">New York / Remote</span>
            </div>
            <ArrowRight className="w-4 h-4" />
         </div>
         <div className="p-4 border border-white/10 rounded-lg hover:border-white/30 transition-colors flex justify-between items-center cursor-pointer">
            <div>
               <h4 className="text-white font-bold">Product Designer</h4>
               <span className="text-xs uppercase tracking-wider">London</span>
            </div>
            <ArrowRight className="w-4 h-4" />
         </div>
      </div>
    )
  },
  COMPANY_LEGAL: {
    title: 'Legal',
    subtitle: 'Terms and Privacy.',
    icon: FileText,
    content: (
      <div className="space-y-6 text-gray-400 text-sm">
        <p>Effective Date: October 1, 2023</p>
        <p>By using Aether, you agree to our Terms of Service. We process data in accordance with Swiss privacy laws.</p>
        <div className="flex flex-col gap-2">
           <a href="#" className="hover:text-cherry underline">Master Services Agreement</a>
           <a href="#" className="hover:text-cherry underline">Privacy Policy</a>
           <a href="#" className="hover:text-cherry underline">Data Processing Addendum (DPA)</a>
           <a href="#" className="hover:text-cherry underline">Acceptable Use Policy</a>
        </div>
      </div>
    )
  }
};

export const InfoPage: React.FC<InfoPageProps> = ({ view, onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const data = PAGE_DATA[view];

  if (!data) return <div className="pt-32 text-center text-gray-500">Page not found</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex justify-center">
       <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Breadcrumb / Back */}
          <button 
            onClick={() => onNavigate('LANDING')}
            className="text-xs font-mono text-gray-500 hover:text-white mb-8 flex items-center gap-2 uppercase tracking-widest transition-colors"
          >
             <ArrowRight className="w-3 h-3 rotate-180" /> Back to Home
          </button>

          {/* Header */}
          <div className="mb-12 border-b border-white/10 pb-12">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-6">
                <data.icon className="w-6 h-6 text-cherry" />
             </div>
             <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">{data.title}</h1>
             <p className="text-xl text-gray-400 font-serif italic">{data.subtitle}</p>
          </div>

          {/* Content */}
          <div className="glass-panel p-8 md:p-12 rounded-3xl">
             {data.content}
          </div>
       </div>
    </div>
  );
};
