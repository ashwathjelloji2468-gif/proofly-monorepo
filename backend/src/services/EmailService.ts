import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private resendApiKey: string | null = null;
  private brevoApiKey: string | null = null;

  constructor() {
    const provider = process.env.EMAIL_PROVIDER;
    const apiSecret = process.env.RESEND_API_KEY;
    const brevoKey = process.env.BREVO_API_KEY;
    const smtpHost = process.env.SMTP_HOST;

    const isBrevoSecret = apiSecret && apiSecret.startsWith('xkeysib-');
    const isResendSecret = apiSecret && apiSecret.startsWith('re_');

    if (provider === 'brevo' || brevoKey || isBrevoSecret) {
      this.brevoApiKey = brevoKey || apiSecret || null;
      console.log('✉️ Email service initialized with Brevo REST API.');
    } else if (apiSecret && (isResendSecret || !provider)) {
      this.resendApiKey = apiSecret;
      console.log('✉️ Email service initialized with Resend HTTPS REST API.');
    } else if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('✉️ Email service initialized with SMTP transport.');
    } else {
      console.warn('⚠️ No email provider configured (missing RESEND_API_KEY, BREVO_API_KEY, or SMTP_HOST). Emails will be logged to the console only.');
    }
  }

  private async sendHtmlEmail(to: string, subject: string, html: string) {
    const fromAddress = process.env.EMAIL_FROM || 'Proofly <onboarding@resend.dev>';
    
    if (this.brevoApiKey) {
      try {
        console.log(`✉️ Sending email via Brevo REST API to ${to}...`);
        
        let senderName = 'Proofly';
        let senderEmail = 'onboarding@resend.dev';
        
        const match = fromAddress.match(/^(.*?)\s*<(.*?)>$/);
        if (match) {
          senderName = match[1].trim();
          senderEmail = match[2].trim();
        } else if (fromAddress.includes('@')) {
          senderEmail = fromAddress.trim();
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': this.brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Brevo API returned status ${response.status}: ${errText}`);
        }

        const data = await response.json() as { messageId: string };
        console.log(`✉️ Email successfully sent via Brevo REST API to ${to}: "${subject}" (ID: ${data.messageId})`);
      } catch (err) {
        console.error(`❌ Failed to send email via Brevo REST API to ${to}:`, err);
        console.log('==================================================');
        console.log(`✉️ [FALLBACK CONSOLE LOG] TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log('--- BODY ---');
        console.log(html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim());
        console.log('==================================================');
        throw err;
      }
    } else if (this.resendApiKey) {
      try {
        console.log(`✉️ Sending email via Resend REST API to ${to}...`);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject,
            html,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Resend API returned status ${response.status}: ${errText}`);
        }

        const data = await response.json() as { id: string };
        console.log(`✉️ Email successfully sent via Resend REST API to ${to}: "${subject}" (ID: ${data.id})`);
      } catch (err) {
        console.error(`❌ Failed to send email via Resend REST API to ${to}:`, err);
        console.log('==================================================');
        console.log(`✉️ [FALLBACK CONSOLE LOG] TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log('--- BODY ---');
        console.log(html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim());
        console.log('==================================================');
        throw err;
      }
    } else if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });
        console.log(`✉️ Email successfully sent via SMTP to ${to}: "${subject}"`);
      } catch (err) {
        console.error(`❌ Failed to send email via SMTP to ${to}:`, err);
        console.log('==================================================');
        console.log(`✉️ [FALLBACK CONSOLE LOG] TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log('--- BODY ---');
        console.log(html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim());
        console.log('==================================================');
        throw err;
      }
    } else {
      console.log('==================================================');
      console.log(`✉️ LOGGED EMAIL TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log('--- BODY ---');
      // Strip some basic style blocks to keep console readable while logging
      console.log(html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim());
      console.log('==================================================');
    }
  }

  private getBaseTemplate(title: string, bodyContent: string, actionButton?: { text: string; url: string }) {
    const buttonHtml = actionButton 
      ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionButton.url}" target="_blank" style="background-color: #4338CA; color: #FFFFFF; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(67, 56, 202, 0.35); border: 1px solid #6366F1;">
            ${actionButton.text}
          </a>
        </div>
      ` 
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              background-color: #0A0B14;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 580px;
              margin: 40px auto;
              background-color: #1F2937;
              border: 1px solid #2E3445;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            }
            .logo-container {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo-text {
              font-size: 22px;
              font-weight: 900;
              color: #FFFFFF;
              letter-spacing: -0.5px;
            }
            .content {
              color: #CBD5E1;
              font-size: 14px;
              line-height: 1.6;
            }
            h1 {
              color: #F8FAFC;
              font-size: 20px;
              font-weight: bold;
              margin-top: 0;
              margin-bottom: 16px;
            }
            p {
              margin-top: 0;
              margin-bottom: 16px;
            }
            .otp-box {
              background-color: #151A24;
              border: 1px solid #2E3445;
              padding: 16px;
              border-radius: 10px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 6px;
              color: #6366F1;
              margin: 24px 0;
            }
            .footer {
              margin-top: 40px;
              border-t: 1px solid #2E3445;
              padding-top: 20px;
              text-align: center;
              font-size: 11px;
              color: #94A3B8;
              line-height: 1.5;
            }
            .signature {
              margin-top: 24px;
              font-size: 13px;
              color: #CBD5E1;
            }
            .signature-title {
              font-size: 11px;
              color: #94A3B8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-container">
              <span class="logo-text"><span style="color: #6366F1;">✦</span> Proofly</span>
            </div>
            <div class="content">
              ${bodyContent}
              ${buttonHtml}
              <div class="signature">
                Best regards,<br>
                <strong>J. Ashwath</strong>
                <div class="signature-title">Founder, Proofly</div>
              </div>
            </div>
            <div class="footer">
              This email was sent by Proofly Inc.<br>
              If you did not request this communication, please contact <a href="mailto:support@useproofly.app" style="color: #6366F1; text-decoration: none;">support@useproofly.app</a>.<br>
              © ${new Date().getFullYear()} Proofly. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendVerificationEmail(email: string, name: string, token: string, clientUrl: string) {
    const verifyUrl = `${clientUrl}/auth/verify-email?token=${token}`;
    const title = 'Verify your Proofly account';
    const bodyContent = `
      <h1>Verify your email address</h1>
      <p>Hello ${name},</p>
      <p>Thank you for signing up for Proofly! To verify your account and access your client testimonials dashboard, click the button below within the next 24 hours.</p>
    `;
    const html = this.getBaseTemplate(title, bodyContent, { text: 'Verify Account', url: verifyUrl });
    await this.sendHtmlEmail(email, title, html);
  }

  async sendWelcomeEmail(email: string, name: string) {
    const title = 'Welcome to Proofly! 🚀';
    const bodyContent = `
      <h1>Your social proof engine is ready!</h1>
      <p>Hello ${name},</p>
      <p>Welcome to Proofly! Your email verification succeeded and your workspace is ready. You are now equipped to capture rich video feedback, build responsive custom widgets, and embed customer trust showcases into your landing pages.</p>
      <p>To help you get started, we recommend creating your first Space and sharing the collection link with your early adopters.</p>
    `;
    const html = this.getBaseTemplate(title, bodyContent);
    await this.sendHtmlEmail(email, title, html);
  }

  async sendPasswordResetOTPEmail(email: string, name: string, otp: string) {
    const title = 'Proofly — Password Reset Code';
    const bodyContent = `
      <h1>Reset your password</h1>
      <p>Hello ${name},</p>
      <p>We received a request to reset the password for your Proofly account. Use the 6-digit verification code below to authorize the update.</p>
      <div class="otp-box">${otp}</div>
      <p>This verification code is valid for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
    `;
    const html = this.getBaseTemplate(title, bodyContent);
    await this.sendHtmlEmail(email, title, html);
  }

  async sendPasswordChangedEmail(email: string, name: string) {
    const title = 'Proofly — Password Changed Successfully';
    const bodyContent = `
      <h1>Security Alert: Password Updated</h1>
      <p>Hello ${name},</p>
      <p>This is to confirm that the password for your Proofly account was changed successfully.</p>
      <p>If you did not request this update, please contact our support team immediately at <a href="mailto:support@useproofly.app" style="color: #6366F1;">support@useproofly.app</a> to secure your account.</p>
    `;
    const html = this.getBaseTemplate(title, bodyContent);
    await this.sendHtmlEmail(email, title, html);
  }

  async sendWorkspaceInvitationEmail(email: string, spaceName: string, role: string, inviterName: string, token: string, clientUrl: string) {
    const inviteUrl = `${clientUrl}/auth/accept-invite?token=${token}`;
    const title = `Proofly — You have been invited to join ${spaceName}`;
    const bodyContent = `
      <h1>Teammate Invitation</h1>
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> has invited you to join the <strong>${spaceName}</strong> space on Proofly as a <strong>${role}</strong>.</p>
      <p>Click the button below to review and accept the invitation. If you do not have a Proofly account yet, you will be guided to create one.</p>
    `;
    const html = this.getBaseTemplate(title, bodyContent, { text: 'Accept Invitation', url: inviteUrl });
    await this.sendHtmlEmail(email, title, html);
  }

  async sendEmailChangeVerificationEmail(email: string, name: string, token: string, isNewAddress: boolean, clientUrl: string) {
    const verifyUrl = `${clientUrl}/auth/verify-email-change?token=${token}`;
    const title = 'Proofly — Verify Email Address Change';
    const bodyContent = isNewAddress 
      ? `
        <h1>Verify new email address</h1>
        <p>Hello ${name},</p>
        <p>You requested to change your Proofly login email to this address. Click the button below to confirm this address change.</p>
      `
      : `
        <h1>Confirm email change</h1>
        <p>Hello ${name},</p>
        <p>You requested to update your Proofly login email. To finalize this change, click the confirmation link sent to this mailbox to authorize the release.</p>
      `;
    const html = this.getBaseTemplate(title, bodyContent, { text: 'Confirm Email Change', url: verifyUrl });
    await this.sendHtmlEmail(email, title, html);
  }

  async sendOTPVerificationEmail(email: string, otp: string) {
    const title = 'Your Proofly verification code';
    const bodyContent = `
      <h1>Verify your Proofly login</h1>
      <p>Hello,</p>
      <p>We received a request to access your Proofly account. Use the 6-digit verification code below to authorize the sign-in.</p>
      <div class="otp-box">${otp}</div>
      <p>This verification code is valid for <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
    `;
    const html = this.getBaseTemplate(title, bodyContent);
    await this.sendHtmlEmail(email, title, html);
  }
}
