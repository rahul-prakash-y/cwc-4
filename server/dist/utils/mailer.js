import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
let transporter = null;
function getTransporter() {
    if (transporter)
        return transporter;
    if (env.SMTP_USER && env.SMTP_PASS) {
        const port = Number(env.SMTP_PORT) || 587;
        // Auto-detect secure true for port 465 SSL, or explicit SMTP_SECURE setting
        const isSecure = port === 465 || Boolean(env.SMTP_SECURE);
        transporter = nodemailer.createTransport({
            host: env.SMTP_HOST || 'smtp.gmail.com',
            port,
            secure: isSecure,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
            pool: true, // Use TCP connection pooling for fast batch broadcasting
            maxConnections: 5,
            maxMessages: 100,
            connectionTimeout: 10000, // 10s connection timeout
            greetingTimeout: 10000, // 10s greeting timeout
            socketTimeout: 15000, // 15s socket timeout
            tls: {
                rejectUnauthorized: false, // Prevent self-signed cert issues on cloud hosts
            },
        });
    }
    else {
        console.warn('\x1b[33m[EMAIL SERVICE WARNING]\x1b[0m ⚠️ SMTP_USER or SMTP_PASS environment variables are missing! ' +
            'Emails will NOT be sent over internet (falling back to JSON simulation transport). ' +
            'Please configure SMTP_USER and SMTP_PASS in your hosting provider environment settings.');
        transporter = nodemailer.createTransport({
            jsonTransport: true,
        });
    }
    return transporter;
}
/**
 * Utility function to send a Carnival HTML Email
 */
export async function sendCarnivalEmail(to, subject, htmlBody) {
    return sendEmail({
        to,
        subject,
        html: htmlBody,
    });
}
/**
 * Sends a transactional email asynchronously
 */
export async function sendEmail(options) {
    try {
        const transport = getTransporter();
        const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        if (!recipients || recipients.trim().length === 0) {
            return false;
        }
        const mailOptions = {
            from: env.SMTP_FROM || env.SMTP_USER || 'CWC Season 4 <noreply@cwcseason4.com>',
            to: recipients,
            subject: options.subject,
            html: options.html,
            text: options.text || options.subject,
        };
        const info = await transport.sendMail(mailOptions);
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.log(`\x1b[36m[EMAIL SERVICE SIMULATION]\x1b[0m 📧 To: ${recipients} | Subject: "${options.subject}"`);
        }
        else {
            console.log(`\x1b[32m[EMAIL SENT]\x1b[0m 📧 MessageId: ${info.messageId} | Recipients: ${recipients}`);
        }
        return true;
    }
    catch (error) {
        console.error(`❌ [EMAIL SERVICE ERROR] Failed to send email to ${options.to}:`, error?.message || error);
        return false;
    }
}
/**
 * Broadcasts emails to a list of recipients asynchronously in chunked background batches
 */
export function sendBackgroundEmailBatch(options) {
    setImmediate(async () => {
        const totalRecipients = options.recipients.length;
        console.log(`🚀 [EMAIL BROADCAST STARTED] Queueing emails for ${totalRecipients} recipients...`);
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.warn(`⚠️ [EMAIL BROADCAST CANCELLED] Missing SMTP credentials! ` +
                `SMTP_USER or SMTP_PASS is empty on hosted environment. No live emails can be sent.`);
        }
        const validRecipients = options.recipients.filter((r) => r && typeof r === 'string' && r.includes('@'));
        const chunkSize = 5; // Send 5 emails concurrently per batch
        let successCount = 0;
        let failCount = 0;
        for (let i = 0; i < validRecipients.length; i += chunkSize) {
            const chunk = validRecipients.slice(i, i + chunkSize);
            const results = await Promise.allSettled(chunk.map((recipient) => sendEmail({
                to: recipient,
                subject: options.subject,
                html: options.html,
            })));
            results.forEach((res) => {
                if (res.status === 'fulfilled' && res.value === true) {
                    successCount++;
                }
                else {
                    failCount++;
                }
            });
        }
        console.log(`✅ [EMAIL BROADCAST COMPLETED] Batch finish: ${successCount} sent successfully, ${failCount} failed out of ${validRecipients.length} recipients.`);
    });
}
