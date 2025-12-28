// ===========================================
// AETHER - Email Service
// Send emails via Resend API (HTTPS)
// ===========================================

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export const emailService = {
  /**
   * Send an email via Resend API
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    if (!RESEND_API_KEY) {
      console.error('[EMAIL] Resend API key not configured');
      return { success: false, error: 'Email service not configured. Set RESEND_API_KEY in .env' };
    }

    const fromAddress = options.from || EMAIL_FROM;
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

    console.log(`[EMAIL] Sending via Resend - From: ${fromAddress}, To: ${toAddresses.join(', ')}`);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toAddresses,
          subject: options.subject,
          text: options.text,
          html: options.html,
          reply_to: options.replyTo,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        console.error('[EMAIL] Resend error:', data);
        return { success: false, error: data.message || data.error || 'Failed to send email' };
      }

      console.log(`[EMAIL] Sent successfully! ID: ${data.id}`);
      return { success: true, messageId: data.id };

    } catch (error: any) {
      console.error('[EMAIL] Exception:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send a simple text email
   */
  async sendText(to: string, subject: string, text: string): Promise<EmailResult> {
    return this.send({ to, subject, text });
  },

  /**
   * Send an HTML email
   */
  async sendHtml(to: string, subject: string, html: string): Promise<EmailResult> {
    return this.send({ to, subject, html, text: html.replace(/<[^>]*>/g, '') });
  },

  /**
   * Send a workflow notification email
   */
  async sendWorkflowNotification(
    to: string,
    workflowName: string,
    status: 'success' | 'failure' | 'warning',
    details: string
  ): Promise<EmailResult> {
    const statusEmoji = status === 'success' ? '✅' : status === 'failure' ? '❌' : '⚠️';
    const statusColor = status === 'success' ? '#22c55e' : status === 'failure' ? '#ef4444' : '#f59e0b';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #D90429, #8B0000); padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
          .details { background: #0a0a0a; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; white-space: pre-wrap; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ Aether Workflow</h1>
          </div>
          <div class="content">
            <h2>${statusEmoji} Workflow: ${workflowName}</h2>
            <div class="status" style="background: ${statusColor}20; color: ${statusColor};">
              Status: ${status.toUpperCase()}
            </div>
            <h3>Details:</h3>
            <div class="details">${details}</div>
          </div>
          <div class="footer">
            Sent by Aether Workflow Automation<br>
            ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to,
      subject: `${statusEmoji} Workflow "${workflowName}" - ${status.toUpperCase()}`,
      html,
    });
  },

  /**
   * Test email configuration
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!RESEND_API_KEY) {
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }
    
    // Resend doesn't have a verify endpoint, so we just check if key exists
    return { success: true };
  },
};

export default emailService;
