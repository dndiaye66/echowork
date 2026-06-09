import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** POST /api/reviews — Create review (auth required) */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  /** PATCH /api/reviews/:id — Update own review (auth required) */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, req.user.id, updateReviewDto);
  }

  /** GET /api/reviews/company/:companyId */
  @Get('company/:companyId')
  async findByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('rating') rating?: string,
  ) {
    const ratingNumber = rating ? parseInt(rating, 10) : undefined;
    return this.reviewsService.findByCompany(companyId, ratingNumber);
  }

  /** GET /api/reviews/user-votes?companyId=X (auth required) — must be before :id */
  @Get('user-votes')
  @UseGuards(JwtAuthGuard)
  async getUserVotes(
    @Request() req: any,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.reviewsService.getUserVotesForCompany(req.user.id, companyId);
  }

  /** GET /api/reviews/:id */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  /** POST /api/reviews/:id/upvote (auth required) */
  @Post(':id/upvote')
  @UseGuards(JwtAuthGuard)
  async upvote(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.reviewsService.vote(id, 'upvote', req.user.id);
  }

  /** POST /api/reviews/:id/downvote (auth required) */
  @Post(':id/downvote')
  @UseGuards(JwtAuthGuard)
  async downvote(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.reviewsService.vote(id, 'downvote', req.user.id);
  }

  /** DELETE /api/reviews/:id (auth required) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.reviewsService.delete(id, req.user.id, req.user.role);
  }

  /** POST /api/reviews/:id/reply — répondre à un avis (propriétaire entreprise) */
  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  async createReply(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: CreateReplyDto,
  ) {
    return this.reviewsService.createReply(id, req.user.id, dto.content);
  }

  /** PATCH /api/reviews/:id/reply — modifier sa réponse */
  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard)
  async updateReply(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: CreateReplyDto,
  ) {
    return this.reviewsService.updateReply(id, req.user.id, dto.content);
  }

  /** DELETE /api/reviews/:id/reply — supprimer une réponse */
  @Delete(':id/reply')
  @UseGuards(JwtAuthGuard)
  async deleteReply(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.reviewsService.deleteReply(id, req.user.id, req.user.role);
  }
}
