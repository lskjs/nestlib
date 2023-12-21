import { ToLowerCase, Trim } from '@nestlib/decorators';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDTO {
  @IsNotEmpty()
  @Trim()
  @ToLowerCase()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
