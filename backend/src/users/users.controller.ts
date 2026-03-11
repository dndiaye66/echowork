import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /api/users/me */
  @Get('me')
  getMyProfile(@Request() req: any) {
    return this.usersService.getMyProfile(req.user.id);
  }

  /** PATCH /api/users/me */
  @Patch('me')
  updateProfile(
    @Request() req: any,
    @Body() body: {
      username?: string;
      email?: string;
      phone?: string;
      fullName?: string;
      profileType?: string;
    },
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  /** PATCH /api/users/me/password */
  @Patch('me/password')
  changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  /** GET /api/users/me/reviews?page=1&limit=10 */
  @Get('me/reviews')
  getMyReviews(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getMyReviews(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}
