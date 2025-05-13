import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
  Query,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import UserDto from './user.dto';
import { TenantAuthenticationGuard } from '../guards/tenant-auth.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Super admin endpoint to create users within a tenant
  @UseGuards(SuperAdminGuard)
  @Post('create')
  async createUser(
    @Body() userDto: UserDto,
    @Query('tenantId') tenantId: string,
  ) {
    return this.usersService.createUser(userDto, tenantId);
  }

  // Get current user profile based on JWT token
  @UseGuards(TenantAuthenticationGuard)
  @Get('profile')
  async getUserProfile(@Req() req) {
    const userId = req.userInfo.id;
    return this.usersService.getUserById(userId);
  }

  // Tenant admin can get their employees
  @UseGuards(TenantAuthenticationGuard)
  @Get('employees')
  async getEmployees(@Req() req) {
    const tenantId = req.tenantId;
    return this.usersService.getUsersByTenantId(tenantId);
  }

  // Get specific user by ID (for tenant admins checking employee details)
  @UseGuards(TenantAuthenticationGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req) {
    const user = await this.usersService.getUserById(id);

    // Ensure users can only access users within their tenant
    if (user?.tenantId !== req.tenantId) {
      throw new UnauthorizedException(
        'Cannot access users from different tenants',
      );
    }

    return user;
  }
}
