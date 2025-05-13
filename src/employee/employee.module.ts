import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './employee.schema';
import { EmployeesController } from './employee.controller';
import { EmployeesService } from './employee.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
