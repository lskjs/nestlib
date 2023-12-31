import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({ tableName: 'auth_otp' })
export class AuthOtpModel {
  constructor(partial: Partial<AuthOtpModel> = {}) {
    Object.assign(this, partial);
  }

  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  userId?: string;

  @Property()
  type!: string;

  @Property()
  params!: Record<string, unknown>;

  // Код по котором будет искаться в базе
  @Property()
  code!: string;

  // TODO: а надо ли?
  // Дата когда пермит перестал быть валидным(досрочный expiredAt)
  @Property()
  disabledAt?: Date;

  // Дата активации
  @Property()
  activatedAt?: Date;

  // До какого времени годен
  @Property()
  expiredAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
