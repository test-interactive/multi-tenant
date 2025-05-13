import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from '../employee/employee.schema';
import { TenantsService } from 'src/tenants/tenants.service';
import { User } from 'src/users/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    private tenantsService: TenantsService,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Employee.name) private EmployeeModel: Model<Employee>,
  ) {}

  async getTenantDashboardData(tenantId: string) {
    // Get tenant information
    const tenant = await this.tenantsService.getTenantById(tenantId);

    // Get count of users
    const userCount = await this.UserModel.countDocuments({ tenantId });

    // Get count of active employees
    const activeEmployees = await this.EmployeeModel.countDocuments({
      tenantId,
      isActive: true,
    });

    // Get count of inactive employees
    const inactiveEmployees = await this.EmployeeModel.countDocuments({
      tenantId,
      isActive: false,
    });

    // Get recent employees
    const recentEmployees = await this.EmployeeModel.find({ tenantId })
      .sort({ _id: -1 })
      .limit(5);

    return {
      tenant: {
        name: tenant.companyName,
        id: tenant.tenantId,
        isActive: tenant.isActive,
      },
      stats: {
        userCount,
        activeEmployees,
        inactiveEmployees,
        totalEmployees: activeEmployees + inactiveEmployees,
      },
      recentEmployees,
    };
  }
}
