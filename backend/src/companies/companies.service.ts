import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { Job } from '../jobs/entities/job.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companiesRepository.create(companyData);
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      relations: ['jobs'],
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['jobs'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async getCompanyJobs(companyId: string): Promise<Job[]> {
    const company = await this.findOne(companyId);
    return this.jobsRepository.find({
      where: { company_name: company.name },
      relations: ['user', 'reviews'],
    });
  }
}

