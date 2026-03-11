import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // For development, we can use a fake SMTP service like Ethereal
    // For production, configure with real SMTP credentials
    const port = parseInt(process.env.SMTP_PORT || '587');
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port,
      secure: port === 465, // true for SSL (465), false for STARTTLS (587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certs on self-hosted servers
      },
    });

    // Log if SMTP credentials are not configured (except for default Ethereal)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn(
        'SMTP credentials not configured. Email sending may fail. Please set SMTP_USER and SMTP_PASS environment variables.',
      );
    }
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param text - Text to escape
   * @returns HTML-safe text
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  async sendOtpEmail(email: string, username: string, otp: string): Promise<void> {
    try {
      const safeUsername = this.escapeHtml(username);
      const digits = otp.split('').map(d =>
        `<span style="display:inline-block;width:44px;height:54px;line-height:54px;text-align:center;font-size:28px;font-weight:bold;background:#f9fafb;border:2px solid #e5e7eb;border-radius:10px;margin:0 4px;color:#111827;">${d}</span>`
      ).join('');

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EchoWork" <noreply@echowork.com>',
        to: email,
        subject: 'Votre code de confirmation EchoWork',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <div style="background:#dc2626;padding:32px 24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">EchoWork</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Confirmation de votre compte</p>
            </div>
            <div style="padding:32px 24px;">
              <p style="margin:0 0 8px;font-size:16px;color:#111827;">Bonjour <strong>${safeUsername}</strong>,</p>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
                Voici votre code de confirmation à 6 chiffres. Il est valable <strong>15 minutes</strong>.
              </p>
              <div style="text-align:center;margin:0 0 28px;">${digits}</div>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#b91c1c;">
                  ⚠️ Ne partagez jamais ce code. EchoWork ne vous demandera jamais ce code par téléphone ou chat.
                </p>
              </div>
              <p style="margin:0;font-size:12px;color:#9ca3af;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
            </div>
          </div>`,
        text: `Bonjour ${username},\n\nVotre code de confirmation EchoWork : ${otp}\n\nCe code expire dans 15 minutes. Ne le partagez pas.`,
      });
      this.logger.log(`OTP email sent to ${email}. ID: ${info.messageId}`);
      if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
        this.logger.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}: ${error instanceof Error ? error.message : error}`);
    }
  }

  async sendConfirmationEmail(email: string, username: string, token: string, frontendUrl: string): Promise<void> {
    try {
      const safeUsername = this.escapeHtml(username);
      const confirmUrl = `${frontendUrl}/confirm-email?token=${token}`;
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EchoWork" <noreply@echowork.com>',
        to: email,
        subject: 'Confirmez votre adresse email — EchoWork',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Confirmez votre email</h1>
            <p>Bonjour <strong>${safeUsername}</strong>,</p>
            <p>Merci de vous être inscrit sur EchoWork ! Pour activer votre compte et publier des avis, cliquez sur le bouton ci-dessous :</p>
            <p style="margin: 30px 0; text-align: center;">
              <a href="${confirmUrl}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Confirmer mon email
              </a>
            </p>
            <p style="color: #6b7280; font-size: 13px;">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez ce message.</p>
            <p style="color: #9ca3af; font-size: 12px;">Lien : ${confirmUrl}</p>
          </div>`,
        text: `Bonjour ${username},\n\nConfirmez votre email EchoWork : ${confirmUrl}\n\nCe lien expire dans 24 heures.`,
      });
      this.logger.log(`Confirmation email sent to ${email}. ID: ${info.messageId}`);
      if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
        this.logger.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to ${email}: ${error instanceof Error ? error.message : error}`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string, frontendUrl: string): Promise<void> {
    try {
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EchoWork" <noreply@echowork.com>',
        to: email,
        subject: 'Réinitialisation de votre mot de passe — EchoWork',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Réinitialiser votre mot de passe</h1>
            <p>Vous avez demandé la réinitialisation de votre mot de passe EchoWork.</p>
            <p style="margin: 30px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p style="color: #6b7280; font-size: 13px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez ce message.</p>
            <p style="color: #9ca3af; font-size: 12px;">Lien : ${resetUrl}</p>
          </div>`,
        text: `Réinitialisez votre mot de passe EchoWork : ${resetUrl}\n\nCe lien expire dans 1 heure.`,
      });
      this.logger.log(`Reset email sent to ${email}. ID: ${info.messageId}`);
      if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
        this.logger.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${email}: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Send welcome email to newly registered user
   * @param email - User's email address
   * @param username - User's username
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    try {
      const safeUsername = this.escapeHtml(username);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"EchoWork" <noreply@echowork.com>',
        to: email,
        subject: 'Bienvenue sur EchoWork!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Bienvenue sur EchoWork!</h1>
            <p>Bonjour <strong>${safeUsername}</strong>,</p>
            <p>Nous sommes ravis de vous accueillir sur EchoWork, votre plateforme d'avis sur les entreprises.</p>
            <p>Vous pouvez maintenant:</p>
            <ul>
              <li>Consulter les avis sur les entreprises</li>
              <li>Partager vos expériences et donner votre avis</li>
              <li>Voter sur les avis des autres utilisateurs</li>
              <li>Découvrir les offres d'emploi</li>
            </ul>
            <p>Merci de faire partie de notre communauté!</p>
            <p style="margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Commencer à explorer
              </a>
            </p>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              Cet email a été envoyé par EchoWork. Si vous n'avez pas créé de compte, veuillez ignorer ce message.
            </p>
          </div>
        `,
        text: `
Bienvenue sur EchoWork!

Bonjour ${username},

Nous sommes ravis de vous accueillir sur EchoWork, votre plateforme d'avis sur les entreprises.

Vous pouvez maintenant:
- Consulter les avis sur les entreprises
- Partager vos expériences et donner votre avis
- Voter sur les avis des autres utilisateurs
- Découvrir les offres d'emploi

Merci de faire partie de notre communauté!

Visitez: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

---
Cet email a été envoyé par EchoWork. Si vous n'avez pas créé de compte, veuillez ignorer ce message.
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}. Message ID: ${info.messageId}`);
      
      // For development with Ethereal, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      // We don't throw the error to avoid blocking user registration
      // Email sending failure should not prevent user from signing up
    }
  }
}
