// import { Body, Controller, Get, Inject, Post, Req } from '@nestjs/common';
// import { TenantsService } from './tenants.service';
// import CreateCompanyDto from './create-company.dto';

// @Controller('tenants')
// export class TenantsController {
//   constructor(private readonly tenantsService: TenantsService) {}

//   @Post('create-company')
//   async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
//     return this.tenantsService.createCompany(createCompanyDto);
//   }
// }

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import CreateCompanyDto from './create-company.dto';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { TenantAuthenticationGuard } from '../guards/tenant-auth.guard';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // Only super admin can create companies/tenants
  @UseGuards(SuperAdminGuard)
  @Post('create-company')
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.tenantsService.createCompany(createCompanyDto);
  }

  // Only super admin can list all tenants
  @UseGuards(SuperAdminGuard)
  @Get()
  async getAllTenants() {
    return this.tenantsService.getAllTenants();
  }

  // Only super admin can get tenant details
  @UseGuards(SuperAdminGuard)
  @Get(':id')
  async getTenantDetails(@Param('id') tenantId: string) {
    return this.tenantsService.getTenantById(tenantId);
  }

  // Only super admin can deactivate a tenant
  @UseGuards(SuperAdminGuard)
  @Put(':id/deactivate')
  async deactivateTenant(@Param('id') tenantId: string) {
    return this.tenantsService.deactivateTenant(tenantId);
  }

  // Only super admin can activate a tenant
  @UseGuards(SuperAdminGuard)
  @Put(':id/activate')
  async activateTenant(@Param('id') tenantId: string) {
    return this.tenantsService.activateTenant(tenantId);
  }

  // Tenant can view their own details
  @UseGuards(TenantAuthenticationGuard)
  @Get('profile')
  async getTenantProfile(@Req() req) {
    const { tenantId } = req;
    return this.tenantsService.getTenantById(tenantId);
  }
}
