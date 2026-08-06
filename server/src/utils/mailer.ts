import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Fallback JSON transport for development / testing without live credentials
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

/**
 * Utility function to send a Carnival HTML Email
 */
export async function sendCarnivalEmail(
  to: string | string[],
  subject: string,
  htmlBody: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject,
    html: htmlBody,
  });
}

/**
 * Sends a transactional email asynchronously
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    if (!recipients || recipients.trim().length === 0) {
      return false;
    }

    const mailOptions = {
      from: env.SMTP_FROM,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    };

    const info = await transport.sendMail(mailOptions);

    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.log(`\x1b[36m[EMAIL SERVICE SIMULATION]\x1b[0m 📧 To: ${recipients} | Subject: "${options.subject}"`);
    } else {
      console.log(`\x1b[32m[EMAIL SENT]\x1b[0m 📧 MessageId: ${info.messageId} | Recipients: ${recipients}`);
    }

    return true;
  } catch (error) {
    console.error('❌ [EMAIL SERVICE ERROR] Failed to send email:', error);
    return false;
  }
}

/**
 * Broadcasts emails to a list of recipients asynchronously in background
 */
export function sendBackgroundEmailBatch(options: {
  recipients: string[];
  subject: string;
  html: string;
}) {
  setImmediate(async () => {
    console.log(`🚀 [EMAIL BROADCAST STARTED] Queueing emails for ${options.recipients.length} recipients...`);
    for (const recipient of options.recipients) {
      if (recipient && recipient.includes('@')) {
        await sendEmail({
          to: recipient,
          subject: options.subject,
          html: options.html,
        });
      }
    }
    console.log(`✅ [EMAIL BROADCAST COMPLETED] Finish sending batch emails.`);
  });
}
