import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  NotFoundException,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CompaniesService } from './companies.service';
import { CompanyIdParamDto, CategoryIdParamDto, CategorySlugParamDto, CompanySlugParamDto } from './dto/param.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyOwnerGuard } from './company-owner.guard';

const photoStorage = diskStorage({
  destination: './uploads/companies',
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `company-${unique}${extname(file.originalname)}`);
  },
});

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // ── Static / non-parameterized routes first (NestJS/Express ordering) ──

  /** GET /api/companies/my — mes entreprises réclamées */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyCompanies(@Request() req: any) {
    return this.companiesService.getMyCompanies(req.user.id);
  }

  @Get('best')
  async getBestCompanies() {
    return this.companiesService.findBestCompanies();
  }

  @Get('search/autocomplete')
  async searchAutocomplete(
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    return this.companiesService.searchWithAutocomplete(query || '', limit ? parseInt(limit, 10) : 10);
  }

  @Get('category/slug/:slug')
  async getByCategorySlug(@Param() params: CategorySlugParamDto) {
    return this.companiesService.findByCategorySlug(params.slug);
  }

  @Get('category/:categoryId')
  async getByCategory(@Param() params: CategoryIdParamDto) {
    return this.companiesService.findByCategory(params.categoryId);
  }

  @Get('slug/:slug')
  async getBySlug(@Param() params: CompanySlugParamDto) {
    const company = await this.companiesService.findBySlug(params.slug);
    if (!company) throw new NotFoundException(`Company with slug ${params.slug} not found`);
    return company;
  }

  @Get()
  async getAll(@Query('search') search?: string) {
    return this.companiesService.findAll(search);
  }

  // ── Authenticated routes ───────────────────────────────────────

  /** POST /api/companies/:id/subscribe — enregistrer un paiement Wave + activer la subscription */
  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async subscribe(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { plan: string; period: string; amount: number; wavePhone?: string },
  ) {
    return this.companiesService.subscribe(id, dto);
  }

  /** POST /api/companies — créer une nouvelle fiche et la réclamer immédiatement */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createForUser(
    @Body() dto: { name: string; categoryId: number; ville?: string; adresse?: string; tel?: string; description?: string; website?: string },
    @Request() req: any,
  ) {
    return this.companiesService.createForUser(req.user.id, dto);
  }

  /** POST /api/companies/:id/claim — réclamer une fiche */
  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  async claim(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.companiesService.claimCompany(id, req.user.id);
  }

  /** DELETE /api/companies/:id/claim — abandonner la réclamation */
  @Delete(':id/claim')
  @UseGuards(JwtAuthGuard)
  async unclaim(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.companiesService.unclaimCompany(id, req.user.id);
  }

  /** GET /api/companies/:id/dashboard — données complètes du tableau de bord */
  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async getDashboard(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCompanyDashboard(id);
  }

  /** PATCH /api/companies/:id/profile — mettre à jour le profil */
  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.companiesService.updateProfile(id, dto);
  }

  /** POST /api/companies/:id/branches — créer une agence */
  @Post(':id/branches')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async createBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { name: string; slug?: string; ville?: string; adresse?: string; tel?: string; description?: string; categoryId?: number },
    @Request() req: any,
  ) {
    return this.companiesService.createBranch(id, dto, req.user.id);
  }

  /** POST /api/companies/:id/logo — upload logo */
  @Post(':id/logo')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  @UseInterceptors(FileInterceptor('logo', {
    storage: photoStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Seuls les fichiers JPG, PNG ou WEBP sont acceptés'), false);
      }
      cb(null, true);
    },
  }))
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const url = `/uploads/companies/${file.filename}`;
    return this.companiesService.uploadLogo(id, url);
  }

  /** POST /api/companies/:id/cover — upload photo de couverture */
  @Post(':id/cover')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  @UseInterceptors(FileInterceptor('cover', {
    storage: photoStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Seuls les fichiers JPG, PNG ou WEBP sont acceptés'), false);
      }
      cb(null, true);
    },
  }))
  async uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const url = `/uploads/companies/${file.filename}`;
    return this.companiesService.uploadCover(id, url);
  }

  /** POST /api/companies/:id/photos — ajouter une photo */
  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  @UseInterceptors(FileInterceptor('photo', {
    storage: photoStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Seuls les fichiers JPG, PNG ou WEBP sont acceptés'), false);
      }
      cb(null, true);
    },
  }))
  async addPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const url = `/uploads/companies/${file.filename}`;
    return this.companiesService.addPhoto(id, url, caption);
  }

  /** GET /api/companies/:id/posts — publications publiques */
  @Get(':id/posts')
  async getPosts(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getPosts(id);
  }

  /** POST /api/companies/:id/posts — créer une publication (propriétaire) */
  @Post(':id/posts')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async createPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { type: string; title: string; content: string },
  ) {
    return this.companiesService.createPost(id, dto);
  }

  /** DELETE /api/companies/:id/posts/:postId — supprimer une publication */
  @Delete(':id/posts/:postId')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.companiesService.deletePost(id, postId);
  }

  /** DELETE /api/companies/:id/photos/:photoId — supprimer une photo */
  @Delete(':id/photos/:photoId')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async deletePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.companiesService.deletePhoto(id, photoId);
  }

  // ── Route par ID (en dernier pour éviter les conflits) ────────

  @Get(':id')
  async getById(@Param() params: CompanyIdParamDto) {
    const company = await this.companiesService.findById(params.id);
    if (!company) throw new NotFoundException(`Company with ID ${params.id} not found`);
    return company;
  }
}
