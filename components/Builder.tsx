
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Settings, Terminal, Trash2, Box, Database, Webhook, MessageSquare, Mail, Layers, Zap, X, Search, Code, Briefcase, Megaphone, Users, LayoutGrid, Cpu, Link as LinkIcon, AlertCircle, Save, Sparkles, Globe, Brain, Table, FileText, Minus, Plus, ChevronRight, Keyboard, UploadCloud, File, Image as ImageIcon, FileJson, Paperclip, CheckCircle, Copy, Send, ChevronDown, ChevronUp, Maximize2, Minimize2, MoveHorizontal, Download, ArrowLeft } from 'lucide-react';
import { generateAgentResponse } from '../services/geminiService';
import { WorkflowNode, WorkflowEdge, NodeType, LogEntry, Position, Attachment, View } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Handle ESM/CJS interop for PDF.js
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Configure PDF.js worker
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

// --- CONSTANTS & TEMPLATES ---

const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;

interface AgentTemplate {
  category: string;
  name: string;
  model: string;
  icon: React.ElementType;
  prompt: string;
  color: string;
}

interface BuilderProps {
  onNavigate: (view: View) => void;
  // State lifted to parent
  nodes: WorkflowNode[];
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  edges: WorkflowEdge[];
  setEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>;
}

const AGENT_LIBRARY: AgentTemplate[] = [
  // Development (Blue/Cyan)
  { 
    category: 'Development', 
    name: 'Code Reviewer', 
    model: 'gemini-3-pro-preview', 
    icon: Code, 
    color: 'text-blue-400', 
    prompt: 'Analyze the provided code. Output strictly in these sections: \n1. **ISSUES FOUND**: Bullet points of bugs or security risks.\n2. **SUGGESTED FIXES**: Explanation of how to solve them.\n3. **REFACTORED CODE**: The complete, corrected code block.' 
  },
  { 
    category: 'Development', 
    name: 'Python Scripter', 
    model: 'gemini-3-pro-preview', 
    icon: Terminal, 
    color: 'text-blue-400', 
    prompt: 'Write a robust, production-ready Python script for the user task. Include comments explaining key logic. Output ONLY the code and brief instructions.' 
  },
  { 
    category: 'Development', 
    name: 'Unit Test Gen', 
    model: 'gemini-2.5-flash', 
    icon: CheckIcon, 
    color: 'text-cyan-400', 
    prompt: 'Generate comprehensive unit tests (using Jest or PyTest as appropriate) for the input code. Ensure high coverage for edge cases.' 
  },
  { 
    category: 'Development', 
    name: 'Doc Generator', 
    model: 'gemini-2.5-flash', 
    icon: FileText, 
    color: 'text-cyan-400', 
    prompt: 'You are a professional technical writer. Using the SPECIFIC content provided in the input, generate a structured documentation PDF. Do not invent features. Structure the output with a clear Title, Overview, Key Features/Points, and Detailed Breakdown. If the input is a summary, expand on it professionally.' 
  },
  { 
    category: 'Development', 
    name: 'Bug Triager', 
    model: 'gemini-2.5-flash', 
    icon: AlertCircle, 
    color: 'text-red-400', 
    prompt: 'Analyze the provided error logs. Identify the root cause, potential impact, and recommended remediation steps.' 
  },
  
  // Machine Learning (Indigo/Violet)
  { category: 'Machine Learning', name: 'Data Cleaner', model: 'gemini-2.5-flash', icon: Sparkles, color: 'text-indigo-400', prompt: 'Analyze the raw data. Suggest cleaning steps for missing values, outliers, and formatting inconsistencies. Output a clean version if possible.' },
  { category: 'Machine Learning', name: 'Feature Engineer', model: 'gemini-3-pro-preview', icon: Table, color: 'text-indigo-400', prompt: 'Analyze the dataset columns. Suggest and generate 3-5 new features that could improve model performance.' },
  { category: 'Machine Learning', name: 'Model Trainer', model: 'gemini-3-pro-preview', icon: Brain, color: 'text-violet-400', prompt: 'Simulate a training run based on the data description. Output estimated accuracy, loss curves description, and recommended architecture.' },
  
  // Internet Scraper (Teal/Emerald)
  { category: 'Internet Scraper', name: 'Web Scraper', model: 'gemini-2.5-flash', icon: Globe, color: 'text-teal-400', prompt: 'Perform a comprehensive web search based on the user input. Do not expect a URL; treat the input as a search query. Summarize the findings, extract key facts, and provide a clear answer with sources.' },
  { category: 'Internet Scraper', name: 'News Aggregator', model: 'gemini-2.5-flash', icon: NewspaperIcon, color: 'text-emerald-400', prompt: 'Perform a web search to find and summarize the top 3 recent news developments regarding the topic. Provide sources if available.' },

  // Marketing (Pink/Fuchsia)
  { category: 'Marketing', name: 'Copywriter', model: 'gemini-3-pro-preview', icon: Megaphone, color: 'text-fuchsia-400', prompt: 'Write high-conversion marketing copy for the product described. Include a Headline, Value Proposition, and Call to Action.' },
  { category: 'Marketing', name: 'Social Manager', model: 'gemini-2.5-flash', icon: MessageSquare, color: 'text-pink-400', prompt: 'Draft a thread of 3 engaging social media posts (LinkedIn/Twitter) based on the input topic. Include hashtags.' },

  // Sales (Orange/Amber)
  { category: 'Sales', name: 'Lead Qualifier', model: 'gemini-2.5-flash', icon: Users, color: 'text-orange-400', prompt: 'Analyze the prospect information. Score the lead (0-100) based on Budget, Authority, Need, and Timeline (BANT). Explain the score.' },
  { category: 'Sales', name: 'CRM Formatter', model: 'gemini-2.5-flash', icon: Database, color: 'text-amber-400', prompt: 'Extract contact details (Name, Email, Company, Role) from the unstructured text and format strictly as JSON.' },

  // Email Automation (Yellow/Lime)
  { category: 'Email Automation', name: 'Cold Outreach', model: 'gemini-3-pro-preview', icon: Mail, color: 'text-yellow-400', prompt: 'Write a personalized, non-spammy cold email to the prospect. Focus on their specific pain points and offer a clear value add.' },
  
  // Operations (Gray/White)
  { category: 'Operations', name: 'Summarizer', model: 'gemini-2.5-flash', icon: LayoutGrid, color: 'text-gray-300', prompt: 'Summarize the provided content into a concise executive summary with 3 key takeaways.' },
  { category: 'Operations', name: 'Translator', model: 'gemini-2.5-flash', icon: GlobeIcon, color: 'text-gray-300', prompt: 'Translate the input text into Spanish, French, and German. Maintain professional tone.' },
  
  // Integrations (Green)
  { category: 'Integrations', name: 'Email Sender', model: 'mock-sender', icon: Send, color: 'text-green-400', prompt: 'This is the default body content.' },

  // Human Interaction (Rose)
  { category: 'Human Interaction', name: 'User Input', model: 'gemini-2.5-flash', icon: Keyboard, color: 'text-rose-400', prompt: '' }, // Empty prompt as this is user driven
];

