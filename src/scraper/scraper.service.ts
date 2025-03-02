import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { JobSearches } from './entities/job-searches.entity';

const ExcelJS = require('exceljs');
const fs = require('fs');

// Cache to store job searches. Stores data for an hour.
class JobCache {
  cache: Map<any, any>;
  TTL: number;
  constructor() {
    this.cache = new Map();
    this.TTL = 1000 * 60 * 60; // 1 hour
  }

  set(key, value) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

@Injectable()
export class ScraperService {
  constructor(
    private readonly usersService: UsersService,
    @Inject('JOB_SEARCHES_REPOSITORY')
    private jobSearchesRepository: Repository<JobSearches>,
  ) {}

  private jobData = [
    {
      id: '4142024539',
      title: 'Software Engineer (L5), Python Platform',
      company: 'Netflix',
      location: 'United States',
      date: '2025-02-04',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-l5-python-platform-at-netflix-4142024539?position=1&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=EYUTW83OW6FupHcBP4Xkug%3D%3D',
    },
    {
      id: '4144718777',
      title: 'Software Engineer (New Grad Program)',
      company: 'Sigma',
      location: 'New York, NY',
      date: '2025-02-12',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-new-grad-program-at-sigma-4144718777?position=2&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=OUJEOAI5A%2BdUNAKCdjk8uQ%3D%3D',
    },
    {
      id: '4142542652',
      title: 'Software Engineer, Autonomy - New Grad',
      company: 'Nuro',
      location: 'Mountain View, CA',
      date: '2025-02-05',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-autonomy-new-grad-at-nuro-4142542652?position=3&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=8j0FqGxEX1xcbUcQKJdXyg%3D%3D',
    },
    {
      id: '4139741896',
      title: 'Software Engineer, Backend',
      company: 'UnitedMasters',
      location: 'Brooklyn, NY',
      date: '2025-01-31',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-backend-at-unitedmasters-4139741896?position=4&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=VYTxPLXTZsQn0aSkLFLbyg%3D%3D',
    },
    {
      id: '4139280042',
      title: 'Software Engineer I, Game Development (NST)',
      company: 'Nintendo',
      location: 'Redmond, WA',
      date: '2025-01-30',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-i-game-development-nst-at-nintendo-4139280042?position=5&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=lBr0AfI4fziF6TtGr7nW3g%3D%3D',
    },
    {
      id: '4146961099',
      title: 'Software Engineer, New Grad (2025)',
      company: 'Airtable',
      location: 'New York, NY',
      date: '2025-02-07',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-new-grad-2025-at-airtable-4146961099?position=6&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=4NEjl9%2FChdaS9AjKV7H5XQ%3D%3D',
    },
    {
      id: '4136588579',
      title: 'Software Engineer, Developer Experience',
      company: 'Notion',
      location: 'San Francisco, CA',
      date: '2025-02-18',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-developer-experience-at-notion-4136588579?position=7&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=Kr83yOz5oUJp96nzi1TnjA%3D%3D',
    },
    {
      id: '4139383532',
      title: 'Software Engineer (New Grad)',
      company: 'Codeium',
      location: 'Mountain View, CA',
      date: '2025-01-30',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-new-grad-at-codeium-4139383532?position=8&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=L0hzFjFb2WKEkuProVrv3A%3D%3D',
    },
    {
      id: '4150508062',
      title: 'Software Engineer I (Full Time) United States',
      company: 'Cisco',
      location: 'San Jose, CA',
      date: '2025-02-12',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-i-full-time-united-states-at-cisco-4150508062?position=9&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=WPvOvAQr5T7IZ8gWxfT9JA%3D%3D',
    },
    {
      id: '4151579860',
      title: 'Software Engineer - AI Platform',
      company: 'LinkedIn',
      location: 'Mountain View, CA',
      date: '2025-02-13',
      salary: 'Not Specified',
      jobUrl:
        'https://www.linkedin.com/jobs/view/software-engineer-ai-platform-at-linkedin-4151579860?position=10&pageNum=0&refId=NGDs9r%2FklklOiWf0aCmQ%2Fg%3D%3D&trackingId=u3Q1E662aMbZo7y2h0SxHw%3D%3D',
    },
  ];

