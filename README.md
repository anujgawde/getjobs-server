# GetJobs Server

## Overview

GetJobs Server is the backend service for the GetJobs application, responsible for handling user verification, job search restrictions, fetching and parsing job listings from LinkedIn, and generating Excel reports. It ensures smooth interaction between the frontend and external job sources while maintaining user search history for analytics.

## Table of Contents

- How it works
- Features
  - User Verification
  - Job Search Restrictions
  - Job Fetching and Parsing
  - Excel Job Report Generation
  - Search History Storage
  - Query Caching
- Technology Stack
- Getting Started
  - Prerequisites
  - Installation
- Future Enhancements
- Contribution
- Stay in Touch

## How it works

1.  User enters an email on the home page.
2.  The backend checks if the user is already verified:
    - If verified, the user is redirected to the jobs page.
    - If not verified, an email with a verification link is sent.
3.  Once the user verifies their email, they can perform job searches.
4.  The backend checks if the user has already made three searches in a day:
    - If yes, no more searches are allowed until the next day.
    - If no, the search proceeds.
5.  Job listings are fetched from LinkedIn's API, which returns an HTML response.
6.  The backend parses the HTML to extract relevant job details based on the user's filters.
7.  The backend caches job search results for one hour to optimize performance and reduce API calls.
8.  An Excel file is generated with the extracted job details.
9.  The user’s search query is saved in the database for data analysis.

## Features

### User Verification

- Ensures access only to verified users.
- Sends verification emails to unverified users.

### Job Search Restrictions

- Limits users to 3 searches per day.
- Prevents excessive API requests.

### Job Fetching and Parsing

- Fetches job listings from LinkedIn.
- Parses LinkedIn's HTML response to extract relevant job details.
- Supports multiple filters such as keyword, location, experience level, date posted, salary, work mode, and job type.

### Excel Job Report Generation

- Generates an Excel file containing job details:
  - Job ID
  - Job Title
  - Company
  - Location
  - Date Posted
  - Salary
  - Job Link
- Provides users with a downloadable report.

### Search History Storage

- Saves user search queries in the database for data analysis.

### Query Caching

- Reduces redundant API requests by caching search results for one hour.
- Uses an in-memory cache implementation

## Technology Stack

- **Server Framework**: NestJS (Nodejs)
- **Database**: PostgreSQL
- **Email Service**: Nodemailer
- **Job Fetching**: LinkedIn API
- **Excel Generation**: ExcelJS

## Getting Started

### Prerequisites

- Node.js installed in your system.
- PostgreSQL database setup.

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/anujgawde/getjobs-server.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd getjobs-server
    ```

3.  Install dependencies:

    ```bash
    npm install
    ```

4.  Set up the environment variables in a `.env` file:

    ```
    EMAIL_SERVICE= email-service-name (eg: gmail)
    EMAIL_AUTH_USER=email-id
    EMAIL_AUTH_PASS=email-password
    CLIENT_BASE_URL=client-application-base-url

    BASE_JOBS_URL=linkedin-api-url:
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?'

    DATABASE_URL=database-connection-string
    DATABASE_NAME=database-name
    DATABASE_PASS=database-password
    ```

5.  Start the server:

    ```bash
    npm run start
    ```

## Future Enhancements

- Implementing authentication with OAuth providers.
- Enhancing email verification with a more scalable solution.
- Improving caching layer to optimize job search performance.
- Implementing an admin dashboard for monitoring user searches.

## Contribution

1.  Fork the repository.
2.  Create a new branch for your feature:

    ```bash
    git checkout -b feature-name
    ```

3.  Commit your changes:

    ```bash
    git commit -m "Add feature description"
    ```

4.  Push to the branch:

    ```bash
    git push origin feature-name
    ```

5.  Open a pull request.

## Stay in Touch

- Author - [Anuj Gawde](https://x.com/axgdevv)
