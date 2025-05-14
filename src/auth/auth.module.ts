import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TenantConnectionService } from 'src/services/tenant-connection.service';
import { UsersModule } from 'src/users/users.module';
import { TokenBlacklist, TokenBlacklistSchema } from './token-blacklist.schema'; // Adjust import path as needed
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      global: true,
    }),
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'TokenBlacklist', schema: TokenBlacklistSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TenantConnectionService],
  exports: [AuthService],
})
export class AuthModule {}
