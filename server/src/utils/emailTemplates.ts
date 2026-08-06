/**
 * HTML Email Templates with CWC Season 4 Carnival Branding 🎪
 */

const BASE_STYLING = `
  body {
    margin: 0;
    padding: 0;
    background-color: #0b0f19;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #e2e8f0;
  }
  .wrapper {
    width: 100%;
    background-color: #0b0f19;
    padding: 30px 10px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: #131b2e;
    border: 1px solid rgba(255, 0, 85, 0.3);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 0 25px rgba(255, 0, 85, 0.15);
  }
  .header {
    background: linear-gradient(135deg, #ff0055 0%, #7928ca 50%, #00f0ff 100%);
    padding: 30px 20px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    color: #ffffff;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  }
  .header p {
    margin: 6px 0 0 0;
    color: #ffd700;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .content {
    padding: 30px 25px;
  }
  .badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 15px;
  }
  .badge-gold {
    background-color: rgba(255, 215, 0, 0.15);
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.4);
  }
  .badge-cyan {
    background-color: rgba(0, 240, 255, 0.15);
    color: #00f0ff;
    border: 1px solid rgba(0, 240, 255, 0.4);
  }
  .badge-emerald {
    background-color: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }
  .badge-rose {
    background-color: rgba(244, 63, 94, 0.15);
    color: #f43f5e;
    border: 1px solid rgba(244, 63, 94, 0.4);
  }
  .ticket-box {
    background: #0f172a;
    border: 2px dashed #00f0ff;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
  }
  .passcode {
    font-family: 'Courier New', Courier, monospace;
    font-size: 24px;
    font-weight: bold;
    color: #ffd700;
    letter-spacing: 4px;
    margin: 10px 0;
    padding: 10px;
    background: rgba(255, 215, 0, 0.1);
    border-radius: 8px;
    display: inline-block;
  }
  .btn {
    display: inline-block;
    padding: 14px 28px;
    background: linear-gradient(90deg, #ff0055 0%, #ff5500 100%);
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 800;
    font-size: 14px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 20px;
    box-shadow: 0 4px 15px rgba(255, 0, 85, 0.4);
  }
  .footer {
    padding: 20px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 12px;
    color: #64748b;
  }
`;

/**
 * 1. Team Registration Confirmation & Passcodes Email
 */
