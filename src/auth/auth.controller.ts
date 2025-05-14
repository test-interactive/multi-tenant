// import { Body, Controller, Post } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import CredentialsDto from './dtos/credentials.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('login')
//   async login(@Body() credentials: CredentialsDto) {
//     return this.authService.login(credentials);
//   }
// }

import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import CredentialsDto from './dtos/credentials.dto';
import { TenantAuthenticationGuard } from '../guards/tenant-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: CredentialsDto) {
    return this.authService.login(credentials);
  }

  @Post('super-admin/login')
  async superAdminLogin(@Body() credentials: CredentialsDto) {
    // Special login for super admin
    return this.authService.superAdminLogin(credentials);
  }

  // @UseGuards(TenantAuthenticationGuard)
  // @Post('logout')
  // async logout(@Req() req) {
  //   // In JWT-based auth, logout is typically handled on client-side
  //   // by removing the token, but we can implement token blacklisting
  //   // for additional security
  //   return this.authService.logout(req.userInfo.id);
  // }
}
