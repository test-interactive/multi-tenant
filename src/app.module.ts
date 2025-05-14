import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
// import { TenantsMiddleware } from './middlewares/tenants.middleware';
import { EmployeesModule } from './employee/employee.module';
import { SuperAdminModule } from './superadmin/super-admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import config from './config/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    TenantsModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    EmployeesModule,
    SuperAdminModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private authService: AuthService) {}

  async onModuleInit() {
    await this.authService.createSecretKeyForNewTenant('super-admin');
  }
  configure(consumer: MiddlewareConsumer) {}

  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(TenantsMiddleware)
  //     .exclude(
  //       'auth/super-admin/login', // Exclude super admin login from middleware
  //       'super-admin/(.*)', // Exclude all super admin routes
  //     )
  //     .forRoutes('*');
  // }
}
