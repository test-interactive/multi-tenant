// import { BadRequestException, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Tenant } from './tenant.schema';
// import { Model } from 'mongoose';
// import CreateCompanyDto from './create-company.dto';
// import { UsersService } from 'src/users/users.service';
// import { nanoid } from 'nanoid';
// import { AuthService } from 'src/auth/auth.service';

// @Injectable()
// export class TenantsService {
//   constructor(
//     @InjectModel(Tenant.name)
//     private TenantModel: Model<Tenant>,
//     private usersService: UsersService,
//     private authService: AuthService,
//   ) {}

//   async getTenantById(tenantId: string) {
//     return this.TenantModel.findOne({ tenantId });
//   }

//   async createCompany(companyData: CreateCompanyDto) {
//     //Verify user does not already exist
//     const user = await this.usersService.getUserByEmail(companyData.user.email);
//     if (user) {
//       throw new BadRequestException('User exists and belongs to a company...');
//     }
//     //Create a tenant Id
//     const tenantId = nanoid(12);

//     //Create a tenant secret
//     await this.authService.createSecretKeyForNewTenant(tenantId);

//     //Create new user
//     await this.usersService.createUser(companyData.user, tenantId);

//     //Create Tenant Record
//     return this.TenantModel.create({
//       companyName: companyData.companyName,
//       tenantId,
//     });
//   }
// }

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './tenant.schema';
import { Model } from 'mongoose';
import CreateCompanyDto from './create-company.dto';
import { UsersService } from 'src/users/users.service';
import { nanoid } from 'nanoid';
import { AuthService } from 'src/auth/auth.service';
import { TenantConnectionService } from 'src/services/tenant-connection.service';
import { Employee, EmployeeSchema } from 'src/employee/employee.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private TenantModel: Model<Tenant>,
    private usersService: UsersService,
    private authService: AuthService,
    private tenantConnectionService: TenantConnectionService,
  ) {}

  async getTenantById(tenantId: string) {
    const tenant = await this.TenantModel.findOne({ tenantId });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async getTenantByUserEmail(email: string) {
    return this.TenantModel.findOne({ email });
  }

  async getAllTenants() {
    return this.TenantModel.find({ tenantId: { $ne: 'super-admin' } });
  }

  async createCompany(companyData: CreateCompanyDto) {
    // Verify user does not already exist
    const user = await this.usersService.getUserByEmail(companyData.user.email);
    if (user) {
      throw new BadRequestException('User exists and belongs to a company...');
    }

    // Create a tenant Id
    const tenantId = nanoid(12);

    // Create a tenant secret
    await this.authService.createSecretKeyForNewTenant(tenantId);

    // Create new user (tenant admin)
    await this.usersService.createUser(companyData.user, tenantId);
    await this.initializeTenantDatabase(tenantId);
    // Create Tenant Record with active status
    return this.TenantModel.create({
      companyName: companyData.companyName,
      tenantId,
      isActive: true,
    });
  }

  private async initializeTenantDatabase(tenantId: string) {
    // Initialize the Employee collection in the tenant database
    const EmployeeModel = await this.tenantConnectionService.getTenantModel(
      { name: Employee.name, schema: EmployeeSchema },
      tenantId,
    );

    // Explicitly create the collection (not always necessary but ensures collection exists)
    await EmployeeModel.createCollection();

    // Add more collections as needed for the tenant

    console.log(`Initialized database for tenant: ${tenantId}`);
  }

  async deactivateTenant(tenantId: string) {
    const tenant = await this.getTenantById(tenantId);

    // Don't allow deactivating super admin
    if (tenantId === 'super-admin') {
      throw new BadRequestException('Cannot deactivate super admin tenant');
    }

    tenant.isActive = false;
    await tenant.save();

    return { message: 'Tenant deactivated successfully', tenantId };
  }

  async activateTenant(tenantId: string) {
    const tenant = await this.getTenantById(tenantId);
    tenant.isActive = true;
    await tenant.save();

    return { message: 'Tenant activated successfully', tenantId };
  }
}