export function getRegistrationEmailHtml(data: {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  passcode?: string;
  portalUrl?: string;
}) {
  const portalUrl = data.portalUrl || 'http://localhost:5173';
  const passcode = data.passcode || 'CWC4-LDR-PASS';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>${BASE_STYLING}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>🎪 CWC SEASON 4</h1>
          <p>Carnival Passcode & Application Ticket</p>
        </div>
        <div class="content">
          <div class="badge badge-gold">🎟️ Application Received</div>
          <h2 style="color: #ffffff; margin-top: 0;">Welcome to the Carnival Arena!</h2>
          <p>Ahoy Team Leader <strong>${data.leaderName}</strong>!</p>
          <p>Your team registration application for <strong style="color: #ff0055;">${data.teamName}</strong> has been successfully registered in the Code With Curious Season 4 system.</p>
          
          <div class="ticket-box">
            <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">YOUR CARNIVAL LEADER PASSCODE</div>
            <div class="passcode">${passcode}</div>
            <div style="color: #cbd5e1; font-size: 13px;">Registered Email: <strong>${data.leaderEmail}</strong></div>
          </div>

          <p style="font-size: 14px; color: #94a3b8;">
            Use your leader credentials to log in to the Student Portal, access daily task arenas, deploy power-up advantages, and keep your team off the elimination chopping block!
          </p>

          <div style="text-align: center;">
            <a href="${portalUrl}/login" class="btn">Enter Student Arena 🚀</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Code With Curious (CWC) Season 4. All rights reserved.</p>
          <p>Step right up. Code right now.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * 2. Daily Task Live Alerts Email
 */
export function getDailyTaskEmailHtml(data: {
  taskTitle: string;
  taskType: string;
  points: number;
  description?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  portalUrl?: string;
}) {
  const portalUrl = data.portalUrl || 'http://localhost:5173';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>${BASE_STYLING}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>🎯 DAILY TASK LIVE</h1>
          <p>CWC Season 4 Task Arena</p>
        </div>
        <div class="content">
          <div class="badge badge-cyan">⚡ Live Arena Challenge</div>
          <h2 style="color: #ffffff; margin-top: 0;">${data.taskTitle}</h2>
          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin: 15px 0;">
            <p style="margin: 5px 0; color: #cbd5e1;"><strong>Task Type:</strong> <span style="color: #00f0ff;">${data.taskType}</span></p>
            <p style="margin: 5px 0; color: #cbd5e1;"><strong>Bounty Points:</strong> <span style="color: #ffd700; font-weight: bold;">+${data.points} PTS</span></p>
            ${data.description ? `<p style="margin: 10px 0 5px 0; color: #94a3b8; font-size: 14px;">${data.description}</p>` : ''}
          </div>

          <p style="font-size: 14px; color: #94a3b8;">
            The ringmasters have unlocked this challenge. Log into your dashboard, assemble your teammates, and make your submission before the clock expires!
          </p>

          <div style="text-align: center;">
            <a href="${portalUrl}/dashboard" class="btn">Launch Task Arena ⚡</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Code With Curious (CWC) Season 4. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * 3. Immunity / Advantage Granted Notifications Email
 */
export function getAdvantageGrantedEmailHtml(data: {
  teamName: string;
  advantage: string;
  quantity?: number;
  immunity?: boolean;
  portalUrl?: string;
}) {
  const portalUrl = data.portalUrl || 'http://localhost:5173';
  const qty = data.quantity || 1;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>${BASE_STYLING}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>🎁 POWER-UP UNLOCKED</h1>
          <p>CWC Season 4 Advantage Vault</p>
        </div>
        <div class="content">
          <div class="badge badge-gold">🌟 Special Advantage Granted</div>
          <h2 style="color: #ffffff; margin-top: 0;">Congratulations Team ${data.teamName}!</h2>
          
          <p>The Carnival Ringmaster has awarded your team a powerful new advantage:</p>

          <div class="ticket-box" style="border-color: #ffd700;">
            <div style="font-size: 20px; font-weight: bold; color: #ffd700; text-transform: uppercase;">
              ✨ ${data.advantage} ${qty > 1 ? `(x${qty})` : ''}
            </div>
            ${data.immunity ? '<div style="margin-top: 10px; color: #10b981; font-weight: bold;">🛡️ IMMUNITY SHIELD ACTIVE</div>' : ''}
          </div>

          <p style="font-size: 14px; color: #94a3b8;">
            Head over to your <strong>Power-Up Vault</strong> inside the student dashboard to inspect or activate your granted advantages during task submissions.
          </p>

          <div style="text-align: center;">
            <a href="${portalUrl}/dashboard" class="btn">Open Power-Up Vault 🎁</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Code With Curious (CWC) Season 4. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * 4. Elimination / Qualification Status Alerts Email
 */
export function getStatusAlertEmailHtml(data: {
  teamName: string;
  status: 'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | 'Approved' | string;
  portalUrl?: string;
}) {
  const portalUrl = data.portalUrl || 'http://localhost:5173';

  let badgeClass = 'badge-cyan';
  let statusTitle = `Team Status Update: ${data.status}`;
  let statusMessage = `Your team's current status has been updated to ${data.status}.`;
  let headerBg = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';

  if (data.status === 'Qualified' || data.status === 'Safe' || data.status === 'Approved') {
    badgeClass = 'badge-emerald';
    statusTitle = `🎉 CONGRATULATIONS! STATUS: ${data.status.toUpperCase()}`;
    statusMessage = `Team ${data.teamName} has officially achieved ${data.status} status! You are advancing further in the carnival arena!`;
    headerBg = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
  } else if (data.status === 'Danger') {
    badgeClass = 'badge-gold';
    statusTitle = `⚠️ ALERT! STATUS: IN DANGER`;
    statusMessage = `Attention Team ${data.teamName}: Your team has been flagged as IN DANGER. Work closely on incoming tasks to avoid elimination!`;
    headerBg = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
  } else if (data.status === 'Eliminated') {
    badgeClass = 'badge-rose';
    statusTitle = `🚨 CARNIVAL EVICTION: ELIMINATED`;
    statusMessage = `Regrettably, Team ${data.teamName} has been ELIMINATED from the active competitive ladder of CWC Season 4. Thank you for your fierce spirit in the arena!`;
    headerBg = 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)';
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>${BASE_STYLING}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header" style="background: ${headerBg};">
          <h1>🎪 STATUS UPDATE</h1>
          <p>CWC Season 4 Survival Radar</p>
        </div>
        <div class="content">
          <div class="badge ${badgeClass}">${data.status}</div>
          <h2 style="color: #ffffff; margin-top: 0;">${statusTitle}</h2>
          
          <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
            ${statusMessage}
          </p>

          <div style="text-align: center;">
            <a href="${portalUrl}/dashboard" class="btn">View Live Telemetry 📊</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Code With Curious (CWC) Season 4. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * 5. Announcement Broadcast Alert Email (Task 3)
 */
export function getAnnouncementEmailHtml(data: {
  announcementMessage: string;
  author?: string;
  timestamp?: string | Date;
  portalUrl?: string;
}) {
  const portalUrl = data.portalUrl || 'http://localhost:5173';
  const author = data.author || 'Carnival Ringmaster 🎪';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>${BASE_STYLING}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>📢 CARNIVAL ANNOUNCEMENT</h1>
          <p>Official CWC Season 4 Broadcast</p>
        </div>
        <div class="content">
          <div class="badge badge-gold">📣 Live Ringmaster Dispatch</div>
          
          <div style="background: rgba(255, 0, 85, 0.08); border-left: 4px solid #ff0055; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.6; font-weight: 600;">
              "${data.announcementMessage}"
            </p>
            <p style="margin: 12px 0 0 0; color: #ffd700; font-size: 13px; font-weight: 700; text-transform: uppercase;">
              — ${author}
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${portalUrl}/dashboard" class="btn">Open Student Portal 🚀</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Code With Curious (CWC) Season 4. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}
