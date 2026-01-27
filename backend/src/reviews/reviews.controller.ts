import {
  Controller,
  Get,
  Post,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a new review (requires authentication)
   * POST /api/reviews
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  /**
   * Get all reviews for a company
   * GET /api/reviews/company/:companyId
   */
  @Get('company/:companyId')
  async findByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('rating') rating?: string,
  ) {
    const ratingNumber = rating ? parseInt(rating, 10) : undefined;
    return this.reviewsService.findByCompany(companyId, ratingNumber);
  }

  /**
   * Get a single review by ID
   * GET /api/reviews/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  /**
   * Upvote a review
   * POST /api/reviews/:id/upvote
   */
  @Post(':id/upvote')
  async upvote(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.vote(id, 'upvote');
  }

  /**
   * Downvote a review
   * POST /api/reviews/:id/downvote
   */
  @Post(':id/downvote')
  async downvote(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.vote(id, 'downvote');
  }

  /**
   * Delete a review (requires authentication)
   * DELETE /api/reviews/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.reviewsService.delete(id, req.user.id, req.user.role);
  }
}