  // This object is used to map object computed in code to excel columns
  private columnMapping = {
    id: 'Job ID',
    title: 'Job Title',
    company: 'Company',
    location: 'Location',
    date: 'Date Posted',
    salary: 'Salary',
    jobUrl: 'Job Link',
  };

  private cache = new JobCache();

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // adds all the query parameters according to the settings selected by users
  buildQuery(searchQueryData: any): string {
    let query = process.env.BASE_JOBS_URL;

    const params = new URLSearchParams();
    params.append('start', searchQueryData.start);

    if (searchQueryData.keyword)
      params.append('keywords', searchQueryData.keyword);
    if (searchQueryData.location)
      params.append('location', searchQueryData.location);
    if (searchQueryData.datePosted)
      params.append(
        'f_TPR',
        this.getDateSincePosted(searchQueryData.datePosted),
      );
    if (searchQueryData.salary)
      params.append('f_SB2', this.getSalary(searchQueryData.salary));
    if (searchQueryData.experienceLevel)
      params.append(
        'f_E',
        this.getExperienceLevel(searchQueryData.experienceLevel),
      );
    if (searchQueryData.jobType)
      params.append('f_JT', this.getJobType(searchQueryData.jobType));
    if (searchQueryData.workMode)
      params.append('f_WT', this.getRemoteFilter(searchQueryData.workMode));
    return query + params.toString();
  }

  // Date Since Posted - Maps users selected values for filters to linkedin api's recognized values
  getDateSincePosted(timeRange: string): string {
    const dateRange = {
      'past month': 'r2592000',
      'past week': 'r604800',
      'past 24 hours': 'r86400',
    };
    return dateRange[timeRange.toLowerCase()] || '';
  }

  // Salary - Maps users selected values for filters to linkedin api's recognized values
  getSalary(minSalary: string): string {
    const salaryRange = {
      '$40,000+': '1',
      '$60,000+': '2',
      '$80,000+': '3',
      '$100,000+': '4',
      '$120,000+': '5',
      '$140,000+': '6',
      '$160,000+': '7',
      '$180,000+': '8',
      '$200,000+': '9',
    };
    return salaryRange[minSalary] || '';
  }

  // Experience Level - Maps users selected values for filters to linkedin api's recognized values
  getExperienceLevel(experienceLevel: string): string {
    const experienceRange = {
      internship: '1',
      'entry level': '2',
      associate: '3',
      'mid senior level': '4',
      director: '5',
      executive: '6',
    };
    return experienceRange[experienceLevel.toLowerCase()] || '';
  }

  // Job Type - Maps users selected values for filters to linkedin api's recognized values
  getJobType(jobType: string): string {
    const jobTypeRange = {
      'full time': 'F',
      'full-time': 'F',
      'part time': 'P',
      'part-time': 'P',
      contract: 'C',
      temporary: 'T',
      volunteer: 'V',
      internship: 'I',
    };
    return jobTypeRange[jobType.toLowerCase()] || '';
  }

  // Remote Filter (Work Mode) - Maps users selected values for filters to linkedin api's recognized values
  getRemoteFilter(workMode: string): string {
    const remoteFilterRange = {
      'on-site': '1',
      'on site': '1',
      remote: '2',
      hybrid: '3',
    };
    return remoteFilterRange[workMode.toLowerCase()] || '';
  }

