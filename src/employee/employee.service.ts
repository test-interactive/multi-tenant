import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeSchema } from './employee.schema';
import EmployeeDto from './employee.dto';
import { TenantConnectionService } from 'src/services/tenant-connection.service';

@Injectable()
export class EmployeesService {
  constructor(
    private tenantConnectionService: TenantConnectionService, // @InjectModel(Employee.name) private employeeModel: Model<Employee>,
  ) {}
  private async getEmployeeModel(tenantId: string): Promise<Model<Employee>> {
    return this.tenantConnectionService.getTenantModel(
      { name: Employee.name, schema: EmployeeSchema },
      tenantId,
    );
  }

  async getEmployeesByTenantId(tenantId: string) {
    const EmployeeModel = await this.getEmployeeModel(tenantId);
    return EmployeeModel.find({ tenantId });
  }

  async getEmployeeById(id: string, tenantId: string) {
    const EmployeeModel = await this.getEmployeeModel(tenantId);
    const employee = await EmployeeModel.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Ensure tenant can only access their own employees
    if (employee.tenantId !== tenantId) {
      throw new UnauthorizedException(
        'Cannot access employees from different tenants',
      );
    }

    return employee;
  }

  async createEmployee(employeeDto: EmployeeDto, tenantId: string) {
    // Check if employee with same email already exists for this tenant
    const EmployeeModel = await this.getEmployeeModel(tenantId);
    const existingEmployee = await EmployeeModel.findOne({
      email: employeeDto.email,
      tenantId,
    });

    if (existingEmployee) {
      throw new ConflictException('Employee with this email already exists');
    }

    return EmployeeModel.create({
      ...employeeDto,
      tenantId,
      isActive: true,
    });
  }

  async updateEmployee(id: string, employeeDto: EmployeeDto, tenantId: string) {
    const EmployeeModel = await this.getEmployeeModel(tenantId);
    // First check if employee exists and belongs to this tenant
    await this.getEmployeeById(id, tenantId);

    // Check if trying to update to an email that already exists
    const existingEmployee = await EmployeeModel.findOne({
      email: employeeDto.email,
      tenantId,
      _id: { $ne: id }, // Exclude current employee from check
    });

    if (existingEmployee) {
      throw new ConflictException(
        'Another employee with this email already exists',
      );
    }

    // Update the employee
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { ...employeeDto },
      { new: true },
    );

    return updatedEmployee;
  }

  async deleteEmployee(id: string, tenantId: string) {
    // First check if employee exists and belongs to this tenant
    const EmployeeModel = await this.getEmployeeModel(tenantId);
    await this.getEmployeeById(id, tenantId);

    // Delete the employee
    await EmployeeModel.findByIdAndDelete(id);

    return {
      message: 'Employee deleted successfully',
      id,
    };
  }

  async deactivateEmployee(id: string, tenantId: string) {
    // First check if employee exists and belongs to this tenant
    const EmployeeModel = await this.getEmployeeModel(tenantId);
    await this.getEmployeeById(id, tenantId);

    // Deactivate the employee
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    return updatedEmployee;
  }

  async activateEmployee(id: string, tenantId: string) {
    // First check if employee exists and belongs to this tenant
    const EmployeeModel = await this.getEmployeeModel(tenantId);
    await this.getEmployeeById(id, tenantId);

    // Activate the employee
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true },
    );

    return updatedEmployee;
  }
}
