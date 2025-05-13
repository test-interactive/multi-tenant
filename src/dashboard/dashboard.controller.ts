import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TenantAuthenticationGuard } from '../guards/tenant-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(TenantAuthenticationGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Req() req) {
    return this.dashboardService.getTenantDashboardData(req.tenantId);
  }
}
