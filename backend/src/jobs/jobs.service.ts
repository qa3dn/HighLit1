import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Job } from './entities/job.entity';
import { CompanyReview } from './entities/company-review.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(CompanyReview)
    private reviewsRepository: Repository<CompanyReview>,
    private usersService: UsersService,
  ) {}

  async create(createJobDto: CreateJobDto, userId: string): Promise<Job> {
    const job = this.jobsRepository.create({
      ...createJobDto,
      posted_by: userId,
    });

    return this.jobsRepository.save(job);
  }

  async findAll(filters?: {
    location?: string;
    minSalary?: number;
    maxSalary?: number;
  }): Promise<Job[]> {
    const queryBuilder = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .leftJoinAndSelect('job.reviews', 'reviews')
      .orderBy('job.is_promoted', 'DESC')
      .addOrderBy('job.created_at', 'DESC');

    if (filters?.location) {
      queryBuilder.andWhere('job.location = :location', {
        location: filters.location,
      });
    }

    if (filters?.minSalary) {
      queryBuilder.andWhere(
        '(job.salary_range_min >= :minSalary OR job.salary_range_max >= :minSalary)',
        { minSalary: filters.minSalary },
      );
    }

    if (filters?.maxSalary) {
      queryBuilder.andWhere(
        '(job.salary_range_min <= :maxSalary OR job.salary_range_max <= :maxSalary)',
        { maxSalary: filters.maxSalary },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['user', 'reviews', 'reviews.user'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async addReview(
    jobId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<CompanyReview> {
    const job = await this.findOne(jobId);

    // Check if user already reviewed this job
    const existingReview = await this.reviewsRepository.findOne({
      where: { job_id: jobId, user_id: userId },
    });

    if (existingReview) {
      // Update existing review
      Object.assign(existingReview, createReviewDto);
      return this.reviewsRepository.save(existingReview);
    }

    // Create new review
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      job_id: jobId,
      user_id: userId,
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Add reputation to reviewer
    await this.usersService.updateReputation(userId, 3);

    return this.reviewsRepository.findOne({
      where: { id: savedReview.id },
      relations: ['user'],
    });
  }

  async getReviews(jobId: string): Promise<CompanyReview[]> {
    return this.reviewsRepository.find({
      where: { job_id: jobId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getJobsByLocation(locations: string[]): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { location: In(locations) },
      relations: ['user', 'reviews'],
      order: { created_at: 'DESC' },
    });
  }
}

