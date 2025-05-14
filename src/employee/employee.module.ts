import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './employee.schema';
import { EmployeesController } from './employee.controller';
import { EmployeesService } from './employee.service';
import { AuthModule } from '../auth/auth.module';
import { TenantsMiddleware } from 'src/middlewares/tenants.middleware';
import { TenantConnectionService } from 'src/services/tenant-connection.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, TenantConnectionService],
  exports: [EmployeesService],
})
export class EmployeesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(EmployeesController);
  }
}
