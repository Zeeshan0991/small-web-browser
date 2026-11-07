
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { PublishInput } from './sites.service';
import { SitesService } from './sites.service';

@Controller()
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get('resolve')
  resolve(
    @Query('address') address?: string,
    @Query('revisionId') revisionId?: string,
  ) {
    return this.sites.resolve(address ?? '', revisionId);
  }

  @Post('sites')
  publish(@Body() body: PublishInput) {
    return this.sites.publish(body ?? {});
  }
}
