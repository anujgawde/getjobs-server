import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { IssuedTokens } from './entities/issued-tokens.entity';
import { UserSearchAttempts } from './entities/user-search-attempts.entity';

@Injectable()
export class UsersService {
  private transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS,
    },
  });

  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: Repository<Users>,
    @Inject('USER_SEARCH_ATTEMPTS_REPOSITORY')
    private userSearchAttemptsRepository: Repository<UserSearchAttempts>,
    @Inject('ISSUED_TOKENS_REPOSITORY')
    private issuedTokensRepository: Repository<IssuedTokens>,
  ) {}

  // Accepts user's details and returns a user accordingly
  async getUser(where: FindOptionsWhere<Users>): Promise<Users> {
    const user = await this.usersRepository.findOne({ where });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Sends a verification email to users trying to access protected routes.
  async sendVerificationEmail(userData: { email: string }): Promise<Users> {
    const token = randomBytes(32).toString('hex');
    let user = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (!user) {
      user = this.usersRepository.create({
        email: userData.email,
        verified: false,
      });

      const issuedToken = this.issuedTokensRepository.create({
        email: userData.email,
        token,
      });

      await this.issuedTokensRepository.save(issuedToken);
      await this.usersRepository.save(user);

      const link = `${process.env.CLIENT_BASE_URL}/verify?token=${token}`;

      const htmlContent = `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
              <h2 style="color: #0077B5;">Verify Your Email</h2>
              <p style="color: #0077B5;">Thank you for registering! Please click the button below to verify your email address.</p>
              <a href="${link}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #0077B5; text-decoration: none; border-radius: 5px;">Verify Email</a>
              <p style="color: #0077B5; margin-top: 10px;">If you did not request this, please ignore this email.</p>
            </div>
          `;

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_AUTH_USER}@gmail.com`,
        to: user.email,
        subject: 'Get-Jobs Email Verificaiton',
        html: htmlContent,
      });
    }

    return user;
  }

  // Verifies a user
  async verifyEmail(verificationData: { token: string }): Promise<Users> {
    let tokenResponse = await this.issuedTokensRepository.findOne({
      where: { token: verificationData.token },
    });
    let user = await this.usersRepository.findOne({
      where: { email: tokenResponse.email },
    });

    user.verified = true;
    await this.usersRepository.save(user);
    return user;
  }

  // Currently, one user (email) can search jobs utmost 3 times in 24 hours. This method validates user's search attempt.
  async validateSearchAttempt(loggedInUserData: {
    loggedInUser: string;
  }): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { email: loggedInUserData.loggedInUser },
    });
    const userSearch = await this.userSearchAttemptsRepository.findOne({
      where: { user: { id: user.id } },
    });

    const now = new Date();

    if (userSearch) {
      const timeDifference =
        now.getTime() - new Date(userSearch.firstSearchTimestamp).getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference < 24) {
        if (userSearch.searchCount >= 3) {
          throw new HttpException(
            'You have used your daily limit. Please visit after 24 hours.',
            HttpStatus.FORBIDDEN, // Use an appropriate HTTP status
          );
        }
        userSearch.searchCount += 1;
      } else {
        userSearch.firstSearchTimestamp = now;
        userSearch.searchCount = 1;
      }
      await this.userSearchAttemptsRepository.save(userSearch);
      return true;
    } else {
      const newUserSearch = this.userSearchAttemptsRepository.create({
        user: { id: userSearch.user.id },
        firstSearchTimestamp: now,
        searchCount: 1,
      });
      await this.userSearchAttemptsRepository.save(newUserSearch);
      return true;
    }
  }
}
