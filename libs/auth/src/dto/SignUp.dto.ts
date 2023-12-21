import { ToLowerCase, Trim } from '@nestlib/decorators';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDTO {
  @IsNotEmpty()
  @Trim()
  @ToLowerCase()
  @IsEmail()
  email: string;

  @IsBoolean()
  @IsNotEmpty()
  tos: boolean;

  @IsString()
  @IsNotEmpty()
  password: string;
}
