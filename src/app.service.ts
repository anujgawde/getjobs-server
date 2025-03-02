import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  checkConnection() {
    return true;
  }
}
