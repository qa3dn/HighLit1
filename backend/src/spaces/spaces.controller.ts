import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { Space } from './entities/space.entity';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('spaces')
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new audio space' })
  create(@Body() spaceData: Partial<Space>, @CurrentUser() user: User) {
    return this.spacesService.create({
      ...spaceData,
      host_id: user.id,
    });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all spaces' })
  findAll() {
    return this.spacesService.findAll();
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Get live spaces' })
  findLive() {
    return this.spacesService.findLive();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get space by ID' })
  findOne(@Param('id') id: string) {
    return this.spacesService.findOne(id);
  }

  @Patch(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a space' })
  startSpace(@Param('id') id: string) {
    return this.spacesService.startSpace(id);
  }

  @Patch(':id/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a space' })
  endSpace(@Param('id') id: string) {
    return this.spacesService.endSpace(id);
  }
}

