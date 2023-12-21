import { ToLowerCase, Trim } from '@nestlib/decorators';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordRequestDTO {
  @IsNotEmpty()
  @Trim()
  @ToLowerCase()
  @IsEmail()
  email: string;
}
