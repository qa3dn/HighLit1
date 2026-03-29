import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RankCalculatorService } from './services/rank-calculator.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rankCalculatorService: RankCalculatorService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if username already exists
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password if provided
    const userData = { ...createUserDto };
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Set default role to USER if not provided
    if (!userData.role) {
      userData.role = UserRole.USER;
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['posts', 'reactions', 'comments'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['posts', 'reactions', 'comments'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { github_id: githubId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async getUserRank(userId: string) {
    const user = await this.findOne(userId);
    const calculatedRank = await this.rankCalculatorService.calculateUserRank(
      userId,
    );

    return {
      current_rank: user.rank,
      calculated_rank: calculatedRank,
      reputation_points: user.reputation_points,
    };
  }

  async updateReputation(userId: string, points: number) {
    const newReputation =
      await this.rankCalculatorService.addReputationPoints(userId, points);
    return {
      reputation_points: newReputation,
    };
  }

  async updateStatus(userId: string, statusText: string): Promise<User> {
    const user = await this.findOne(userId);
    user.status_text = statusText;
    return this.usersRepository.save(user);
  }
}

