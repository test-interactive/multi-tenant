// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { User } from './user.schema';
// import { Model } from 'mongoose';
// import UserDto from './user.dto';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class UsersService {
//   constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

//   async getUserByEmail(email: string) {
//     return this.UserModel.findOne({ email });
//   }

//   async createUser(user: UserDto, tenantId: string) {
//     user.password = await bcrypt.hash(user.password, 10);
//     return this.UserModel.create({ ...user, tenantId });
//   }
// }

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import UserDto from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {
    // Create super admin if it doesn't exist on service initialization
    this.ensureSuperAdminExists();
  }

  async getUserByEmail(email: string) {
    return this.UserModel.findOne({ email });
  }

  async getUserById(id: string) {
    return this.UserModel.findById(id).select('-password');
  }

  async createUser(user: UserDto, tenantId: string) {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    user.password = await bcrypt.hash(user.password, 10);

    // Create the user
    return this.UserModel.create({ ...user, tenantId });
  }

  async getUsersByTenantId(tenantId: string) {
    return this.UserModel.find({ tenantId }).select('-password');
  }

  async isSuperAdmin(userId: string): Promise<boolean> {
    const user = await this.UserModel.findById(userId);
    return user?.tenantId === 'super-admin';
  }

  private async ensureSuperAdminExists() {
    // Check if super admin exists
    const superAdmin = await this.UserModel.findOne({
      tenantId: 'super-admin',
    });

    if (!superAdmin) {
      // Create super admin if doesn't exist
      const superAdminPassword = await bcrypt.hash('superadmin123', 10); // Default password, should be changed

      await this.UserModel.create({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: superAdminPassword,
        tenantId: 'super-admin',
      });

      console.log('Super admin created with default credentials');
    }
  }
}
