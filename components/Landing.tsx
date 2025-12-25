
import React, { useEffect, useRef } from 'react';
import { ArrowRight, Cpu, Database, Command, Zap, Terminal, Globe, Shield, Activity, GitBranch, ArrowDownLeft, Check, Star, Quote, ArrowUpRight } from 'lucide-react';
import { User, View } from '../types';

interface LandingProps {
  onStart: () => void;
  onNavigate: (view: View) => void;
  user?: User | null;
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, className = "", delay = "" }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger once
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return <div ref={ref} className={`reveal ${delay} ${className}`}>{children}</div>;
};

interface ScrollRevealWrapperProps {
  children: React.ReactNode;
}

// Scroll Reveal Wrapper Component
const ScrollRevealWrapper: React.FC<ScrollRevealWrapperProps> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const startOffset = viewportHeight * 0.9;
      const endOffset = 0;
      
      let progress = (startOffset - rect.top) / (startOffset - endOffset);
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      
      const ease = (t: number) => t * (2 - t); 
      const smoothedProgress = ease(progress);

      const scale = 0.92 + (0.08 * smoothedProgress);
      const borderRadius = 48 - (48 * smoothedProgress);
      const opacity = 0.8 + (0.2 * smoothedProgress);
      const y = 50 - (50 * smoothedProgress);

      wrapperRef.current.style.transform = `scale(${scale}) translateY(${y}px)`;
      wrapperRef.current.style.borderRadius = `${borderRadius}px`;
      wrapperRef.current.style.opacity = `${opacity}`;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={wrapperRef} 
      className="w-full bg-black mx-auto overflow-hidden shadow-2xl origin-center will-change-transform"
      style={{ 
        transform: 'scale(0.92)', 
        borderRadius: '48px',
        opacity: 0.8
      }}
    >
      {children}
    </div>
  );
};

// --- VISUAL EFFECT COMPONENTS ---

