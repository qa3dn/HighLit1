import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: User) {
    return this.jobsService.create(createJobDto, user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all jobs with optional filters' })
  findAll(
    @Query('location') location?: string,
    @Query('minSalary') minSalary?: number,
    @Query('maxSalary') maxSalary?: number,
  ) {
    return this.jobsService.findAll({
      location,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
    });
  }

  @Get('locations')
  @Public()
  @ApiOperation({ summary: 'Get jobs by locations' })
  getJobsByLocation(@Query('locations') locations: string) {
    const locationArray = locations.split(',').map((loc) => loc.trim());
    return this.jobsService.getJobsByLocation(locationArray);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get job by ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add company review' })
  addReview(
    @Param('id') jobId: string,
    @CurrentUser() user: User,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.jobsService.addReview(jobId, user.id, createReviewDto);
  }

  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get company reviews' })
  getReviews(@Param('id') jobId: string) {
    return this.jobsService.getReviews(jobId);
  }
}