// Helper Icons
function CheckIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function ShieldIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function GlobeIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>; }
function ClockIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function NewspaperIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>; }

const getEdgePath = (source: Position, target: Position) => {
  const deltaX = target.x - source.x;
  const controlPointX = deltaX * 0.5;
  return `M${source.x},${source.y} C${source.x + controlPointX},${source.y} ${target.x - controlPointX},${target.y} ${target.x},${target.y}`;
};

export const Builder: React.FC<BuilderProps> = ({ onNavigate, nodes, setNodes, edges, setEdges }) => {
  // --- STATE ---
  // Nodes and Edges are now received via props for persistence
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Viewport State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Position>({ x: 0, y: 0 });
  
  // Interaction State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // UI Panels State
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Store offset in "world" units (screen pixels / zoom)
  const dragOffset = useRef<{x: number, y: number}>({ x: 0, y: 0 });

  // --- LOGIC ---

  const addLog = (level: LogEntry['level'], message: string, nodeId?: string) => {
    setLogs(prev => [{ id: Math.random().toString(36), timestamp: new Date(), level, message, nodeId }, ...prev]);
  };

  const addNode = (template: AgentTemplate | NodeType) => {
    const id = Math.random().toString(36).substr(2, 9);
    let newNode: WorkflowNode;

    // Calculate center of current view relative to viewport
    const viewportCenterX = (window.innerWidth / 2 - 288) / zoom - pan.x; // 288 is sidebar width offset approx
    const viewportCenterY = (window.innerHeight / 2) / zoom - pan.y;

    const jitterX = (Math.random() * 100) - 50;
    const jitterY = (Math.random() * 100) - 50;

    if (typeof template === 'string') {
        newNode = {
            id,
            type: template as NodeType,
            position: { x: viewportCenterX + jitterX, y: viewportCenterY + jitterY },
            data: { label: `New ${template}` }
        };
    } else {
        newNode = {
            id,
            type: NodeType.AGENT,
            position: { x: viewportCenterX + jitterX, y: viewportCenterY + jitterY },
            data: { 
                label: template.name,
                category: template.category,
                model: template.model,
                systemPrompt: template.prompt 
            }
        };
    }
    setNodes([...nodes, newNode]);
    addLog('info', `Added node: ${newNode.data.label}`);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  };

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && selectedNodeId) {
          const file = e.target.files[0];
          const fileType = file.type.includes('image') ? 'image' : file.type.includes('json') ? 'json' : file.type === 'application/pdf' ? 'pdf' : 'file';
          
          let content = "";
          
          try {
              if (file.type === 'application/pdf') {
                  addLog('info', 'Parsing PDF...', selectedNodeId);
                  const arrayBuffer = await file.arrayBuffer();
                  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                  const pdf = await loadingTask.promise;
                  
                  let extractedText = '';
                  // Limit to first 10 pages for performance in this demo
                  const maxPages = Math.min(pdf.numPages, 10);
                  
                  for (let i = 1; i <= maxPages; i++) {
                      const page = await pdf.getPage(i);
                      const textContent = await page.getTextContent();
                      const pageText = textContent.items.map((item: any) => item.str).join(' ');
                      extractedText += `\n--- Page ${i} ---\n${pageText}`;
                  }
                  content = extractedText;
                  addLog('success', 'PDF Parsed Successfully', selectedNodeId);

              } else if (file.type.match(/text.*/) || file.type.includes('json') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                  content = await file.text();
              } else {
                 content = `[Binary content for file '${file.name}' is not supported in this demo. Please convert to PDF or text.]`;
              }
          } catch (err) {
              console.error("File Read Error", err);
              addLog('error', 'Failed to read file content', selectedNodeId);
              content = "[Error reading file content]";
          }

          const newAttachment: Attachment = {
              name: file.name,
              type: fileType,
              size: (file.size / 1024).toFixed(1) + 'KB',
              content: content
          };

          setNodes(prev => prev.map(n => {
              if (n.id === selectedNodeId) {
                  const currentAttachments = n.data.attachments || [];
                  return {
                      ...n,
                      data: {
                          ...n.data,
                          attachments: [...currentAttachments, newAttachment]
                      }
                  };
              }
              return n;
          }));
          addLog('success', `Uploaded: ${file.name}`);
          
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const removeAttachment = (index: number) => {
      if (!selectedNodeId) return;
      setNodes(prev => prev.map(n => {
          if (n.id === selectedNodeId) {
              const currentAttachments = n.data.attachments || [];
              const removed = currentAttachments[index];
              return {
                  ...n,
                  data: {
                      ...n.data,
                      attachments: currentAttachments.filter((_, i) => i !== index)
                  }
              };
          }
          return n;
      }));
  };

  // --- DRAG & DROP & PANNING LOGIC ---

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
      // Middle click or Space+Click initiates pan
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
          e.preventDefault();
          setIsPanning(true);
          setLastMousePos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    // Coordinate conversion:
    // Screen (clientX) -> Canvas relative -> Divide by Zoom -> Subtract Pan
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const worldMouseX = (e.clientX - canvasRect.left) / zoom - pan.x;
    const worldMouseY = (e.clientY - canvasRect.top) / zoom - pan.y;
    
    dragOffset.current = { 
      x: worldMouseX - node.position.x, 
      y: worldMouseY - node.position.y 
    };

    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
  };

  const handleMouseDownHandle = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setConnectingNodeId(nodeId);
    // Initial mouse pos in World Space
    setMousePos({ 
      x: (e.clientX - canvasRect.left) / zoom - pan.x, 
      y: (e.clientY - canvasRect.top) / zoom - pan.y 
    });
  };

  const handleMouseUpHandle = (e: React.MouseEvent, targetNodeId: string) => {
      e.stopPropagation();
      if (connectingNodeId && connectingNodeId !== targetNodeId) {
          const exists = edges.find(e => e.source === connectingNodeId && e.target === targetNodeId);
          if (!exists) {
            const newEdge: WorkflowEdge = {
                id: `e-${connectingNodeId}-${targetNodeId}`,
                source: connectingNodeId,
                target: targetNodeId
            };
            setEdges([...edges, newEdge]);
            addLog('success', `Connected nodes`);
          }
      }
      setConnectingNodeId(null);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Handle Canvas Panning
    if (isPanning) {
        const deltaX = (e.clientX - lastMousePos.x) / zoom;
        const deltaY = (e.clientY - lastMousePos.y) / zoom;
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
        return;
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Project mouse to world coordinates
    const worldX = (e.clientX - canvasRect.left) / zoom - pan.x;
    const worldY = (e.clientY - canvasRect.top) / zoom - pan.y;

    if (draggingNodeId) {
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { 
        ...n, 
        position: { 
          x: worldX - dragOffset.current.x, 
          y: worldY - dragOffset.current.y 
        } 
      } : n));
    } else if (connectingNodeId) {
        setMousePos({ x: worldX, y: worldY });
    }
  }, [draggingNodeId, connectingNodeId, zoom, pan, isPanning, lastMousePos]);

  const handleMouseUpCanvas = () => {
    setDraggingNodeId(null);
    setConnectingNodeId(null);
    setIsPanning(false);
  };

  // --- EXECUTION LOGIC ---
  const executeWorkflow = async () => {
    setIsExecuting(true);
    setLogs([]);
    addLog('info', 'Starting execution sequence...');
    
    // Create a local map to store outputs for this execution run. 
    // This solves the React state closure issue where subsequent nodes couldn't see updates from previous nodes.
    const executionResults = new Map<string, string>();

    try {
        // Start with explicit Triggers OR Human Interaction nodes that act as start points (no incoming edges)
        const startNodes = nodes.filter(n => {
            if (n.type === NodeType.TRIGGER || n.type === NodeType.WEBHOOK) return true;
            if (n.data.category === 'Human Interaction') {
                // Check if it has incoming edges
                const hasIncoming = edges.some(e => e.target === n.id);
                return !hasIncoming;
            }
            return false;
        });

        if (startNodes.length === 0) throw new Error("No trigger or start node found.");
        
        // Populate existing output state into execution map (for cases where we are resuming or using static triggers)
        nodes.forEach(n => {
             if (n.data.output) executionResults.set(n.id, n.data.output);
        });

        const executed = new Set<string>();
        const queue = [...startNodes];

        while (queue.length > 0) {
            const currentNode = queue.shift();
            if (!currentNode) continue;
            if (executed.has(currentNode.id)) continue;

            const incomingEdges = edges.filter(e => e.target === currentNode.id);
            let inputContext = '';
            
            if (incomingEdges.length > 0) {
                 const inputs = incomingEdges.map(e => {
                     // Prioritize the fresh output from this run's execution map, fall back to node state
                     return executionResults.get(e.source) || nodes.find(n => n.id === e.source)?.data.output;
                 }).filter(Boolean).join('\n---\n');
                 if (inputs) inputContext = inputs;
            }

            if (currentNode.type === NodeType.AGENT) {
                // If this is a Human Interaction Node (User Input)
                if (currentNode.data.category === 'Human Interaction') {
                    addLog('info', `User Input: ${currentNode.data.label}`, currentNode.id);
                    setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, data: { ...n.data, isExecuting: true } } : n));
                    
                    // Simulate processing delay for effect
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Use the text entered in the UI + attachments as output
                    let userInput = currentNode.data.systemPrompt || "";
                    if (currentNode.data.attachments && currentNode.data.attachments.length > 0) {
                        const fileList = currentNode.data.attachments.map(a => 
                            `--- File: ${a.name} ---\n${a.content}\n--- End File ---`
                        ).join('\n\n');
                        userInput = userInput ? `${userInput}\n\nAttached Files:\n${fileList}` : `Attached Files:\n${fileList}`;
                    }
                    if (!userInput) userInput = "No user input provided.";
                    
                    // Update local execution map immediately for next nodes
                    executionResults.set(currentNode.id, userInput);

                    setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, data: { ...n.data, output: userInput, isExecuting: false } } : n));
                    addLog('success', 'User input captured', currentNode.id);

                } else if (currentNode.data.model === 'mock-sender') {
                    // --- MOCK EMAIL SENDER ---
                    const recipient = currentNode.data.recipient || 'unknown@example.com';
                    addLog('info', `Simulating email dispatch to ${recipient}...`, currentNode.id);
                    setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, data: { ...n.data, isExecuting: true } } : n));
                    
                    // Simulate network delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const bodyContent = inputContext || currentNode.data.systemPrompt || "No content provided.";
                    const subject = currentNode.data.subject || 'Workflow Notification';
                    
                    // Attempt to open mail client for "real" feel in demo mode
                    try {
                        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent.substring(0, 1500))}`;
                        window.open(mailtoLink, '_blank');
                    } catch (e) {
                        console.error("Could not open mail client", e);
                    }

                    const emailOutput = `[DEMO MODE: SIMULATION]\nBecause this application runs client-side without a backend email server (SMTP), we have opened your default mail client with the drafted content.\n\n--------------------------------------\nSTATUS:  Draft Created\nTO:      ${recipient}\nSUBJECT: ${subject}\nDATE:    ${new Date().toISOString()}\n\nBODY (Preview):\n${bodyContent.substring(0, 500)}...\n--------------------------------------`;
                    
                    executionResults.set(currentNode.id, emailOutput);
                    setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, data: { ...n.data, output: emailOutput, isExecuting: false } } : n));
                    addLog('success', 'Email draft opened in client', currentNode.id);

                } else {
                    // Standard AI Agent
                    addLog('info', `Agent Thinking: ${currentNode.data.label}`, currentNode.id);
                    setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, data: { ...n.data, isExecuting: true } } : n));
                    
                    // Stronger context injection for Doc Generator or any node relying heavily on inputs
                    let effectivePrompt = currentNode.data.systemPrompt || '';
                    if (currentNode.data.label.includes('Doc Generator') && inputContext) {
                        effectivePrompt = `${effectivePrompt}\n\n[INPUT CONTENT TO DOCUMENT]:\n${inputContext}`;
                    }

                    const response = await generateAgentResponse(inputContext || "Start", effectivePrompt, currentNode.data.model);
                    
                    let downloadUrl = undefined;

                    // --- DOC GENERATOR PDF LOGIC ---
                    if (currentNode.data.label === 'Doc Generator' || currentNode.data.label.includes('Doc')) {
                         try {
                             addLog('info', 'Converting output to PDF...', currentNode.id);
                             const doc = new jsPDF();
                             
                             // Strip markdown symbols for cleaner PDF text
                             const cleanText = (text: string) => {
                                return text
                                    .replace(/#{1,6}\s?/g, '') // Remove headers
                                    .replace(/\*\*/g, '')      // Remove bold
                                    .replace(/\*/g, '')        // Remove italics
                                    .replace(/`/g, '')         // Remove code ticks
                                    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Remove links, keep text
                             };

                             const processedText = cleanText(response);

                             // Split text to fit page width
                             const splitText = doc.splitTextToSize(processedText, 180); // 180mm width (A4 is 210mm)
                             
                             let y = 20;
                             const pageHeight = 280;
                             
                             doc.setFontSize(16);
                             doc.text("Generated Documentation", 10, y);
                             y += 15;
                             doc.setFontSize(11);
                             
                             // Simple pagination loop
                             for(let i=0; i<splitText.length; i++) {
                                if (y > pageHeight) {
                                   doc.addPage();
                                   y = 20;
                                }
                                doc.text(splitText[i], 10, y);
                                y += 6;
                             }
                             
                             const pdfBlob = doc.output('blob');
                             downloadUrl = URL.createObjectURL(pdfBlob);
                             addLog('success', 'PDF Generated Successfully', currentNode.id);
                         } catch (pdfErr) {
                             console.error("PDF Gen Error", pdfErr);
                             addLog('error', 'Failed to generate PDF', currentNode.id);
                         }
                    }

                    // Update local execution map immediately
                    executionResults.set(currentNode.id, response);

                    setNodes(prev => prev.map(n => n.id === currentNode.id ? { 
                        ...n, 
                        data: { 
                            ...n.data, 
                            output: response, 
                            downloadUrl: downloadUrl,
                            isExecuting: false 
                        } 
                    } : n));
                    addLog('success', 'Step Complete', currentNode.id);
                }

            } else if (currentNode.type === NodeType.TRIGGER) {
                 // For Triggers, we need to make sure they pass along any input context they might have received
                 // If the trigger was triggered by a User Input node upstream (topology-wise), we pass that through.
                 // Otherwise, standard trigger output.
                 let triggerOutput = inputContext || currentNode.data.output || 'Trigger fired';
                 
                 // Update local execution map
                 executionResults.set(currentNode.id, triggerOutput);

                 // Update the node's output so downstream nodes can read it via inputContext logic
                 setNodes(prev => prev.map(n => n.id === currentNode.id ? { ...n, data: { ...n.data, output: triggerOutput } } : n));
                 addLog('success', 'Trigger Activated', currentNode.id);
            }

            executed.add(currentNode.id);
            const outgoingEdges = edges.filter(e => e.source === currentNode.id);
            outgoingEdges.forEach(e => {
                const nextNode = nodes.find(n => n.id === e.target);
                if (nextNode) queue.push(nextNode);
            });
            if (executed.size > 20) break; 
        }
        addLog('success', 'Workflow finished.');
    } catch (err: any) {
      addLog('error', err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const categories = Array.from(new Set(AGENT_LIBRARY.map(a => a.category)));

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden pt-20 bg-black relative">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        multiple={false}
      />

      {/* --- SETTINGS MODAL --- */}
      {showSettings && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="glass-panel w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative">
                  <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X /></button>
                  <h2 className="font-display text-3xl font-bold text-white mb-6 flex items-center gap-3">
                      <Settings className="text-cherry" /> System Configuration
                  </h2>
                  <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase text-gray-500">API Gateway</label>
                          <input type="text" value="https://api.aether.ai/v1" disabled className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-gray-400" />
                          
                          <label className="block text-xs font-bold uppercase text-gray-500">Default Model</label>
                          <select className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cherry outline-none">
                              <option>Gemini 2.5 Flash</option>
                              <option>Gemini 3.0 Pro</option>
                          </select>
                      </div>
                      <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase text-gray-500">Environment</label>
                          <div className="flex gap-2">
                              <button className="flex-1 py-2 bg-cherry/20 border border-cherry text-cherry text-xs font-bold rounded-lg">Production</button>
                              <button className="flex-1 py-2 bg-white/5 border border-white/10 text-gray-400 text-xs font-bold rounded-lg hover:bg-white/10">Staging</button>
                          </div>
                      </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                      <button onClick={() => setShowSettings(false)} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                      <button onClick={() => { setShowSettings(false); addLog('success', 'Settings saved globally.'); }} className="px-6 py-2 rounded-lg bg-cream text-black text-sm font-bold hover:bg-white flex items-center gap-2">
                          <Save className="w-4 h-4" /> Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- LEFT SIDEBAR: AGENT LIBRARY --- */}
      <div className="w-72 border-r border-white/5 bg-[#050505] flex flex-col z-20">
         <div className="p-4 border-b border-white/5 flex items-center gap-3">
             <button 
                onClick={() => onNavigate('LANDING')}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Back to Home"
             >
                 <ArrowLeft className="w-4 h-4" />
             </button>
             <div className="relative flex-1">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                 <input 
                    type="text" 
                    placeholder="Search agents..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cherry"
                 />
             </div>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar">
             {categories.map(cat => {
                 const catAgents = AGENT_LIBRARY.filter(a => a.category === cat && a.name.toLowerCase().includes(searchQuery.toLowerCase()));
                 if (catAgents.length === 0) return null;
                 return (
                     <div key={cat} className="mb-2">
                         <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 sticky top-0 bg-[#050505] z-10">{cat}</div>
                         <div className="px-2 space-y-1">
                             {catAgents.map(agent => (
                                 <button 
                                    key={agent.name}
                                    onClick={() => addNode(agent)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-3 group transition-all"
                                 >
                                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 transition-colors">
                                        <agent.icon className={`w-4 h-4 ${agent.color}`} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-300 group-hover:text-white">{agent.name}</div>
                                        <div className="text-[10px] text-gray-600 truncate max-w-[140px]">{agent.model}</div>
                                    </div>
                                 </button>
                             ))}
                         </div>
                     </div>
                 );
             })}
         </div>
      </div>

      {/* --- CANVAS --- */}
      <div 
        className={`flex-1 relative bg-black overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDownCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
      >
        {/* Background Grid - Scaled to create depth */}
        <div className="absolute inset-0 pointer-events-none origin-top-left" style={{ 
            backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', 
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`, 
            backgroundPosition: `${pan.x * zoom}px ${pan.y * zoom}px`, // Pan bg for visual effect
            opacity: 0.5 
        }} />

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 z-50">
           <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Minus className="w-4 h-4" />
           </button>
           <span className="text-xs font-mono text-gray-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
           <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
           </button>
           <div className="w-px h-6 bg-white/10 mx-2"></div>
           <span className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">Shift+Drag to Pan</span>
        </div>

        {/* Horizontal Pan Slider */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-64 md:w-96 group">
             <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 shadow-xl">
                 <MoveHorizontal className="w-3 h-3 text-gray-500" />
                 <input 
                    type="range" 
                    min="-2000" 
                    max="2000" 
                    value={pan.x}
                    onChange={(e) => setPan(prev => ({ ...prev, x: Number(e.target.value) }))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cherry [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
                 />
                 <span className="text-[9px] font-mono text-gray-500 w-8 text-right">{Math.round(pan.x)}</span>
             </div>
        </div>

        {/* World Container - Transforms everything inside */}
        <div style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, transformOrigin: '0 0', width: '100%', height: '100%' }}>
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {edges.map(edge => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                const sourcePos = { x: source.position.x + NODE_WIDTH, y: source.position.y + NODE_HEIGHT / 2 };
                const targetPos = { x: target.position.x, y: target.position.y + NODE_HEIGHT / 2 };
                return (
                    <g key={edge.id}>
                        <path d={getEdgePath(sourcePos, targetPos)} stroke="#333" strokeWidth="4" fill="none" />
                        <path d={getEdgePath(sourcePos, targetPos)} stroke={selectedNodeId === edge.source ? "#D90429" : "#666"} strokeWidth="1.5" fill="none" className="transition-colors duration-300" />
                    </g>
                );
              })}
              
              {connectingNodeId && (
                  <path 
                    d={getEdgePath(
                        { 
                            x: nodes.find(n => n.id === connectingNodeId)!.position.x + NODE_WIDTH, 
                            y: nodes.find(n => n.id === connectingNodeId)!.position.y + NODE_HEIGHT / 2 
                        }, 
                        mousePos
                    )} 
                    stroke="#D90429" 
                    strokeWidth="2" 
                    strokeDasharray="5,5" 
                    fill="none" 
                  />
              )}
            </svg>

            {nodes.map(node => (
              <div
                key={node.id}
                className={`workflow-node absolute w-[280px] glass-panel rounded-2xl shadow-xl transition-all group
                  ${selectedNodeId === node.id ? 'border-cherry ring-1 ring-cherry/50' : 'hover:border-white/30'}
                  ${node.data.isExecuting ? 'ring-2 ring-yellow-500/50' : ''}
                `}
                style={{ left: node.position.x, top: node.position.y, height: NODE_HEIGHT }}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
              >
                {/* Input Handle */}
                <div 
                    className="absolute -left-3 top-1/2 w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-50"
                    onMouseUp={(e) => handleMouseUpHandle(e, node.id)}
                >
                    <div className="w-3 h-3 bg-black border-2 border-gray-500 rounded-full group-hover:border-white group-hover:bg-cherry transition-colors" />
                </div>

                {/* Output Handle */}
                <div 
                    className="absolute -right-3 top-1/2 w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-50"
                    onMouseDown={(e) => handleMouseDownHandle(e, node.id)}
                >
                     <div className="w-3 h-3 bg-black border-2 border-gray-500 rounded-full group-hover:border-white group-hover:bg-cherry transition-colors" />
                </div>

                {/* Output Ready Badge */}
                {node.data.output && (
                    <div className="absolute -bottom-3 right-4 bg-emerald-900/80 border border-emerald-500/30 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm z-10 animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-3 h-3" /> Output Ready
                    </div>
                )}
                
                {/* Download PDF Badge */}
                {node.data.downloadUrl && (
                    <div className="absolute -bottom-3 left-4 bg-blue-900/80 border border-blue-500/30 text-blue-200 text-[9px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm z-10 animate-in fade-in zoom-in duration-300 cursor-pointer hover:bg-blue-800 transition-colors"
                        onClick={(e) => {
                             e.stopPropagation();
                             const link = document.createElement('a');
                             link.href = node.data.downloadUrl!;
                             link.download = `${node.data.label.replace(/\s+/g, '_')}_output.pdf`;
                             link.click();
                        }}
                    >
                        <Download className="w-3 h-3" /> PDF Ready
                    </div>
                )}

                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-2xl">
                   <div className="flex items-center gap-2">
                     <Zap className={`w-3 h-3 ${node.type === NodeType.TRIGGER ? 'text-purple-400' : 'text-cherry'}`} />
                     <span className="text-[10px] font-bold uppercase tracking-wider text-cream/60">{node.data.category || node.type}</span>
                   </div>
                   <div className={`w-1.5 h-1.5 rounded-full ${node.data.isExecuting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500/50'}`} />
                </div>
                <div className="p-4">
                  <h3 className="text-cream font-bold text-sm mb-1 truncate">{node.data.label}</h3>
                  <p className="text-cream/40 text-[10px] font-mono truncate">{node.id}</p>
                  {node.data.model && <div className="mt-2 text-[10px] bg-white/5 inline-block px-2 py-0.5 rounded text-gray-400">{node.data.model}</div>}
                </div>
              </div>
            ))}
        </div>
        
        {/* --- RIGHT SIDE FLOATING PANELS --- */}
        <div className="absolute right-6 top-6 bottom-6 w-80 flex flex-col gap-4 z-40">
            
            {/* 1. CONFIGURATION BLOCK */}
            <div className={`w-full glass-panel rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ease-in-out
                ${isConfigCollapsed ? 'h-12 flex-none' : (isConsoleCollapsed ? 'flex-1' : 'h-1/2')}
            `}>
                <div 
                    className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                >
                  <h2 className="font-display font-bold text-cream tracking-wide text-sm flex items-center gap-2">
                    {selectedNode?.data.category === 'Human Interaction' ? (
                        <> <Keyboard className="w-4 h-4 text-rose-400" /> Human Input </>
                    ) : (
                        <> <Settings className="w-4 h-4 text-cherry" /> Configuration </>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} 
                        className="text-cream/50 hover:text-white transition-colors p-1"
                      >
                          <Settings className="w-3 h-3" />
                      </button>
                      <button className="text-cream/50 hover:text-white transition-colors p-1">
                          {isConfigCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                  </div>
                </div>
                
                <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/20 ${isConfigCollapsed ? 'hidden' : 'block'}`}>
                  {selectedNode ? (
                    <>
                       <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-bold text-cream/30 uppercase font-mono tracking-widest">ID: {selectedNode.id}</span>
                       </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">Label</label>
                            <input 
                              type="text" 
                              value={selectedNode.data.label}
                              onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n))}
                              className="w-full bg-black/50 border border-white/10 p-2 text-xs text-cream focus:border-cherry focus:outline-none rounded-md transition-colors"
                            />
                        </div>

                        {selectedNode.data.category === 'Human Interaction' ? (
                            // --- USER INPUT INTERFACE ---
                            <>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">Message to Agent</label>
                                    <textarea 
                                        value={selectedNode.data.systemPrompt}
                                        placeholder="Type your message here..."
                                        onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, systemPrompt: e.target.value } } : n))}
                                        rows={4}
                                        className="w-full bg-black/50 border border-white/10 p-3 text-xs text-cream focus:border-rose-400 focus:outline-none resize-none font-sans rounded-md"
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">Upload Context</label>
                                    
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-24 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-white/40 transition-all cursor-pointer group active:scale-95"
                                    >
                                         <div className="flex gap-2 mb-2 text-gray-500 group-hover:text-rose-400 transition-colors">
                                            <FileText className="w-4 h-4" />
                                            <ImageIcon className="w-4 h-4" />
                                            <FileJson className="w-4 h-4" />
                                         </div>
                                         <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-white">Drag or Click to Upload</span>
                                    </div>

                                    {/* Render Uploaded Files */}
                                    <div className="flex flex-col gap-1 mt-2">
                                        {selectedNode.data.attachments?.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5 group animate-in slide-in-from-top-1">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {file.type === 'image' ? (
                                                        <ImageIcon className="w-3 h-3 text-blue-400 shrink-0" />
                                                    ) : file.type === 'json' ? (
                                                        <FileJson className="w-3 h-3 text-yellow-400 shrink-0" />
                                                    ) : file.type === 'pdf' ? (
                                                        <FileText className="w-3 h-3 text-red-400 shrink-0" />
                                                    ) : (
                                                        <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                                                    )}
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]" title={file.name}>{file.name}</span>
                                                    {file.size && <span className="text-[9px] text-gray-600">({file.size})</span>}
                                                </div>
                                                <button 
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-gray-600 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!selectedNode.data.attachments || selectedNode.data.attachments.length === 0) && (
                                            <div className="text-[9px] text-gray-600 text-center italic py-2">No files attached</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : selectedNode.data.model === 'mock-sender' ? (
                          // --- EMAIL SENDER CONFIGURATION ---
                          <>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">Recipient</label>
                                <input 
                                  type="text" 
                                  value={selectedNode.data.recipient || ''}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, recipient: e.target.value } } : n))}
                                  placeholder="name@company.com"
                                  className="w-full bg-black/50 border border-white/10 p-2 text-xs text-cream focus:border-cherry focus:outline-none rounded-md"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">Subject</label>
                                <input 
                                  type="text" 
                                  value={selectedNode.data.subject || ''}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, subject: e.target.value } } : n))}
                                  placeholder="Enter subject line..."
                                  className="w-full bg-black/50 border border-white/10 p-2 text-xs text-cream focus:border-cherry focus:outline-none rounded-md"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">Default Body / Template</label>
                                <textarea 
                                  value={selectedNode.data.systemPrompt}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, systemPrompt: e.target.value } } : n))}
                                  rows={5}
                                  className="w-full bg-black/50 border border-white/10 p-2 text-xs text-cream/80 focus:border-cherry focus:outline-none resize-none font-mono rounded-md leading-relaxed"
                                  placeholder="Enter email body (will be overridden if this node receives input)..."
                                />
                             </div>
                          </>
                        ) : selectedNode.type === NodeType.AGENT ? (
                          // --- AGENT CONFIGURATION ---
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">Model</label>
                              <select 
                                value={selectedNode.data.model}
                                onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, model: e.target.value } } : n))}
                                className="w-full bg-black/50 border border-white/10 p-2 text-xs text-cream focus:border-cherry focus:outline-none rounded-md"
                              >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-cream/50 uppercase tracking-wider">System Prompt</label>
                              <textarea 
                                value={selectedNode.data.systemPrompt}
                                onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, systemPrompt: e.target.value } } : n))}
                                rows={3}
                                className="w-full bg-black/50 border border-white/10 p-2 text-xs text-cream/80 focus:border-cherry focus:outline-none resize-none font-mono rounded-md leading-relaxed"
                              />
                            </div>
                          </>
                        ) : null}
                        
                         {/* --- OUTPUT SECTION --- */}
                         {selectedNode.data.output && (
                            <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between mb-2">
                                   <div className="flex items-center gap-2">
                                       <Sparkles className="w-3 h-3 text-emerald-400" />
                                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Execution Result</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <span className="text-[9px] text-gray-600 font-mono">{selectedNode.data.output.length} chars</span>
                                       
                                       {selectedNode.data.downloadUrl && (
                                          <button 
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = selectedNode.data.downloadUrl!;
                                                link.download = `${selectedNode.data.label.replace(/\s+/g, '_')}_output.pdf`;
                                                link.click();
                                            }}
                                            className="p-1 hover:bg-white/10 rounded transition-colors text-blue-400"
                                            title="Download PDF"
                                          >
                                            <Download className="w-3 h-3" />
                                          </button>
                                       )}

                                       <button 
                                         onClick={() => {
                                            navigator.clipboard.writeText(selectedNode.data.output || '');
                                            addLog('info', 'Output copied to clipboard');
                                         }}
                                         className="p-1 hover:bg-white/10 rounded transition-colors"
                                         title="Copy output"
                                       >
                                         <Copy className="w-3 h-3 text-gray-500 hover:text-white" />
                                       </button>
                                   </div>
                                </div>
                                <div className="p-3 bg-black/40 rounded border border-emerald-500/20 text-xs text-emerald-100 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                                  {selectedNode.data.output}
                                </div>
                            </div>
                         )}

                         <div className="pt-2 mt-auto">
                           <button 
                            onClick={() => deleteNode(selectedNode.id)}
                            className="w-full py-2 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md text-[10px] font-bold uppercase transition-all"
                           >
                              <Trash2 className="w-3 h-3" /> Delete Node
                           </button>
                        </div>
                      </div>
                    </>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-cream/30">
                       <Box className="w-10 h-10 mb-3 opacity-20" />
                       <p className="text-[10px] font-mono uppercase tracking-widest">Select a node</p>
                     </div>
                  )}
                </div>
            </div>

            {/* 2. CONSOLE BLOCK */}
            <div className={`w-full glass-panel rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ease-in-out
                 ${isConsoleCollapsed ? 'h-12 flex-none' : (isConfigCollapsed ? 'flex-1' : 'flex-1')}
            `}>
                <div 
                    className="p-3 border-b border-white/5 flex items-center justify-between bg-black/40 cursor-pointer hover:bg-black/60 transition-colors"
                    onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                >
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-gray-400" />
                        <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Console</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); executeWorkflow(); }}
                            disabled={isExecuting}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${isExecuting ? 'bg-white/5 text-gray-500' : 'bg-cherry/80 text-white hover:bg-cherry'}`}
                        >
                            <Play size={8} fill="currentColor" /> {isExecuting ? 'Running' : 'Run'}
                        </button>
                        <button className="text-cream/50 hover:text-white transition-colors p-1">
                          {isConsoleCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div className={`flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[10px] bg-black/20 ${isConsoleCollapsed ? 'hidden' : 'block'}`}>
                    {logs.length === 0 && (
                        <div className="text-gray-600 italic text-center mt-10">System Idle. Ready to capture events.</div>
                    )}
                    {logs.map(log => (
                        <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-gray-600 shrink-0">{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</span>
                            <div className="flex-1 break-words">
                                <span className={`font-bold mr-1 ${log.level === 'success' ? 'text-emerald-400' : log.level === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {log.level === 'info' ? 'i' : log.level === 'success' ? '✓' : '!'}
                                </span>
                                <span className="text-gray-300">{log.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

      </div>

    </div>
  );
};
