import { Body, Controller, Post, Res } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('/scrape-jobs')
  scrapeJobs(@Body() filterData, @Res() res) {
    return this.scraperService.scrapeJobs(filterData, res);
  }
}
