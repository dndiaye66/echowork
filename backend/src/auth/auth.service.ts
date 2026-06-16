import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Register a new user
   * @param signupDto - User registration data
   * @returns Access token and user info
   */
  async signup(signupDto: SignupDto) {
    const { password, email, accountType, firstName, lastName, phone } = signupDto;
    const isCompany = accountType === 'company';

    if (isCompany) {
      throw new ForbiddenException(
        'Les inscriptions entreprises sont temporairement suspendues. EchoWork se concentre actuellement sur les avis des citoyens.',
      );
    }

    // Determine username
    let username = signupDto.username?.trim();
    if (isCompany) {
      if (!firstName?.trim() || !lastName?.trim()) {
        throw new ConflictException('Prénom et nom du responsable sont requis.');
      }
      if (!phone?.trim()) {
        throw new ConflictException('Le numéro de téléphone est requis.');
      }
      // Auto-generate username from prenom.nom
      const base = `${firstName.trim().toLowerCase()}.${lastName.trim().toLowerCase()}`
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9.]/g, '');
      username = await this.generateUniqueUsername(base);
    } else {
      if (!username || username.length < 3) {
        throw new ConflictException('Le pseudo doit contenir au moins 3 caractères.');
      }
      // Check username uniqueness for personal accounts
      const existingUsername = await this.prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        throw new ConflictException('Ce pseudo est déjà pris.');
      }
    }

    // Check email uniqueness
    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('Un compte avec cet email existe déjà.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user data
    const fullName = isCompany ? `${firstName!.trim()} ${lastName!.trim()}` : undefined;

    // Generate 6-digit OTP
    const emailToken = Math.floor(100000 + Math.random() * 900000).toString();
    const emailTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const user = await this.prisma.user.create({
      data: {
        username: username!,
        password: hashedPassword,
        email,
        phone: phone?.trim() || null,
        profile: fullName ? { create: { fullName } } : undefined,
        emailToken,
        emailTokenExpiry,
      },
    });

    // Send OTP email (async)
    this.emailService.sendOtpEmail(email, username!, emailToken).catch((error) => {
      this.logger.error('Failed to send OTP email', error);
    });

    // Generate JWT token
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    let candidate = base;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username: candidate } })) {
      candidate = `${base}${counter}`;
      counter++;
    }
    return candidate;
  }

  /**
   * Login existing user
   * @param loginDto - User login credentials
   * @returns Access token and user info
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   * @param userId - User ID from JWT token
   * @returns User object without password
   */
  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Google OAuth login/signup
   */
  async googleLogin(profile: any) {
    const googleId: string = profile.id;
    const email: string = profile.emails?.[0]?.value;
    const displayName: string = profile.displayName || '';

    // 1. Try to find user by googleId
    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // 2. Try to find by email and link account
      user = await this.prisma.user.findUnique({ where: { email } });

      if (user) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, isVerified: true },
        });
      } else {
        // 3. Create new user from Google profile
        const base = displayName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '.')
          .replace(/\.+/g, '.')
          .replace(/^\.+|\.+$/g, '') || 'user';

        const username = await this.generateUniqueUsername(base);

        user = await this.prisma.user.create({
          data: {
            username,
            email,
            googleId,
            password: '',
            isVerified: true,
          },
        });

        // Send welcome email (async)
        this.emailService.sendWelcomeEmail(email, username).catch((err) => {
          this.logger.error('Failed to send welcome email', err);
        });
      }
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  async confirmEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { emailToken: token } });
    if (!user) throw new BadRequestException('Lien de confirmation invalide.');
    if (user.emailTokenExpiry && user.emailTokenExpiry < new Date()) {
      throw new BadRequestException('Lien de confirmation expiré. Veuillez vous réinscrire.');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailToken: null, emailTokenExpiry: null },
    });
    return { message: 'Email confirmé avec succès. Vous pouvez maintenant publier des avis.' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email introuvable.');
    if (user.isVerified) return { message: 'Email déjà confirmé.' };
    if (!user.emailToken || user.emailToken !== otp.trim()) {
      throw new BadRequestException('Code OTP invalide.');
    }
    if (user.emailTokenExpiry && user.emailTokenExpiry < new Date()) {
      throw new BadRequestException('Code OTP expiré. Veuillez demander un nouveau code.');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailToken: null, emailTokenExpiry: null },
    });
    return { message: 'Email confirmé avec succès !' };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email introuvable.');
    if (user.isVerified) return { message: 'Email déjà confirmé.' };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailToken: otp, emailTokenExpiry: otpExpiry },
    });

    this.emailService.sendOtpEmail(user.email, user.username, otp).catch((err) => {
      this.logger.error('Failed to resend OTP', err);
    });

    return { message: 'Nouveau code envoyé.' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return the same message to avoid email enumeration
    const response = { message: 'Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.' };
    if (!user) return response;

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.emailService.sendPasswordResetEmail(user.email, token, frontendUrl).catch((err) => {
      this.logger.error('Failed to send reset email', err);
    });

    return response;
  }

  async resetPassword(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères.');
    }
    const user = await this.prisma.user.findFirst({ where: { resetToken: token } });
    if (!user) throw new BadRequestException('Lien de réinitialisation invalide.');
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Lien de réinitialisation expiré. Veuillez refaire la demande.');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });
    return { message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' };
  }
}
