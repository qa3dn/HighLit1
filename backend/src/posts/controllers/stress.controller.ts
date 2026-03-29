import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StressAnalyzerService } from '../services/stress-analyzer.service';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('posts')
@Controller('stress')
export class StressController {
  constructor(private readonly stressAnalyzerService: StressAnalyzerService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get current stress level analysis' })
  getStressLevel() {
    return this.stressAnalyzerService.analyzeStressLevel();
  }
}

