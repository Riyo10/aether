
import { config } from '../config/env';

interface AgentDefinition {
  id: string;
  webhookUrl: string;
  requiresContext: boolean;
  timeoutMs: number;
}

// Maps the public "model" or "agent" identifier from the UI to internal infrastructure
export const getAgentDefinition = (modelId: string): AgentDefinition => {
  const baseUrl = config.WEBHOOK_BASE_URL;

  // Routing logic based on model capability or specific agent ID
  // In production, this might look up a database or service discovery (Consul/K8s)
  
  switch (modelId) {
    case 'gemini-3-pro-preview':
      return {
        id: 'agent-reasoning-core-v3',
        webhookUrl: `${baseUrl}/reasoning/execute`,
        requiresContext: true,
        timeoutMs: 60000 // 60s for heavy reasoning
      };
    case 'gemini-2.5-flash':
      return {
        id: 'agent-fast-inference-v2',
        webhookUrl: `${baseUrl}/fast/execute`,
        requiresContext: false,
        timeoutMs: 15000
      };
    case 'mock-sender':
      return {
        id: 'integration-email-service',
        webhookUrl: `${baseUrl}/integrations/email/send`,
        requiresContext: false,
        timeoutMs: 5000
      };
    default:
      // Default fallback router
      return {
        id: 'agent-router-default',
        webhookUrl: `${baseUrl}/router/execute`,
        requiresContext: true,
        timeoutMs: 30000
      };
  }
};
