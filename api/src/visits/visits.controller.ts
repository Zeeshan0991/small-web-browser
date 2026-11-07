
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { RecordVisitInput } from './visits.service';
import { VisitsService } from './visits.service';

@Controller()
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post('visits')
  record(@Body() body: RecordVisitInput) {
    return this.visits.record(body ?? {});
  }

  @Get('history')
  history(
    @Query('personId') personId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.visits.history(personId, limit, before);
  }
}
