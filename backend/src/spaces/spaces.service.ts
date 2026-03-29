import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space, SpaceStatus } from './entities/space.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private spacesRepository: Repository<Space>,
  ) {}

  async create(spaceData: Partial<Space>): Promise<Space> {
    const space = this.spacesRepository.create(spaceData);
    return this.spacesRepository.save(space);
  }

  async findAll(): Promise<Space[]> {
    return this.spacesRepository.find({
      relations: ['host'],
      order: { created_at: 'DESC' },
    });
  }

  async findLive(): Promise<Space[]> {
    return this.spacesRepository.find({
      where: { status: SpaceStatus.LIVE },
      relations: ['host'],
      order: { started_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Space> {
    const space = await this.spacesRepository.findOne({
      where: { id },
      relations: ['host'],
    });

    if (!space) {
      throw new NotFoundException(`Space with ID ${id} not found`);
    }

    return space;
  }

  async startSpace(id: string): Promise<Space> {
    const space = await this.findOne(id);
    space.status = SpaceStatus.LIVE;
    space.started_at = new Date();
    return this.spacesRepository.save(space);
  }

  async endSpace(id: string): Promise<Space> {
    const space = await this.findOne(id);
    space.status = SpaceStatus.ENDED;
    space.ended_at = new Date();
    return this.spacesRepository.save(space);
  }

  async updateWhiteboard(id: string, whiteboardData: any): Promise<Space> {
    const space = await this.findOne(id);
    space.whiteboard_data = whiteboardData;
    return this.spacesRepository.save(space);
  }
}

