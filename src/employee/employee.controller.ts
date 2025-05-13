import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TenantAuthenticationGuard } from '../guards/tenant-auth.guard';
import { EmployeesService } from './employee.service';
import EmployeeDto from './employee.dto';

@Controller('employees')
@UseGuards(TenantAuthenticationGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getAllEmployees(@Req() req) {
    return this.employeesService.getEmployeesByTenantId(req.tenantId);
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: string, @Req() req) {
    return this.employeesService.getEmployeeById(id, req.tenantId);
  }

  @Post()
  async createEmployee(@Body() employeeDto: EmployeeDto, @Req() req) {
    return this.employeesService.createEmployee(employeeDto, req.tenantId);
  }

  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() employeeDto: EmployeeDto,
    @Req() req,
  ) {
    return this.employeesService.updateEmployee(id, employeeDto, req.tenantId);
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: string, @Req() req) {
    return this.employeesService.deleteEmployee(id, req.tenantId);
  }

  @Put(':id/deactivate')
  async deactivateEmployee(@Param('id') id: string, @Req() req) {
    return this.employeesService.deactivateEmployee(id, req.tenantId);
  }

  @Put(':id/activate')
  async activateEmployee(@Param('id') id: string, @Req() req) {
    return this.employeesService.activateEmployee(id, req.tenantId);
  }
}