const SchematicBackground = () => (
  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes float-1 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.05; }
        25% { transform: translate(20px, -20px) rotate(5deg); opacity: 0.1; }
        50% { transform: translate(0, -40px) rotate(0deg); opacity: 0.05; }
        75% { transform: translate(-20px, -20px) rotate(-5deg); opacity: 0.1; }
        100% { transform: translate(0, 0) rotate(0deg); opacity: 0.05; }
      }
      @keyframes float-2 {
        0% { transform: translate(0, 0); opacity: 0.05; }
        50% { transform: translate(-30px, 30px); opacity: 0.1; }
        100% { transform: translate(0, 0); opacity: 0.05; }
      }
      @keyframes cursor-move {
        0% { transform: translate(0, 0); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translate(100px, 50px); opacity: 0; }
      }
    `}} />
    
    {/* Subtle Grid */}
    <div className="absolute inset-0 opacity-[0.03]" 
         style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
    />

    {/* Moving Arrow (Large, background) */}
    <div className="absolute top-1/4 right-10" style={{ animation: 'float-1 10s ease-in-out infinite' }}>
       <ArrowDownLeft className="w-24 h-24 text-white" strokeWidth={0.5} />
    </div>

    {/* Moving Cursor */}
    <div className="absolute top-1/3 left-10" style={{ animation: 'cursor-move 8s linear infinite' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-cherry/30">
             <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
        </svg>
    </div>
    
    {/* Another Arrow */}
    <div className="absolute bottom-1/4 left-1/4" style={{ animation: 'float-2 12s ease-in-out infinite' }}>
        <ArrowUpRight className="w-16 h-16 text-white" strokeWidth={0.5} />
    </div>

    {/* Group Hover Reveal - stronger effect */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </div>
);

export const Landing: React.FC<LandingProps> = ({ onStart, onNavigate, user }) => {
  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden bg-black">
      
      {/* --- HERO SECTION --- */}
      <section className="w-full min-h-[100vh] flex flex-col justify-center items-center relative px-6 z-0">
        <div className="absolute top-0 left-0 w-[40vw] h-full bg-gradient-to-r from-violet-900/20 via-violet-900/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} 
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mt-12">
          {/* Badge */}
          <Reveal>
            <div className="relative group cursor-default">
              <div className="absolute -inset-1 bg-gradient-to-r from-cherry to-violet-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative font-sans text-[10px] md:text-xs font-bold text-cream tracking-[0.3em] uppercase mb-8 border border-white/10 bg-black/50 px-6 py-2 rounded-full backdrop-blur-md shadow-2xl">
                System Architecture v3.4.0 <span className="text-cherry ml-2">●</span> LIVE
              </div>
            </div>
          </Reveal>
          
          {/* Headline */}
          <Reveal delay="delay-100">
            <h1 className="font-serif text-6xl md:text-9xl mb-8 leading-[0.95] italic text-gradient-luxury relative">
              The Engine <br />
              <span className="not-italic font-medium font-display tracking-tight text-white">of Intelligence</span>
              
              <div className="hidden md:block absolute -right-24 top-10 rotate-12 opacity-40">
                 <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="stroke-white/30">
                    <path d="M10 90 Q 50 10 90 50" strokeWidth="1" />
                    <circle cx="90" cy="50" r="3" fill="white"/>
                 </svg>
                 <span className="absolute top-0 right-0 text-[10px] font-mono text-white/50 bg-black px-1 rounded">DAG ENGINE</span>
              </div>
            </h1>
          </Reveal>

          <Reveal delay="delay-200">
            <p className="max-w-2xl text-lg md:text-xl text-cream/60 font-serif italic mb-12 leading-relaxed mix-blend-plus-lighter">
              Construct exquisite, deterministic workflows using our visual graph engine. 
              Designed for <span className="text-cream border-b border-white/20 pb-0.5">researchers</span>, <span className="text-cream border-b border-white/20 pb-0.5">engineers</span>, and <span className="text-cream border-b border-white/20 pb-0.5">sentient systems</span>.
            </p>
          </Reveal>

          <Reveal delay="delay-300">
            <div className="flex flex-col md:flex-row items-center gap-6 relative">
              <button 
                onClick={onStart}
                className="group relative px-10 py-5 bg-cream text-black rounded-full overflow-hidden transition-all hover:scale-105 duration-500 shadow-[0_0_50px_-10px_rgba(255,255,255,0.2)]"
              >
                <span className="relative z-10 font-display font-bold tracking-widest text-sm flex items-center gap-3">
                  {user ? "OPEN CONSOLE" : "DEPLOY CONSOLE"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={() => onNavigate('RESOURCES_DOCS')}
                className="px-10 py-5 glass-panel rounded-full text-white hover:bg-white/10 font-display font-bold tracking-widest text-sm transition-all flex items-center gap-2"
              >
                 <Terminal className="w-4 h-4 text-gray-400" /> READ DOCS
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- MIDDLE SECTION WRAPPER --- */}
      <ScrollRevealWrapper>
        <div className="w-full text-cream py-32 px-6 relative">
          
          <div className="absolute inset-0 pointer-events-none opacity-20"
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />
          
          <div className="max-w-screen-xl mx-auto relative z-10">
            
            {/* Header & Code Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
              <Reveal>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-12 h-px bg-cherry"></div>
                     <span className="text-cherry text-xs font-bold tracking-widest uppercase">Infrastructure as Code</span>
                  </div>
                  <h2 className="font-display text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-8 text-white">
                    MODULAR.<br/>
                    PRECISE.<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-800">SCALABLE.</span>
                  </h2>
                  <p className="font-sans text-lg font-medium text-gray-400 leading-relaxed max-w-md ml-1 mb-8">
                    Connect logic, data, and LLMs in a unified visual interface. 
                    The platform treats <span className="text-white">prompts as functions</span> and <span className="text-white">context as state</span>, ensuring deterministic execution.
                  </p>
                  
                  <div className="flex flex-col gap-4 border-l border-white/10 pl-6">
                     <div className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-cherry rounded-full" />
                        <div>
                           <h4 className="font-bold text-sm text-white">Zero-Latency Handoffs</h4>
                           <p className="text-xs text-gray-500 mt-1">Direct memory buffers between agent nodes.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
                        <div>
                           <h4 className="font-bold text-sm text-white">Type-Safe Outputs</h4>
                           <p className="text-xs text-gray-500 mt-1">Enforced JSON schemas for every generation.</p>
                        </div>
                     </div>
                  </div>
                </div>
              </Reveal>
              
              {/* Colorful Code Snippet Visualization */}
              <Reveal delay="delay-200">
                <div className="relative group rounded-3xl">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 z-0"></div>
                  
                  <div className="relative w-full glass-card rounded-3xl p-6 md:p-8 transform hover:scale-[1.01] transition-transform duration-500 z-10">
                     <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-[#FF5F56]"/>
                           <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"/>
                           <div className="w-3 h-3 rounded-full bg-[#27C93F]"/>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                           <GitBranch className="w-3 h-3" /> multi_agent_core.ts
                        </span>
                     </div>
                     <pre className="font-mono text-xs md:text-sm overflow-x-auto leading-loose whitespace-pre">
  <span className="text-fuchsia-400">import</span> <span className="text-yellow-200">{`{ Agent, Workflow }`}</span> <span className="text-fuchsia-400">from</span> <span className="text-green-400">'@aether/sdk'</span>;

  <span className="text-gray-500 italic">// Initialize the recursive researcher swarm</span>
  <span className="text-fuchsia-400">const</span> <span className="text-blue-300">researchNode</span> = <span className="text-fuchsia-400">new</span> <span className="text-yellow-200">Agent</span>({`{
    role: `}<span className="text-green-400">'Senior Analyst'</span>{`,
    model: `}<span className="text-green-400">'gemini-3.0-pro'</span>{`,
    tools: [GoogleSearch, BloombergTerminal],
    temperature: `}<span className="text-orange-400">0.2</span>{`
  }`}]);

  <span className="text-fuchsia-400">const</span> <span className="text-blue-300">result</span> = <span className="text-fuchsia-400">await</span> <span className="text-blue-300">Workflow</span>.<span className="text-yellow-200">execute</span>(researchNode, {`{
    input: `}<span className="text-green-400">"Analyze semiconductor supply chain risks"</span>{`,
    mode: `}<span className="text-green-400">"deterministic"</span>{`
  }`});

  <span className="text-blue-300">console</span>.<span className="text-yellow-200">log</span>(<span className="text-blue-300">result</span>.<span className="text-blue-300">structuredOutput</span>);
                     </pre>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* --- FEATURE GRID (BENTO UI) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32 auto-rows-[minmax(200px,auto)]">
               
               {/* Feature 1: Large */}
               <Reveal className="md:col-span-2 md:row-span-2">
                 <div className="group relative rounded-3xl h-full">
                    <SchematicBackground />
                    <div className="relative glass-card p-10 rounded-3xl h-full flex flex-col justify-between overflow-hidden z-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl pointer-events-none"></div>
                        <div>
                           <Database className="w-12 h-12 mb-6 text-white group-hover:text-blue-400 transition-colors duration-300" />
                           <h3 className="font-display font-bold text-3xl text-white mb-3 tracking-wide">Vector Memory</h3>
                           <p className="text-gray-400 leading-relaxed max-w-sm">
                             Long-term state management with semantic retrieval via Pinecone or Weaviate integrations. 
                             Store billions of vectors with sub-millisecond query times.
                           </p>
                        </div>
                        <div className="mt-8 flex gap-2">
                           <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                           <div className="h-1 w-2 bg-white/20 rounded-full"></div>
                        </div>
                    </div>
                 </div>
               </Reveal>

               {/* Feature 2: Standard */}
               <Reveal delay="delay-100">
                 <div className="group relative rounded-3xl h-full">
                    <SchematicBackground />
                    <div className="relative glass-card p-8 rounded-3xl h-full z-10">
                        <Zap className="w-8 h-8 mb-6 text-white group-hover:text-yellow-400 transition-colors duration-300" />
                        <h3 className="font-display font-bold text-xl text-white mb-3">Instant Edge</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Deploy to 35+ regions globally in sub-100ms. Powered by Cloudflare Workers.
                        </p>
                    </div>
                 </div>
               </Reveal>

               {/* Feature 3: Standard */}
               <Reveal delay="delay-200">
                 <div className="group relative rounded-3xl h-full">
                    <SchematicBackground />
                    <div className="relative glass-card p-8 rounded-3xl h-full z-10">
                        <Command className="w-8 h-8 mb-6 text-white group-hover:text-fuchsia-400 transition-colors duration-300" />
                        <h3 className="font-display font-bold text-xl text-white mb-3">Tool Calling</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          First-class API integrations. Connect Stripe, Salesforce, and Linear directly.
                        </p>
                    </div>
                 </div>
               </Reveal>

               {/* Feature 4: Large Horizontal */}
               <Reveal className="md:col-span-2" delay="delay-100">
                 <div className="group relative rounded-3xl h-full">
                    <SchematicBackground />
                    <div className="relative glass-card p-8 rounded-3xl h-full flex items-center justify-between z-10">
                        <div>
                           <Terminal className="w-8 h-8 mb-4 text-white group-hover:text-green-400 transition-colors duration-300" />
                           <h3 className="font-display font-bold text-xl text-white mb-2">Live Debugging</h3>
                           <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                             Step-by-step execution replay with full state inspection.
                           </p>
                        </div>
                        <div className="hidden md:block w-32 h-20 bg-black/50 rounded-lg border border-white/10 relative overflow-hidden">
                           <div className="absolute top-2 left-2 w-20 h-2 bg-white/10 rounded-full animate-pulse"></div>
                           <div className="absolute top-6 left-2 w-12 h-2 bg-white/10 rounded-full animate-pulse delay-75"></div>
                        </div>
                    </div>
                 </div>
               </Reveal>

               {/* Feature 5: Standard */}
               <Reveal delay="delay-200">
                 <div className="group relative rounded-3xl h-full">
                    <SchematicBackground />
                    <div className="relative glass-card p-8 rounded-3xl h-full z-10">
                        <Shield className="w-8 h-8 mb-6 text-white group-hover:text-green-400 transition-colors duration-300" />
                        <h3 className="font-display font-bold text-xl text-white mb-3">Guardrails</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          PII masking and policy enforcement.
                        </p>
                    </div>
                 </div>
               </Reveal>
            </div>

            {/* --- ARCHITECTURE DEEP DIVE (BENTO UI) --- */}
            <div className="border-t border-white/10 pt-24 mb-32">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                  
                  {/* Left Text */}
                  <div className="col-span-12 lg:col-span-4">
                     <Reveal>
                       <div className="lg:sticky lg:top-32">
                         <h3 className="font-display text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-8 text-white">
                            DETERMINISTIC<br/>
                            <span className="text-cherry">AUTONOMY.</span>
                         </h3>
                         <div className="w-24 h-1 bg-gradient-to-r from-cherry to-transparent mb-8 rounded-full"></div>
                         <p className="font-sans text-lg text-gray-400 leading-relaxed mb-8">
                            Most agent frameworks are black boxes. Aether is a glass engine. 
                            Every state transition is logged, replayable, and mathematically verifiable. 
                            We treat intelligence as a compiled binary.
                         </p>
                         <button 
                            onClick={() => onNavigate('PLATFORM_OBSERVABILITY')}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-cherry transition-colors group"
                        >
                            Explore Architecture <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                         </button>
                       </div>
                     </Reveal>
                  </div>

                  {/* Right Bento Grid */}
                  <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[minmax(180px,auto)]">
                     
                     {/* Card 1: State Ledger (Large) */}
                     <div className="col-span-1 md:col-span-2">
                        <Reveal delay="delay-100">
                          <div className="relative group rounded-3xl h-full">
                             <SchematicBackground />
                             <div className="relative z-10 h-full glass-card p-8 md:p-10 rounded-3xl overflow-hidden">
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cherry/20 to-transparent blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity"></div>
                                 <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                                       <Database className="w-6 h-6 text-cherry" />
                                    </div>
                                    <div>
                                       <h4 className="font-display text-2xl font-bold text-white mb-3">Immutable State Ledger</h4>
                                       <p className="text-gray-400 leading-relaxed max-w-lg">
                                          The DAG engine enforces strict type checking between nodes. Context is serialized into immutable ledgers, allowing for "Time Travel Debugging" across complex chains.
                                       </p>
                                    </div>
                                 </div>
                             </div>
                          </div>
                        </Reveal>
                     </div>

                     {/* Card 2: Model Agnostic */}
                     <Reveal delay="delay-200">
                        <div className="relative group rounded-3xl h-full">
                           <SchematicBackground />
                           <div className="relative z-10 h-full glass-card p-8 rounded-3xl overflow-hidden">
                               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                               <div className="flex flex-col h-full justify-between">
                                  <Cpu className="w-8 h-8 text-white mb-6" />
                                  <div>
                                     <h4 className="font-display text-xl font-bold text-white mb-2">Model Agnostic</h4>
                                     <p className="text-sm text-gray-500 leading-relaxed">
                                        Orchestrate Gemini 2.5 Flash, 3.0 Pro, and fine-tuned endpoints in one topology.
                                     </p>
                                  </div>
                               </div>
                           </div>
                        </div>
                     </Reveal>

                     {/* Card 3: Edge Native */}
                     <Reveal delay="delay-300">
                        <div className="relative group rounded-3xl h-full">
                           <SchematicBackground />
                           <div className="relative z-10 h-full glass-card p-8 rounded-3xl overflow-hidden">
                               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                               <div className="flex flex-col h-full justify-between">
                                  <Zap className="w-8 h-8 text-white mb-6" />
                                  <div>
                                     <h4 className="font-display text-xl font-bold text-white mb-2">Edge Native</h4>
                                     <p className="text-sm text-gray-500 leading-relaxed">
                                        Zero cold starts. Deploy to Cloudflare Workers in 300+ cities globally.
                                     </p>
                                  </div>
                               </div>
                           </div>
                        </div>
                     </Reveal>

                     {/* Card 4: Security (Wide) */}
                     <div className="col-span-1 md:col-span-2">
                        <Reveal delay="delay-100">
                          <div className="relative group rounded-3xl h-full">
                             <SchematicBackground />
                             <div className="relative z-10 h-full glass-card p-8 rounded-3xl overflow-hidden">
                                 <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                       <Shield className="w-8 h-8 text-green-400" />
                                    </div>
                                    <div>
                                       <h4 className="font-display text-xl font-bold text-white mb-2">Enterprise Security Core</h4>
                                       <p className="text-sm text-gray-400 leading-relaxed">
                                          SOC2 Type II compliant. Built-in PII redaction, RBAC, and VPC peering out of the box.
                                       </p>
                                    </div>
                                 </div>
                             </div>
                          </div>
                        </Reveal>
                     </div>
                  </div>
               </div>
            </div>

            {/* --- PRICING SECTION --- */}
            <div className="mb-32">
               <Reveal>
                 <div className="flex flex-col items-center text-center mb-24">
                    <span className="font-mono text-xs text-cherry uppercase tracking-[0.2em] mb-4 bg-cherry/10 px-4 py-1 rounded-full border border-cherry/20">Capacity Planning</span>
                    <h3 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">Scale Your Intelligence</h3>
                    <p className="text-gray-500 max-w-lg font-sans">Transparent pricing based on compute seconds and memory retention.</p>
                 </div>
               </Reveal>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter */}
                  <Reveal delay="delay-0">
                    <div className="relative group rounded-3xl h-full">
                       <SchematicBackground />
                       <div className="relative z-10 glass-card rounded-3xl p-8 md:p-12 flex flex-col h-full">
                           <div className="mb-8">
                              <h4 className="font-sans font-bold text-white text-xl mb-2">Researcher</h4>
                              <p className="text-xs text-gray-500 font-mono">For individual architects.</p>
                           </div>
                           <div className="mb-8">
                              <span className="text-4xl font-display font-bold text-white">$0</span>
                              <span className="text-gray-500 ml-2">/ month</span>
                           </div>
                           <ul className="flex-1 space-y-4 mb-12">
                              <li className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                 <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> 5 Active Agents
                              </li>
                              <li className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                 <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> 10k Runs / mo
                              </li>
                              <li className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                 <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Community Support
                              </li>
                           </ul>
                           <button 
                             onClick={() => onStart()}
                             className="w-full py-4 border border-white/10 rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                           >
                              Start Building
                           </button>
                       </div>
                    </div>
                  </Reveal>

                  {/* Pro */}
                  <Reveal delay="delay-100">
                    <div className="relative group rounded-3xl h-full shadow-[0_0_50px_-15px_rgba(217,4,41,0.2)]">
                       <SchematicBackground />
                       <div className="relative z-10 glass-card rounded-3xl p-8 md:p-12 flex flex-col h-full border-cherry/50">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-cherry rounded-b-full"></div>
                           <div className="mb-8">
                              <h4 className="font-sans font-bold text-white text-xl mb-2">Orchestrator</h4>
                              <p className="text-xs text-cherry font-mono">Most Popular</p>
                           </div>
                           <div className="mb-8">
                              <span className="text-4xl font-display font-bold text-white">$49</span>
                              <span className="text-gray-500 ml-2">/ month</span>
                           </div>
                           <ul className="flex-1 space-y-4 mb-12">
                              <li className="flex items-start gap-3 text-sm text-white">
                                 <Check className="w-4 h-4 text-cherry shrink-0 mt-0.5" /> Unlimited Agents
                              </li>
                              <li className="flex items-start gap-3 text-sm text-white">
                                 <Check className="w-4 h-4 text-cherry shrink-0 mt-0.5" /> 500k Runs / mo
                              </li>
                              <li className="flex items-start gap-3 text-sm text-white">
                                 <Check className="w-4 h-4 text-cherry shrink-0 mt-0.5" /> Vector Memory (10GB)
                              </li>
                              <li className="flex items-start gap-3 text-sm text-white">
                                 <Check className="w-4 h-4 text-cherry shrink-0 mt-0.5" /> Priority Latency
                              </li>
                           </ul>
                           <button className="w-full py-4 bg-cherry rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_30px_-5px_rgba(217,4,41,0.3)]">
                              Upgrade Now
                           </button>
                       </div>
                    </div>
                  </Reveal>

                  {/* Enterprise */}
                  <Reveal delay="delay-200">
                    <div className="relative group rounded-3xl h-full">
                       <SchematicBackground />
                       <div className="relative z-10 glass-card rounded-3xl p-8 md:p-12 flex flex-col h-full">
                           <div className="mb-8">
                              <h4 className="font-sans font-bold text-white text-xl mb-2">Sentient</h4>
                              <p className="text-xs text-gray-500 font-mono">For autonomous orgs.</p>
                           </div>
                           <div className="mb-8">
                              <span className="text-4xl font-display font-bold text-white">Custom</span>
                           </div>
                           <ul className="flex-1 space-y-4 mb-12">
                              <li className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                 <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> On-Premise Deployment
                              </li>
                              <li className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                 <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Custom Fine-tuning
                              </li>
                              <li className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                 <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> 24/7 Dedicated Support
                              </li>
                              <li className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                 <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> SLA Guarantees
                              </li>
                           </ul>
                           <button 
                             onClick={() => onNavigate('COMPANY_ENTERPRISE')}
                             className="w-full py-4 border border-white/10 rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                           >
                              Contact Sales
                           </button>
                       </div>
                    </div>
                  </Reveal>
               </div>
            </div>

            {/* --- TESTIMONIALS --- */}
            <div className="mb-32">
                <Reveal>
                  <div className="flex items-center justify-between mb-16 px-4 border-l-4 border-cherry">
                     <h3 className="font-display text-3xl md:text-5xl font-bold text-white">Trusted By Systems</h3>
                     <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                        <span>Read Case Studies</span>
                        <ArrowUpRight className="w-4 h-4" />
                     </div>
                  </div>
                </Reveal>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                      { quote: "Aether completely replaced our LangChain spaghetti code. It's beautiful.", author: "Sarah Jenkins", role: "AI Lead, Vercel" },
                      { quote: "The deterministic DAG engine is a lifesaver for compliance audits.", author: "Marcus Chen", role: "CTO, FinTech Global" },
                      { quote: "Finally, a visual builder that doesn't feel like a toy. Pure power.", author: "Elena R.", role: "Researcher, DeepMind" },
                      { quote: "We deployed 50 autonomous support agents in a weekend. Unreal.", author: "David K.", role: "Founder, RapidScale" }
                   ].map((t, i) => (
                      <Reveal key={i} delay={`delay-${(i % 4) * 100}`}>
                        <div className="relative group rounded-2xl h-full">
                           <SchematicBackground />
                           <div className="relative z-10 glass-card rounded-2xl p-8 h-full">
                               <Quote className="w-8 h-8 text-white/5 absolute top-4 right-4 group-hover:text-cherry/20 transition-colors" />
                               <div className="flex gap-1 mb-6">
                                  <Star className="w-3 h-3 text-cherry fill-cherry" />
                                  <Star className="w-3 h-3 text-cherry fill-cherry" />
                                  <Star className="w-3 h-3 text-cherry fill-cherry" />
                                  <Star className="w-3 h-3 text-cherry fill-cherry" />
                                  <Star className="w-3 h-3 text-cherry fill-cherry" />
                               </div>
                               <p className="text-sm text-gray-300 mb-8 leading-relaxed font-medium">"{t.quote}"</p>
                               <div className="border-t border-white/5 pt-4">
                                  <div className="text-xs font-bold text-white uppercase tracking-wider">{t.author}</div>
                                  <div className="text-[10px] text-gray-500 font-mono mt-1">{t.role}</div>
                               </div>
                           </div>
                        </div>
                      </Reveal>
                   ))}
                </div>
            </div>

          </div>
        </div>
      </ScrollRevealWrapper>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-[#020202] text-cream pt-24 pb-12 px-6 border-t border-white/5 relative overflow-hidden">
        
        {/* Big Text Background */}
        <div className="w-full flex justify-center overflow-hidden pointer-events-none absolute bottom-0 left-0 z-0">
             <h1 className="text-[15vw] md:text-[20vw] font-bold text-white/[0.03] leading-none tracking-tighter select-none bg-gradient-to-b from-white/[0.05] to-transparent bg-clip-text text-transparent transform translate-y-[20%]">
                 AETHER
             </h1>
        </div>

        <Reveal className="relative z-10">
          <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-start mb-24">
            <div className="mb-12 md:mb-0 max-w-sm">
              <div className="flex items-center gap-2 mb-8">
                 <div className="w-4 h-4 bg-gradient-to-br from-cherry to-red-900 rounded-sm"></div>
                 <h4 className="font-serif italic text-3xl">Aether Systems.</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                 Pioneering the interface for artificial general intelligence. 
                 We build tools for the architects of the next era.
              </p>
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-white/30 cursor-pointer transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-3 h-3 fill-current text-gray-400" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-white/30 cursor-pointer transition-colors">
                    <span className="sr-only">GitHub</span>
                    <svg className="w-3 h-3 fill-current text-gray-400" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                 </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24 font-sans text-sm">
               <div className="flex flex-col gap-4">
                  <h5 className="font-bold text-white mb-2">Platform</h5>
                  <button onClick={() => onNavigate('PLATFORM_OBSERVABILITY')} className="text-left text-gray-500 hover:text-cherry transition-colors">Observability</button>
                  <button onClick={() => onNavigate('PLATFORM_EVALUATIONS')} className="text-left text-gray-500 hover:text-cherry transition-colors">Evaluations</button>
                  <button onClick={() => onNavigate('PLATFORM_PROMPT_CHAIN')} className="text-left text-gray-500 hover:text-cherry transition-colors">Prompt Chain</button>
                  <button onClick={() => onNavigate('PLATFORM_CHANGELOG')} className="text-left text-gray-500 hover:text-cherry transition-colors">Changelog</button>
               </div>
               <div className="flex flex-col gap-4">
                  <h5 className="font-bold text-white mb-2">Resources</h5>
                  <button onClick={() => onNavigate('RESOURCES_DOCS')} className="text-left text-gray-500 hover:text-cherry transition-colors">Documentation</button>
                  <button onClick={() => onNavigate('RESOURCES_API')} className="text-left text-gray-500 hover:text-cherry transition-colors">API Reference</button>
                  <button onClick={() => onNavigate('RESOURCES_COMMUNITY')} className="text-left text-gray-500 hover:text-cherry transition-colors">Community</button>
                  <button onClick={() => onNavigate('RESOURCES_HELP')} className="text-left text-gray-500 hover:text-cherry transition-colors">Help Center</button>
               </div>
               <div className="flex flex-col gap-4">
                  <h5 className="font-bold text-white mb-2">Company</h5>
                  <button onClick={() => onNavigate('COMPANY_ABOUT')} className="text-left text-gray-500 hover:text-cherry transition-colors">About</button>
                  <button onClick={() => onNavigate('COMPANY_ENTERPRISE')} className="text-left text-gray-500 hover:text-cherry transition-colors">Enterprise</button>
                  <button onClick={() => onNavigate('COMPANY_CAREERS')} className="text-left text-gray-500 hover:text-cherry transition-colors">Careers</button>
                  <button onClick={() => onNavigate('COMPANY_LEGAL')} className="text-left text-gray-500 hover:text-cherry transition-colors">Legal</button>
               </div>
            </div>
          </div>
        </Reveal>

        <div className="max-w-screen-xl mx-auto border-t border-white/5 pt-12 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <p className="text-xs text-gray-600 font-mono">
                  © 2025 Aether Systems Inc. All rights reserved. 
                  <span className="hidden md:inline mx-2">|</span> 
                  <span className="block md:inline">Designed in India.</span>
               </p>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">System Operational</span>
                  </div>
               </div>
            </div>
        </div>
      </footer>
    </div>
  );
};
