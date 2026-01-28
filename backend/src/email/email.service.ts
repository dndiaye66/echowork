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
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
