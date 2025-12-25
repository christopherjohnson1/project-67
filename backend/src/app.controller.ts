import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('boop')
  async getBoop(@Res() res: Response) {
    const filePath = join(__dirname, '..', 'uploads', 'boop.png');
    return res.sendFile(filePath);
  }
}
