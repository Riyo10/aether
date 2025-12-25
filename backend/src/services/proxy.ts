
import axios from 'axios';
import { config } from '../config/env';
import { getAgentDefinition } from './agentRegistry';
import { AuthenticatedRequest } from '../middleware/security';

interface ExecuteOptions {
  model: string;
  prompt: string;
  systemInstruction?: string;
  context?: any;
}

export const executeAgentWorkflow = async (req: AuthenticatedRequest, payload: ExecuteOptions) => {
  const { model, prompt, systemInstruction } = payload;
  const agentDef = getAgentDefinition(model);
  const userId = req.user?.id || 'anonymous';
  const orgId = req.user?.orgId || 'public';

  // Construct secure payload for internal agent
  const internalPayload = {
    input: {
      prompt,
      system_instruction: systemInstruction,
    },
    metadata: {
      user_id: userId,
      org_id: orgId,
      trace_id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      origin: 'aether-ui-gateway'
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-Aether-Internal-Secret': config.INTERNAL_AGENT_SECRET, // Secret handshake
    'X-User-ID': userId,
    'X-Org-ID': orgId
  };

  // Retry Logic (Simple exponential backoff simulation)
  let attempts = 0;
  const maxRetries = 2;

  while (attempts <= maxRetries) {
    try {
      console.log(`[Proxy] Forwarding request to ${agentDef.webhookUrl} (Attempt ${attempts + 1})`);
      
      // In a real environment, this axios call hits the internal webhook.
      // For this output, we'll verify the logic structure.
      // const response = await axios.post(agentDef.webhookUrl, internalPayload, { 
      //   headers, 
      //   timeout: agentDef.timeoutMs 
      // });
      // return response.data;

      // --- MOCK RESPONSE FOR DEMO PURPOSE ---
      // Since we don't have the actual internal cluster running, we simulate the webhook response here
      // so the gateway "works" if run in isolation.
      await new Promise(r => setTimeout(r, 500)); // Network latency simulation
      return {
        result: `[Secure Gateway Output]\nProcessed by ${agentDef.id} for user ${userId}.\n\nBased on your input: "${prompt.slice(0, 30)}..."\n\nI have securely executed the task using internal resources.`,
        usage: { tokens: 150, cost: 0.002 },
        status: 'success'
      };
      // --------------------------------------

    } catch (error: any) {
      attempts++;
      console.error(`[Proxy] Error calling agent: ${error.message}`);
      
      if (attempts > maxRetries) {
        throw new Error(`Agent execution failed after ${maxRetries} retries: ${error.message}`);
      }
      
      // Wait before retry (exponentialish)
      await new Promise(r => setTimeout(r, 500 * attempts));
    }
  }
};
