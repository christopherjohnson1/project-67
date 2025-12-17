import { Module } from '@nestjs/common';
import { PuzzlesController } from './puzzles.controller';
import { PuzzlesService } from './puzzles.service';

/**
 * Puzzles module
 * Handles puzzle retrieval, submission, and progress tracking
 * TODO: Implement full puzzle system in next phase
 */
@Module({
  controllers: [PuzzlesController],
  providers: [PuzzlesService],
})
export class PuzzlesModule {}

