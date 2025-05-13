import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { TenantsService } from 'src/tenants/tenants.service';
import { UsersService } from 'src/users/users.service';
import { Tenant } from 'src/tenants/tenant.schema';
import { User } from 'src/users/user.schema';
import CreateCompanyDto from 'src/tenants/create-company.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    private tenantsService: TenantsService,
    private usersService: UsersService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Tenant.name) private TenantModel: Model<Tenant>,
    @InjectModel(User.name) private UserModel: Model<User>,
  ) {}

  async getDashboardData() {
    // Get count of active tenants
    const activeTenants = await this.TenantModel.countDocuments({
      isActive: true,
      tenantId: { $ne: 'super-admin' },
    });

    // Get count of inactive tenants
    const inactiveTenants = await this.TenantModel.countDocuments({
      isActive: false,
      tenantId: { $ne: 'super-admin' },
    });

    // Get count of all users (excluding super admin)
    const totalUsers = await this.UserModel.countDocuments({
      tenantId: { $ne: 'super-admin' },
    });

    // Get recent tenants (last 5 created)
    const recentTenants = await this.TenantModel.find({
      tenantId: { $ne: 'super-admin' },
    })
      .sort({ _id: -1 })
      .limit(5);

    return {
      activeTenants,
      inactiveTenants,
      totalUsers,
      recentTenants,
    };
  }

  async getAllTenants() {
    return this.tenantsService.getAllTenants();
  }

  async getTenantDetails(tenantId: string) {
    const tenant = await this.tenantsService.getTenantById(tenantId);

    // Get count of users for this tenant
    const userCount = await this.UserModel.countDocuments({ tenantId });

    return {
      ...tenant.toJSON(),
      userCount,
    };
  }

  async createTenant(createCompanyDto: CreateCompanyDto) {
    return this.tenantsService.createCompany(createCompanyDto);
  }

  async activateTenant(tenantId: string) {
    return this.tenantsService.activateTenant(tenantId);
  }

  async deactivateTenant(tenantId: string) {
    return this.tenantsService.deactivateTenant(tenantId);
  }

  // async getAllUsers(tenantId?: string) {
  //     const query = tenantId
  //         ? { tenantId, tenantId: { $ne: 'super-admin' } }
  //         : { tenantId: { $ne: 'super-admin' } };

  //     return this.UserModel.find(query).select('-password');
  // }

  async getAllUsers(tenantId?: string) {
    const query = tenantId
      ? { tenantId: tenantId }
      : { tenantId: { $ne: 'super-admin' } };

    return this.UserModel.find(query).select('-password');
  }

  async deleteTenant(tenantId: string) {
    // Prevent deletion of super-admin tenant
    if (tenantId === 'super-admin') {
      throw new BadRequestException('Cannot delete super admin tenant');
    }

    // Check if tenant exists
    const tenant = await this.tenantsService.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Delete all users associated with this tenant
    await this.UserModel.deleteMany({ tenantId });

    // Delete the tenant record
    await this.TenantModel.findOneAndDelete({ tenantId });

    // Delete the tenant database if necessary
    const tenantDbName = `tenant_${tenantId}`;
    await this.connection.db.admin().command({ dropDatabase: tenantDbName });

    return {
      message: 'Tenant deleted successfully',
      tenantId,
    };
  }
}
