import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('send-verification')
  sendVerification(@Body() userData: { email: string }) {
    return this.usersService.sendVerificationEmail(userData);
  }

  @Post('verify-email')
  verifyEmail(@Body() verificationData: { token: string }) {
    return this.usersService.verifyEmail(verificationData);
  }
}
