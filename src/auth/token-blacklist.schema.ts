import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class TokenBlacklist extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expireAt: Date;
}

export const TokenBlacklistSchema =
  SchemaFactory.createForClass(TokenBlacklist);

// Add the TTL index to the schema after creating it
TokenBlacklistSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
