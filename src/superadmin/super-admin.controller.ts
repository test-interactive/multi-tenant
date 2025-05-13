import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import CreateCompanyDto from 'src/tenants/create-company.dto';

@Controller('super-admin')
@UseGuards(SuperAdminGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('dashboard')
  async getDashboardData() {
    return this.superAdminService.getDashboardData();
  }

  @Get('tenants')
  async getAllTenants() {
    return this.superAdminService.getAllTenants();
  }

  @Get('tenants/:id')
  async getTenantDetails(@Param('id') tenantId: string) {
    return this.superAdminService.getTenantDetails(tenantId);
  }

  @Post('tenants')
  async createTenant(@Body() createCompanyDto: CreateCompanyDto) {
    return this.superAdminService.createTenant(createCompanyDto);
  }

  @Put('tenants/:id/activate')
  async activateTenant(@Param('id') tenantId: string) {
    return this.superAdminService.activateTenant(tenantId);
  }

  @Put('tenants/:id/deactivate')
  async deactivateTenant(@Param('id') tenantId: string) {
    return this.superAdminService.deactivateTenant(tenantId);
  }

  @Get('users')
  async getAllUsers(@Query('tenantId') tenantId?: string) {
    return this.superAdminService.getAllUsers(tenantId);
  }

  @Delete('tenants/:id')
  async deleteTenant(@Param('id') tenantId: string) {
    return this.superAdminService.deleteTenant(tenantId);
  }
}