  // Accepts html and parses it using the cheerio package. Returns objects to be mapped to our excel
  // Why is the parser needed: Linkedin api returns a html response (which contains a list of jobs), which we need to transform into json
  // TODO - add return type (create a dto for return)
  parseJobsHtmlToJson(html) {
    const $ = cheerio.load(html);
    const jobs = $('.job-search-card');
    // const jobs = $('li');
    return jobs.map((index, job) => {
      const id = $(job).attr('data-entity-urn')?.split(':')?.[3];
      const title = $(job).find('.base-search-card__title')?.text()?.trim();
      const company = $(job).find('.base-search-card__subtitle').text()?.trim();
      //   const link = $(job).find('a').attr('href')?.split('?')[0];
      const location = $(job).find('.job-search-card__location').text().trim();
      const dateElement = $(job).find('time');
      const date = dateElement.attr('datetime');
      const salary = $(job)
        .find('.job-search-card__salary-info')
        .text()
        .trim()
        .replace(/\s+/g, ' ');
      const jobUrl = $(job).find('.base-card__full-link').attr('href');

      // Not needed for version 1:
      // const agoTime = $(job).find('.job-search-card__listdate').text().trim();
      // const companyLogo = $(job)
      //   .find('.artdeco-entity-image')
      //   .attr('data-delayed-url');

      return {
        id,
        title,
        company,
        location,
        date,
        salary: salary || 'Not Specified',
        jobUrl: jobUrl || '',
      };
    });
  }

  // Fetches a batch of job listings. Moves to the next page with offset
  async fetchCurrentPageJobs(searchData, offset) {
    const query = this.buildQuery({ ...searchData, start: offset * 25 });
    const res = await axios.get(query);
    return this.parseJobsHtmlToJson(res.data);
  }

  // Saves user searches for job-market data analysis
  async saveSearchQuery(searchData): Promise<void> {
    const user = await this.usersService.getUser({ email: searchData.email });
    const { email, ...rest } = searchData;
    const jobSearch = this.jobSearchesRepository.create({ user, ...rest });
    await this.jobSearchesRepository.save(jobSearch);
  }

  // Main function, invokes other helper functions
  async scrapeJobs(searchData, res): Promise<void> {
    const { email, ...rest } = searchData;
    this.saveSearchQuery(searchData);
    await this.usersService.validateSearchAttempt(email);
    const MAX_CONSECUTIVE_ERRORS = 0;
    let consecutiveErrors = 0;
    const allJobsList = [];
    let offset = 0;
    const cacheKey = this.buildQuery({ ...rest, start: 0 });

    try {
      const cachedJobs = this.cache.get(cacheKey);

      if (cachedJobs) {
        console.log('Returning cached results', cachedJobs);
        await this.generateExcelFile(cachedJobs, res);
        return;
      }

      while (offset < 1) {
        try {
          const currentPageJobs = await this.fetchCurrentPageJobs(rest, offset);

          if (!currentPageJobs || currentPageJobs.length === 0) {
            break;
          }

          allJobsList.push(...currentPageJobs);
          offset++;
          await this.delay(2000);

          consecutiveErrors = 0;
        } catch (error) {
          consecutiveErrors++;
          console.error(
            `Error fetching job batch (attempt ${consecutiveErrors}):`,
            error.message,
          );

          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.log('Max consecutive errors reached. Terminating.');
            break;
          }

          await this.delay(Math.pow(2, consecutiveErrors) * 1000);
        }
      }

      if (allJobsList.length > 0) {
        this.cache.set(cacheKey, allJobsList);
      }

      await this.generateExcelFile(allJobsList, res);
    } catch (error) {
      console.error('Fatal error in job fetching:', error);
      throw error;
    }
  }

  // Accepts a list of all jobs collected, and converts them to an excel file
  // TODO - add return type
  async generateExcelFile(allJobsList, res) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Add headers
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const headers = Object.keys(this.columnMapping).map(
      (key) => this.columnMapping[key],
    );
    worksheet.addRow(headers);

    // Add data rows
    allJobsList.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });
    await workbook.xlsx.write(res);
    res.end();
  }
}
