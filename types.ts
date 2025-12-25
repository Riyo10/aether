
export interface Position {
  x: number;
  y: number;
}

export enum NodeType {
  TRIGGER = 'TRIGGER',
  AGENT = 'AGENT',
  CONDITION = 'CONDITION',
  OUTPUT = 'OUTPUT',
  WEBHOOK = 'WEBHOOK',
  DATABASE = 'DATABASE',
  SLACK = 'SLACK',
  EMAIL = 'EMAIL',
  PARSER = 'PARSER'
}

export interface Attachment {
  name: string;
  type: string;
  size?: string;
  content?: string;
}

export interface NodeData {
  label: string;
  category?: string; // Added for agent categorization
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  output?: string; // The result of the execution
  isExecuting?: boolean;
  attachments?: Attachment[];
  // Integrations specific data
  recipient?: string;
  subject?: string;
  // Generated file download
  downloadUrl?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  nodeId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  token?: string;
  joinedAt?: string; // Added for profile history
}

export type View = 
  | 'LANDING' 
  | 'AUTH' 
  | 'BUILDER' 
  | 'DEPLOYMENTS'
  | 'PROFILE'
  | 'ARCHITECTURE'
  // Platform Pages
  | 'PLATFORM_OBSERVABILITY' 
  | 'PLATFORM_EVALUATIONS' 
  | 'PLATFORM_PROMPT_CHAIN' 
  | 'PLATFORM_CHANGELOG'
  // Resources Pages
  | 'RESOURCES_DOCS' 
  | 'RESOURCES_API' 
  | 'RESOURCES_COMMUNITY' 
  | 'RESOURCES_HELP'
  // Company Pages
  | 'COMPANY_ABOUT' 
  | 'COMPANY_ENTERPRISE' 
  | 'COMPANY_CAREERS' 
  | 'COMPANY_LEGAL';
