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

    // Log if using external SMTP without credentials
    const isLocalSmtp = !process.env.SMTP_HOST || process.env.SMTP_HOST === '127.0.0.1' || process.env.SMTP_HOST === 'localhost';
    if (!isLocalSmtp && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
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

      // Each digit rendered as a styled box
      const digits = otp.split('').map(d =>
        `<td style="padding:0 5px;">` +
        `<div style="width:52px;height:64px;line-height:64px;text-align:center;` +
        `font-size:32px;font-weight:800;font-family:'Helvetica Neue',Arial,sans-serif;` +
        `background:#fff7f7;border:2px solid #dc2626;border-radius:12px;color:#dc2626;` +
        `letter-spacing:0;box-shadow:0 2px 8px rgba(220,38,38,0.12);">${d}</div>` +
        `</td>`
      ).join('');

      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Code de confirmation EchoWork</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- LOGO HEADER -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#dc2626;border-radius:14px;padding:10px 20px;">
                    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;font-family:'Helvetica Neue',Arial,sans-serif;">Echo<span style="color:rgba(255,255,255,0.75);">Work</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- RED BANNER -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:36px 48px 40px;text-align:center;position:relative;">
                    <!-- Icon circle -->
                    <div style="display:inline-block;width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;border:2px solid rgba(255,255,255,0.35);text-align:center;line-height:64px;margin-bottom:16px;">
                      <span style="font-size:28px;">✉️</span>
                    </div>
                    <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;margin:0 0 6px;">Confirmez votre compte</div>
                    <div style="color:rgba(255,255,255,0.8);font-size:14px;">Entrez ce code sur EchoWork pour activer votre accès</div>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:40px 48px 32px;">
                    <p style="margin:0 0 6px;font-size:16px;color:#111827;font-weight:600;">Bonjour ${safeUsername} 👋</p>
                    <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.7;">
                      Merci de rejoindre <strong style="color:#111827;">EchoWork</strong> — la plateforme d'avis sur les entreprises au Sénégal.<br>
                      Utilisez le code ci-dessous pour confirmer votre adresse email.
                    </p>

                    <!-- OTP DIGITS -->
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                      <tr>${digits}</tr>
                    </table>
                    <p style="text-align:center;margin:0 0 32px;font-size:12px;color:#9ca3af;">
                      Ce code expire dans <strong style="color:#374151;">15 minutes</strong>
                    </p>

                    <!-- DIVIDER -->
                    <div style="border-top:1px solid #f3f4f6;margin-bottom:24px;"></div>

                    <!-- STEPS -->
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Comment confirmer ?</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top" style="padding-top:1px;">
                          <div style="width:22px;height:22px;background:#fef2f2;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:800;color:#dc2626;">1</div>
                        </td>
                        <td style="font-size:13px;color:#6b7280;padding-bottom:10px;">Retournez sur la page de vérification EchoWork</td>
                      </tr>
                      <tr>
                        <td width="28" valign="top" style="padding-top:1px;">
                          <div style="width:22px;height:22px;background:#fef2f2;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:800;color:#dc2626;">2</div>
                        </td>
                        <td style="font-size:13px;color:#6b7280;padding-bottom:10px;">Saisissez les 6 chiffres dans les cases prévues</td>
                      </tr>
                      <tr>
                        <td width="28" valign="top" style="padding-top:1px;">
                          <div style="width:22px;height:22px;background:#fef2f2;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:800;color:#dc2626;">3</div>
                        </td>
                        <td style="font-size:13px;color:#6b7280;">Votre compte sera immédiatement activé ✅</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- WARNING BOX -->
                <tr>
                  <td style="padding:0 48px 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="24" valign="top" style="padding-right:10px;font-size:16px;">🔒</td>
                              <td style="font-size:12px;color:#b91c1c;line-height:1.6;">
                                <strong>Ne partagez jamais ce code.</strong> EchoWork ne vous demandera jamais ce code par téléphone, SMS ou chat. Si vous n'avez pas créé de compte, ignorez cet email.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- SPAM NOTE -->
          <tr>
            <td style="padding:16px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:10px 16px;display:inline-block;">
                📬 Si vous ne trouvez pas cet email, vérifiez votre dossier <strong style="color:#6b7280;">Spams</strong> ou <strong style="color:#6b7280;">Courrier indésirable</strong>.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 0 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                Cet email vous a été envoyé par <strong style="color:#6b7280;">EchoWork</strong>
              </p>
              <p style="margin:0;font-size:11px;color:#d1d5db;">
                &copy; ${new Date().getFullYear()} EchoWork · Dakar, Sénégal · <a href="https://echowork.net" style="color:#d1d5db;">echowork.net</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EchoWork" <no-reply@echowork.net>',
        replyTo: process.env.EMAIL_REPLY_TO || 'contact@echowork.net',
        to: email,
        subject: `Confirmation de votre compte EchoWork`,
        html,
        text: `Bonjour ${username},\n\nVotre code de confirmation EchoWork : ${otp}\n\nCe code expire dans 15 minutes. Ne le partagez jamais.\n\nSi vous ne trouvez pas cet email, vérifiez votre dossier Spams / Courrier indésirable.\n\n© ${new Date().getFullYear()} EchoWork · echowork.net`,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
        },
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
  async sendReviewAlert(opts: {
    email: string;
    ownerUsername: string;
    companyName: string;
    companySlug: string;
    rating: number;
    comment: string;
    reviewerUsername: string;
  }): Promise<void> {
    try {
      const isNegative = opts.rating <= 2;
      const stars = '⭐'.repeat(opts.rating) + '☆'.repeat(5 - opts.rating);
      const dashboardUrl = `${process.env.FRONTEND_URL || 'https://echowork.net'}/espace-entreprise/tableau-de-bord/avis`;
      const companyUrl = `${process.env.FRONTEND_URL || 'https://echowork.net'}/companies/${opts.companySlug}`;
      const safeCompany = this.escapeHtml(opts.companyName);
      const safeComment = this.escapeHtml(opts.comment?.slice(0, 200) || '');
      const safeOwner = this.escapeHtml(opts.ownerUsername);
      const safeReviewer = this.escapeHtml(opts.reviewerUsername);

      const accentColor = isNegative ? '#dc2626' : '#16a34a';
      const headerBg = isNegative
        ? 'linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)'
        : 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)';
      const icon = isNegative ? '⚠️' : '🌟';
      const subject = isNegative
        ? `⚠️ Avis négatif reçu — ${opts.companyName}`
        : `⭐ Nouvel avis sur ${opts.companyName}`;
      const headline = isNegative ? 'Avis négatif reçu' : 'Nouvel avis reçu';
      const subline = isNegative
        ? 'Un client a laissé un avis défavorable. Répondez rapidement.'
        : 'Un nouveau client a partagé son expérience.';

      const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding-bottom:20px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background:#dc2626;border-radius:12px;padding:8px 18px;">
            <span style="color:#fff;font-size:20px;font-weight:900;font-family:'Helvetica Neue',Arial,sans-serif;">Echo<span style="color:rgba(255,255,255,0.7);">Work</span></span>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:${headerBg};padding:32px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:12px;">${icon}</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">${headline}</div>
            <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:6px;">${subline}</div>
          </td></tr>
          <tr><td style="padding:32px 40px;">
            <p style="margin:0 0 4px;font-size:15px;color:#111827;font-weight:600;">Bonjour ${safeOwner},</p>
            <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">Un avis vient d'être publié sur la fiche <strong style="color:#111827;">${safeCompany}</strong>.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <div style="font-size:20px;margin-bottom:8px;">${stars}</div>
                <div style="font-size:13px;color:#374151;line-height:1.6;">"${safeComment}${opts.comment?.length > 200 ? '…' : ''}"</div>
                <div style="margin-top:10px;font-size:12px;color:#9ca3af;">— ${safeReviewer}</div>
              </td></tr>
            </table>

            ${isNegative ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:14px 18px;font-size:13px;color:#b91c1c;line-height:1.6;">
                💡 <strong>Conseil :</strong> Répondez sous 24h. Une réponse rapide et professionnelle rassure les autres visiteurs et montre votre engagement.
              </td></tr>
            </table>` : ''}

            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:${accentColor};border-radius:10px;padding:12px 28px;">
                <a href="${dashboardUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Voir et répondre à l'avis →</a>
              </td>
              <td width="12"></td>
              <td style="border:1px solid #e5e7eb;border-radius:10px;padding:12px 20px;">
                <a href="${companyUrl}" style="color:#374151;font-size:13px;font-weight:500;text-decoration:none;">Voir la fiche</a>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0 40px 28px;">
            <div style="border-top:1px solid #f3f4f6;padding-top:20px;font-size:11px;color:#9ca3af;">
              © ${new Date().getFullYear()} EchoWork · Dakar, Sénégal · <a href="${process.env.FRONTEND_URL || 'https://echowork.net'}" style="color:#9ca3af;">echowork.net</a>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EchoWork" <no-reply@echowork.net>',
        to: opts.email,
        subject,
        html,
        text: `Bonjour ${opts.ownerUsername},\n\nNouvel avis (${opts.rating}/5) sur ${opts.companyName} par ${opts.reviewerUsername} :\n"${opts.comment}"\n\nRépondez : ${dashboardUrl}`,
      });
      this.logger.log(`Review alert sent to ${opts.email} for company ${opts.companyName}`);
    } catch (error) {
      this.logger.error(`Failed to send review alert: ${error instanceof Error ? error.message : error}`);
    }
  }

  async sendSignalementAlert(opts: {
    adminEmail: string;
    companyName: string;
    companySlug: string;
    category: string;
    description: string;
    isAnonymous: boolean;
    reporterUsername?: string;
  }): Promise<void> {
    try {
      const adminUrl = `${process.env.FRONTEND_URL || 'https://echowork.net'}/admin/signalements`;
      const safeCompany = this.escapeHtml(opts.companyName);
      const safeDesc = this.escapeHtml(opts.description?.slice(0, 300) || '');
      const categoryLabels: Record<string, string> = {
        CORRUPTION: '🚨 Corruption',
        MAUVAIS_ACCUEIL: '😠 Mauvais accueil',
        RETARD_ADMINISTRATIF: '⏰ Retard administratif',
        NON_RESPECT_ENGAGEMENT: '📋 Non-respect des engagements',
        AUTRE: '📝 Autre',
      };
      const categoryLabel = categoryLabels[opts.category] ?? opts.category;

      const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding-bottom:20px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background:#dc2626;border-radius:12px;padding:8px 18px;">
            <span style="color:#fff;font-size:20px;font-weight:900;">Echo<span style="color:rgba(255,255,255,0.7);">Work</span></span>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:linear-gradient(135deg,#ea580c 0%,#c2410c 100%);padding:28px 40px;text-align:center;">
            <div style="font-size:32px;margin-bottom:10px;">🚨</div>
            <div style="color:#fff;font-size:20px;font-weight:800;">Nouveau signalement citoyen</div>
            <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px;">Action de modération requise</div>
          </td></tr>
          <tr><td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                  <span style="font-size:13px;font-weight:700;color:#ea580c;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:3px 10px;">${categoryLabel}</span>
                  ${opts.isAnonymous ? '<span style="font-size:13px;color:#6b7280;background:#f3f4f6;border-radius:8px;padding:3px 10px;">Anonyme</span>' : ''}
                </div>
                <div style="font-size:13px;font-weight:600;color:#111827;margin-bottom:4px;">Entreprise concernée</div>
                <div style="font-size:14px;font-weight:700;color:#dc2626;margin-bottom:16px;">${safeCompany}</div>
                <div style="font-size:13px;font-weight:600;color:#111827;margin-bottom:6px;">Description</div>
                <div style="font-size:13px;color:#374151;line-height:1.7;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 16px;">"${safeDesc}${opts.description?.length > 300 ? '…' : ''}"</div>
                ${!opts.isAnonymous && opts.reporterUsername ? `<div style="margin-top:12px;font-size:12px;color:#9ca3af;">Déposé par : ${this.escapeHtml(opts.reporterUsername)}</div>` : ''}
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#dc2626;border-radius:10px;padding:12px 28px;">
                <a href="${adminUrl}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Modérer le signalement →</a>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0 40px 24px;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;">
            <div style="padding-top:16px;">© ${new Date().getFullYear()} EchoWork · Portail admin</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EchoWork" <no-reply@echowork.net>',
        to: opts.adminEmail,
        subject: `🚨 Signalement citoyen — ${opts.companyName} (${categoryLabel})`,
        html,
        text: `Nouveau signalement citoyen\nEntreprise : ${opts.companyName}\nCatégorie : ${categoryLabel}\nDescription : ${opts.description}\n\nModérer : ${adminUrl}`,
      });
      this.logger.log(`Signalement alert sent to admin for company ${opts.companyName}`);
    } catch (error) {
      this.logger.error(`Failed to send signalement alert: ${error instanceof Error ? error.message : error}`);
    }
  }

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
