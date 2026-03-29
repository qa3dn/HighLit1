import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { SpacesGateway } from './gateways/spaces.gateway';
import { Space } from './entities/space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Space])],
  controllers: [SpacesController],
  providers: [SpacesService, SpacesGateway],
  exports: [SpacesService],
})
export class SpacesModule {}

