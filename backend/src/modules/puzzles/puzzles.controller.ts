import { Controller, Get } from '@nestjs/common';
import { PuzzlesService } from './puzzles.service';

/**
 * Puzzles controller
 * Handles HTTP requests for puzzle operations
 * TODO: Implement endpoints in next phase
 */
@Controller('puzzles')
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) {}

  /**
   * Test endpoint for puzzles module
   */
  @Get('test')
  test() {
    return this.puzzlesService.test();
  }
}

