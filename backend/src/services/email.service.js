import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendWaterRequestApprovalEmail = async (email, userName, propertyName, waterId, slot, extraWaterRequested, hostName = null, hostUserId = null, guestList = []) => {
  const transporter = createTransporter();
  const slotText = slot === 8 ? "8:00 AM" : slot === 12 ? "12:00 PM" : "3:00 PM";
  const isGuest = !!hostName;

  const subject = "Water Request Approved - HydraOne";
  const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
    </style>
</head>
<body style="margin: 0; padding: 0; background: #0a0a0a; font-family: 'Inter', Arial, sans-serif; min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="width: 100%; background: #0f0f0f; position: relative; overflow: hidden; border-radius: 24px; border: 1px solid rgba(34, 197, 94, 0.2); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #22C55E, #10B981, #059669);"></div>
            <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #22C55E, #10B981, #059669);"></div>
            <div style="margin: 0 20px; padding: 40px 30px; position: relative;">
                <div style="text-align: center; margin-bottom: 36px;">
                    <div style="background: linear-gradient(135deg, #22C55E, #10B981); padding: 12px 32px; border-radius: 50px; display: inline-block; margin-bottom: 24px;">
                        <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 1px;">HydraOne</h1>
                    </div>
                </div>
                <div style="text-align: center; margin-bottom: 36px;">
                    <div style="background: #22C55E20; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2 style="color: #22C55E; font-size: 32px; margin: 0 0 12px 0; font-weight: 700;">Request Approved</h2>
                    <p style="color: #9CA3AF; font-size: 16px; margin: 0;">Your water registration has been approved by the administrator.</p>
                </div>
                <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.08)); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 22px; margin: 36px 0;">
                    <p style="color: #22C55E; font-size: 16px; font-weight: 600; margin-bottom: 15px;">Registration Details</p>
                    <div style="margin-bottom: 12px;">
                        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Property Name</p>
                        <p style="color: #D1D5DB; font-size: 14px; font-weight: 500;">${propertyName}</p>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Water ID</p>
                        <p style="color: #D1D5DB; font-size: 14px; font-family: monospace;">${waterId}</p>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Allocated Slot</p>
                        <p style="color: #22C55E; font-size: 14px; font-weight: 600;">${slotText}</p>
                    </div>
                    ${extraWaterRequested ? `
                    <div style="margin-bottom: 12px;">
                        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Extra Water</p>
                        <p style="color: #F59E0B; font-size: 14px; font-weight: 600;">Requested and Approved</p>
                    </div>
                    ` : ''}
                    ${isGuest ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(34, 197, 94, 0.15);">
                        <p style="color: #22C55E; font-size: 13px; font-weight: 600; margin-bottom: 10px;">Host Details</p>
                        <div style="margin-bottom: 8px;">
                            <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Host Name</p>
                            <p style="color: #D1D5DB; font-size: 14px; font-weight: 500;">${hostName}</p>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Host User ID</p>
                            <p style="color: #D1D5DB; font-size: 13px; font-family: monospace;">${hostUserId}</p>
                        </div>
                    </div>
                    ` : guestList.length > 0 ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(34, 197, 94, 0.15);">
                        <p style="color: #22C55E; font-size: 13px; font-weight: 600; margin-bottom: 10px;">Invited Guests</p>
                        ${guestList.map(g => `
                        <div style="margin-bottom: 10px; padding: 8px 12px; background: rgba(34, 197, 94, 0.05); border-radius: 8px;">
                            <p style="color: #D1D5DB; font-size: 13px; font-weight: 500; margin-bottom: 2px;">${g.userName}</p>
                            <p style="color: #6B7280; font-size: 12px; font-family: monospace;">${g.userId}</p>
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                <div style="text-align: center; margin-top: 40px; padding-top: 28px; border-top: 1px solid #1f2937;">
                    <p style="color: #6B7280; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} HydraOne. All rights reserved.</p>
                    <p style="color: #6B7280; font-size: 12px; margin: 10px 0 0 0;">Water will be allocated as per your registered slot.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"HydraOne" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

export const sendWaterRequestRejectionEmail = async (email, userName, propertyName, waterId, hostName = null, hostUserId = null, guestList = []) => {
  const transporter = createTransporter();
  const isGuest = !!hostName;

  const subject = "Water Request Update - HydraOne";
  const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
    </style>
</head>
<body style="margin: 0; padding: 0; background: #0a0a0a; font-family: 'Inter', Arial, sans-serif; min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="width: 100%; background: #0f0f0f; position: relative; overflow: hidden; border-radius: 24px; border: 1px solid rgba(239, 68, 68, 0.2); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #EF4444, #DC2626, #B91C1C);"></div>
            <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #EF4444, #DC2626, #B91C1C);"></div>
            <div style="margin: 0 20px; padding: 40px 30px; position: relative;">
                <div style="text-align: center; margin-bottom: 36px;">
                    <div style="background: linear-gradient(135deg, #EF4444, #DC2626); padding: 12px 32px; border-radius: 50px; display: inline-block; margin-bottom: 24px;">
                        <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 1px;">HydraOne</h1>
                    </div>
                </div>
                <div style="text-align: center; margin-bottom: 36px;">
                    <div style="background: #EF444420; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h2 style="color: #EF4444; font-size: 32px; margin: 0 0 12px 0; font-weight: 700;">Request Not Approved</h2>
                    <p style="color: #9CA3AF; font-size: 16px; margin: 0;">Your water registration request could not be processed.</p>
                </div>
                <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.08)); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; padding: 22px; margin: 36px 0;">
                    <p style="color: #EF4444; font-size: 16px; font-weight: 600; margin-bottom: 15px;">Registration Details</p>
                    <div style="margin-bottom: 12px;">
                        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Property Name</p>
                        <p style="color: #D1D5DB; font-size: 14px; font-weight: 500;">${propertyName}</p>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Water ID</p>
                        <p style="color: #D1D5DB; font-size: 14px; font-family: monospace;">${waterId}</p>
                    </div>
                    ${isGuest ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(239, 68, 68, 0.15);">
                        <p style="color: #EF4444; font-size: 13px; font-weight: 600; margin-bottom: 10px;">Host Details</p>
                        <div style="margin-bottom: 8px;">
                            <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Host Name</p>
                            <p style="color: #D1D5DB; font-size: 14px; font-weight: 500;">${hostName}</p>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Host User ID</p>
                            <p style="color: #D1D5DB; font-size: 13px; font-family: monospace;">${hostUserId}</p>
                        </div>
                    </div>
                    ` : guestList.length > 0 ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(239, 68, 68, 0.15);">
                        <p style="color: #EF4444; font-size: 13px; font-weight: 600; margin-bottom: 10px;">Invited Guests</p>
                        ${guestList.map(g => `
                        <div style="margin-bottom: 10px; padding: 8px 12px; background: rgba(239, 68, 68, 0.05); border-radius: 8px;">
                            <p style="color: #D1D5DB; font-size: 13px; font-weight: 500; margin-bottom: 2px;">${g.userName}</p>
                            <p style="color: #6B7280; font-size: 12px; font-family: monospace;">${g.userId}</p>
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                <div style="text-align: center; margin-top: 40px; padding-top: 28px; border-top: 1px solid #1f2937;">
                    <p style="color: #6B7280; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} HydraOne. All rights reserved.</p>
                    <p style="color: #6B7280; font-size: 12px; margin: 10px 0 0 0;">You can submit a new request for the next available slot.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"HydraOne" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

export const sendWaterRequestStatusUpdateToHost = async (hostEmail, hostName, hostUserId, guestList, propertyName, status) => {
  const transporter = createTransporter();
  const isApproved = status === 'approved';
  const subject = isApproved
    ? `Guest Water Request Approved - HydraOne`
    : `Guest Water Request Update - HydraOne`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
    </style>
</head>
<body style="margin: 0; padding: 0; background: #0a0a0a; font-family: 'Inter', Arial, sans-serif; min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="width: 100%; background: #0f0f0f; position: relative; overflow: hidden; border-radius: 24px; border: 1px solid rgba(${isApproved ? '34, 197, 94' : '239, 68, 68'}, 0.2); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, ${isApproved ? '#22C55E, #10B981, #059669' : '#EF4444, #DC2626, #B91C1C'});"></div>
            <div style="margin: 0 20px; padding: 40px 30px; position: relative;">
                <div style="text-align: center; margin-bottom: 36px;">
                    <div style="background: linear-gradient(135deg, ${isApproved ? '#22C55E, #10B981' : '#EF4444, #DC2626'}); padding: 12px 32px; border-radius: 50px; display: inline-block; margin-bottom: 24px;">
                        <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 1px;">HydraOne</h1>
                    </div>
                </div>
                <div style="text-align: center; margin-bottom: 36px;">
                    <div style="background: ${isApproved ? '#22C55E20' : '#EF444420'}; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        ${isApproved ? `
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        ` : `
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        `}
                    </div>
                    <h2 style="color: ${isApproved ? '#22C55E' : '#EF4444'}; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">
                        ${isApproved ? 'Guest Request Approved' : 'Guest Request Not Approved'}
                    </h2>
                    <p style="color: #9CA3AF; font-size: 16px; margin: 0;">
                        ${isApproved
                          ? `Water registration for your invited guest(s) has been approved.`
                          : `Water registration for your invited guest(s) could not be processed.`}
                    </p>
                </div>
                <div style="background: linear-gradient(135deg, rgba(${isApproved ? '34, 197, 94' : '239, 68, 68'}, 0.08), rgba(${isApproved ? '16, 185, 129' : '220, 38, 38'}, 0.08)); border: 1px solid rgba(${isApproved ? '34, 197, 94' : '239, 68, 68'}, 0.2); border-radius: 16px; padding: 22px; margin: 36px 0;">
                    <p style="color: ${isApproved ? '#22C55E' : '#EF4444'}; font-size: 16px; font-weight: 600; margin-bottom: 15px;">Request Summary</p>
                    <div style="margin-bottom: 12px;">
                        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 4px;">Property Name</p>
                        <p style="color: #D1D5DB; font-size: 14px; font-weight: 500;">${propertyName}</p>
                    </div>
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(${isApproved ? '34, 197, 94' : '239, 68, 68'}, 0.15);">
                        <p style="color: ${isApproved ? '#22C55E' : '#EF4444'}; font-size: 13px; font-weight: 600; margin-bottom: 10px;">Invited Guests</p>
                        ${guestList.map(g => `
                        <div style="margin-bottom: 10px; padding: 8px 12px; background: rgba(${isApproved ? '34, 197, 94' : '239, 68, 68'}, 0.05); border-radius: 8px;">
                            <p style="color: #D1D5DB; font-size: 13px; font-weight: 500; margin-bottom: 2px;">${g.userName}</p>
                            <p style="color: #6B7280; font-size: 12px; font-family: monospace;">${g.userId}</p>
                        </div>
                        `).join('')}
                    </div>
                </div>
                <div style="text-align: center; margin-top: 40px; padding-top: 28px; border-top: 1px solid #1f2937;">
                    <p style="color: #6B7280; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} HydraOne. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"HydraOne" <${process.env.EMAIL_USER}>`,
    to: hostEmail,
    subject,
    html,
  });
};