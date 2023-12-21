import { ToLowerCase, Trim } from '@nestlib/decorators';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @ToLowerCase()
  otpId: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
