import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Employee extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
