import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { CreateCodeStorageDto } from './dto/create-code-storage.dto';
import { UpdateCodeStorageDto } from './dto/update-code-storage.dto';
import { CreateDevNoteDto } from './dto/create-dev-note.dto';
import { UpdateDevNoteDto } from './dto/update-dev-note.dto';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { CreateSavedItemDto } from './dto/create-saved-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UsersService } from '../users/users.service';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my complete room data' })
  async getMyRoom(@CurrentUser() user: User) {
    return this.roomService.getUserRoomData(user.id, user.id);
  }

  @Get(':userId')
  @Public()
  @ApiOperation({ summary: 'Get user room data (public only)' })
  async getUserRoom(
    @Param('userId') userId: string,
    @CurrentUser() user?: User,
  ) {
    return this.roomService.getUserRoomData(userId, user?.id);
  }

  // Code Storage endpoints
  @Get('code-storage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my code storage' })
  async getMyCodeStorage(
    @CurrentUser() user: User,
    @Query('userId') userId?: string,
  ) {
    const targetUserId = userId || user.id;
    return this.roomService.getCodeStorage(targetUserId, user.id);
  }

  @Get('code-storage/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get code storage by ID' })
  async getCodeStorageById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.roomService.getCodeStorageById(id, user.id);
  }

  @Post('code-storage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create code storage' })
  async createCodeStorage(
    @Body() createDto: CreateCodeStorageDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.createCodeStorage(user.id, createDto);
  }

  @Patch('code-storage/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update code storage' })
  async updateCodeStorage(
    @Param('id') id: string,
    @Body() updateDto: UpdateCodeStorageDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.updateCodeStorage(id, user.id, updateDto);
  }

  @Delete('code-storage/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete code storage' })
  async deleteCodeStorage(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.roomService.deleteCodeStorage(id, user.id);
    return { message: 'Code storage deleted successfully' };
  }

  // Dev Notes endpoints
  @Get('dev-notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my dev notes' })
  async getMyDevNotes(@CurrentUser() user: User) {
    return this.roomService.getDevNotes(user.id);
  }

  @Get('dev-notes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dev note by ID' })
  async getDevNoteById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.roomService.getDevNoteById(id, user.id);
  }

  @Post('dev-notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create dev note' })
  async createDevNote(
    @Body() createDto: CreateDevNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.createDevNote(user.id, createDto);
  }

  @Patch('dev-notes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update dev note' })
  async updateDevNote(
    @Param('id') id: string,
    @Body() updateDto: UpdateDevNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.updateDevNote(id, user.id, updateDto);
  }

  @Delete('dev-notes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete dev note' })
  async deleteDevNote(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.roomService.deleteDevNote(id, user.id);
    return { message: 'Dev note deleted successfully' };
  }

  // Ideas endpoints
  @Get('ideas')
  @Public()
  @ApiOperation({ summary: 'Get ideas for a user' })
  async getIdeas(
    @Query('userId') userId: string,
    @CurrentUser() user?: User,
  ) {
    return this.roomService.getIdeas(userId, user?.id);
  }

  @Get('ideas/:id')
  @Public()
  @ApiOperation({ summary: 'Get idea by ID' })
  async getIdeaById(@Param('id') id: string) {
    return this.roomService.getIdeaById(id);
  }

  @Post('ideas')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create idea' })
  async createIdea(
    @Body() createDto: CreateIdeaDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.createIdea(user.id, createDto);
  }

  @Patch('ideas/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update idea' })
  async updateIdea(
    @Param('id') id: string,
    @Body() updateDto: UpdateIdeaDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.updateIdea(id, user.id, updateDto);
  }

  @Delete('ideas/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete idea' })
  async deleteIdea(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.roomService.deleteIdea(id, user.id);
    return { message: 'Idea deleted successfully' };
  }

  // Saved Items endpoints
  @Get('saved-items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my saved items' })
  async getMySavedItems(@CurrentUser() user: User) {
    return this.roomService.getSavedItems(user.id);
  }

  @Post('saved-items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save an item' })
  async saveItem(
    @Body() createDto: CreateSavedItemDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.saveItem(user.id, createDto);
  }

  @Delete('saved-items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsave an item' })
  async unsaveItem(
    @Query('itemType') itemType: string,
    @Query('itemId') itemId: string,
    @CurrentUser() user: User,
  ) {
    await this.roomService.unsaveItem(user.id, itemType, itemId);
    return { message: 'Item unsaved successfully' };
  }

  // Status endpoint
  @Patch('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my status' })
  async updateStatus(
    @Body() updateDto: UpdateStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.updateStatus(user.id, updateDto.status_text || '');
  }
}

