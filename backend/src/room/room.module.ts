import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { CodeStorage } from './entities/code-storage.entity';
import { DevNote } from './entities/dev-note.entity';
import { Idea } from './entities/idea.entity';
import { SavedItem } from './entities/saved-item.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CodeStorage, DevNote, Idea, SavedItem]),
    UsersModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}

