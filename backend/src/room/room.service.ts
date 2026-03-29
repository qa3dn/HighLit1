import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodeStorage } from './entities/code-storage.entity';
import { DevNote } from './entities/dev-note.entity';
import { Idea, IdeaStatus } from './entities/idea.entity';
import { SavedItem } from './entities/saved-item.entity';
import { CreateCodeStorageDto } from './dto/create-code-storage.dto';
import { UpdateCodeStorageDto } from './dto/update-code-storage.dto';
import { CreateDevNoteDto } from './dto/create-dev-note.dto';
import { UpdateDevNoteDto } from './dto/update-dev-note.dto';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { CreateSavedItemDto } from './dto/create-saved-item.dto';
import { CodeVisibility } from './entities/code-storage.entity';
import * as crypto from 'crypto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(CodeStorage)
    private codeStorageRepository: Repository<CodeStorage>,
    @InjectRepository(DevNote)
    private devNoteRepository: Repository<DevNote>,
    @InjectRepository(Idea)
    private ideaRepository: Repository<Idea>,
    @InjectRepository(SavedItem)
    private savedItemRepository: Repository<SavedItem>,
  ) { }

  // Get complete room data for a user
  async getUserRoomData(userId: string, requestingUserId?: string) {
    const isOwnProfile = requestingUserId === userId;

    const [codeStorage, devNotes, ideas, savedItems] = await Promise.all([
      this.getCodeStorage(userId, requestingUserId),
      isOwnProfile
        ? this.getDevNotes(userId)
        : Promise.resolve([]), // Dev notes are always private
      this.getIdeas(userId, requestingUserId),
      isOwnProfile
        ? this.getSavedItems(userId)
        : Promise.resolve([]), // Saved items are always private
    ]);

    return {
      code_storage: codeStorage,
      dev_notes: devNotes,
      ideas: ideas,
      saved_items: savedItems,
    };
  }

  // Code Storage methods
  async getCodeStorage(userId: string, requestingUserId?: string) {
    const isOwnProfile = requestingUserId === userId;

    const query = this.codeStorageRepository
      .createQueryBuilder('code')
      .where('code.user_id = :userId', { userId });

    if (!isOwnProfile) {
      // Only show public or shared items
      query.andWhere(
        '(code.visibility = :public OR code.visibility = :shared)',
        {
          public: CodeVisibility.PUBLIC,
          shared: CodeVisibility.SHARED,
        },
      );
    }

    return query.orderBy('code.updated_at', 'DESC').getMany();
  }

  async getCodeStorageById(id: string, requestingUserId?: string) {
    const code = await this.codeStorageRepository.findOne({
      where: { id },
      relations: ['linked_post'],
    });

    if (!code) {
      throw new NotFoundException('Code storage not found');
    }

    // Check visibility
    if (
      code.visibility === CodeVisibility.PRIVATE &&
      code.user_id !== requestingUserId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return code;
  }

  async createCodeStorage(
    userId: string,
    createDto: CreateCodeStorageDto,
  ): Promise<CodeStorage> {
    const code = this.codeStorageRepository.create({
      ...createDto,
      user_id: userId,
    });

    // Generate share token if visibility is SHARED
    if (createDto.visibility === CodeVisibility.SHARED) {
      code.share_token = crypto.randomBytes(16).toString('hex');
    }

    return this.codeStorageRepository.save(code);
  }

  async updateCodeStorage(
    id: string,
    userId: string,
    updateDto: UpdateCodeStorageDto,
  ): Promise<CodeStorage> {
    const code = await this.getCodeStorageById(id, userId);

    if (code.user_id !== userId) {
      throw new ForbiddenException('You can only update your own code');
    }

    // Generate new share token if visibility changed to SHARED
    if (
      updateDto.visibility === CodeVisibility.SHARED &&
      code.visibility !== CodeVisibility.SHARED
    ) {
      updateDto['share_token'] = crypto.randomBytes(16).toString('hex');
    } else if (updateDto.visibility !== CodeVisibility.SHARED) {
      updateDto['share_token'] = null;
    }

    Object.assign(code, updateDto);
    return this.codeStorageRepository.save(code);
  }

  async deleteCodeStorage(id: string, userId: string): Promise<void> {
    const code = await this.getCodeStorageById(id, userId);

    if (code.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own code');
    }

    await this.codeStorageRepository.remove(code);
  }

  // Dev Notes methods
  async getDevNotes(userId: string): Promise<DevNote[]> {
    return this.devNoteRepository.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
      relations: ['linked_code'],
    });
  }

  async getDevNoteById(id: string, userId: string): Promise<DevNote> {
    const note = await this.devNoteRepository.findOne({
      where: { id },
      relations: ['linked_code'],
    });

    if (!note) {
      throw new NotFoundException('Dev note not found');
    }

    if (note.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return note;
  }

  async createDevNote(
    userId: string,
    createDto: CreateDevNoteDto,
  ): Promise<DevNote> {
    const note = this.devNoteRepository.create({
      ...createDto,
      user_id: userId,
    });

    return this.devNoteRepository.save(note);
  }

  async updateDevNote(
    id: string,
    userId: string,
    updateDto: UpdateDevNoteDto,
  ): Promise<DevNote> {
    const note = await this.getDevNoteById(id, userId);

    Object.assign(note, updateDto);
    return this.devNoteRepository.save(note);
  }

  async deleteDevNote(id: string, userId: string): Promise<void> {
    const note = await this.getDevNoteById(id, userId);

    await this.devNoteRepository.remove(note);
  }

  // Ideas methods
  async getIdeas(userId: string, requestingUserId?: string): Promise<Idea[]> {
    // Ideas are always visible (no privacy concept for ideas)
    return this.ideaRepository.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
      relations: ['linked_code'],
    });
  }

  async getIdeaById(id: string): Promise<Idea> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['linked_code'],
    });

    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    return idea;
  }

  async createIdea(userId: string, createDto: CreateIdeaDto): Promise<Idea> {
    const idea = this.ideaRepository.create({
      ...createDto,
      user_id: userId,
      status: createDto.status || IdeaStatus.IDEA,
    });

    return this.ideaRepository.save(idea);
  }

  async updateIdea(
    id: string,
    userId: string,
    updateDto: UpdateIdeaDto,
  ): Promise<Idea> {
    const idea = await this.getIdeaById(id);

    if (idea.user_id !== userId) {
      throw new ForbiddenException('You can only update your own ideas');
    }

    Object.assign(idea, updateDto);
    return this.ideaRepository.save(idea);
  }

  async deleteIdea(id: string, userId: string): Promise<void> {
    const idea = await this.getIdeaById(id);

    if (idea.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own ideas');
    }

    await this.ideaRepository.remove(idea);
  }

  // Saved Items methods
  async getSavedItems(userId: string): Promise<SavedItem[]> {
    return this.savedItemRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async saveItem(
    userId: string,
    createDto: CreateSavedItemDto,
  ): Promise<SavedItem> {
    // Check if already saved
    const existing = await this.savedItemRepository.findOne({
      where: {
        user_id: userId,
        item_type: createDto.item_type,
        item_id: createDto.item_id,
      },
    });

    if (existing) {
      // Update notes if provided
      if (createDto.notes !== undefined) {
        existing.notes = createDto.notes;
        return this.savedItemRepository.save(existing);
      }
      return existing;
    }

    const savedItem = this.savedItemRepository.create({
      ...createDto,
      user_id: userId,
    });

    return this.savedItemRepository.save(savedItem);
  }

  async unsaveItem(
    userId: string,
    itemType: string,
    itemId: string,
  ): Promise<void> {
    const savedItem = await this.savedItemRepository.findOne({
      where: {
        user_id: userId,
        item_type: itemType as any,
        item_id: itemId,
      },
    });

    if (!savedItem) {
      throw new NotFoundException('Saved item not found');
    }

    await this.savedItemRepository.remove(savedItem);
  }
}

