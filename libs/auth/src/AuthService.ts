import { omit } from '@lsk4/algos';
import { Err } from '@lsk4/err';
import { EntityRepository } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { CryptoService } from '@nestlib/crypto';

// import { InjectRepository } from '@nestjs/typeorm';
// import { comparePassword, hashPassword } from '@nestlib/crypto';
import { AuthUserModel } from './models/AuthUserModel';
import { UserDto } from './types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthUserModel)
    private usersRepository: EntityRepository<AuthUserModel>,

    private cryptoService: CryptoService,
  ) {}

  async findUserById(userId: string) {
    const user = await this.usersRepository.findOne(userId);
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email: email.toLowerCase() });
    return user;
  }

  async isUserExists(email: string) {
    const user = await this.findUserByEmail(email);
    return Boolean(user);
  }

  async verifyUserCredentials(userDto: UserDto): Promise<any> {
    const user = await this.findUserByEmail(userDto.email);
    if (!user) {
      throw new Err('auth.emailNotFound', {
        status: 400,
        message: 'User with this email not found',
      });
    }
    const { password: passwordHash, ...userObj } = user;

    let isPasswordValid = false;
    if (userDto.password) {
      isPasswordValid = await this.cryptoService.comparePassword(userDto.password, passwordHash);
    }

    return { isPasswordValid, user: userObj };
  }

  async hashPassword(password: string): Promise<string> {
    const hash = await this.cryptoService.hashPassword(password);
    return hash;
  }

  async setNewPassword(email: string, password: string): Promise<any> {
    const hash = await this.cryptoService.hashPassword(password);
    const user = await this.usersRepository.findOne({ email });
    if (!user) {
      throw new Err('!user', { status: 404, message: 'User not found' });
    }
    const res = await this.usersRepository.nativeUpdate({ email }, { password: hash });
    return res;
  }

  async createUser(userDto: UserDto): Promise<AuthUserModel | null> {
    if (await this.isUserExists(userDto.email)) {
      throw new Err('auth.emailExists', { status: 400, message: 'User already exists' });
    }
    const hash = userDto.password
      ? await this.cryptoService.hashPassword(userDto.password)
      : userDto.passwordHash;
    //
    // if (!hash) {
    //   throw new Err('!hash', { status: 400, message: 'Password or passwordHash is required' });
    // }
    // TODO: перепридумать это, не нравится companyId, role:user
    const userData: any = {
      ...omit(userDto, ['password', 'passwordHash'] as any),
      role: 'user',
      companyId: userDto.email,
    };
    if (hash) userData.password = hash;

    const userId = await this.usersRepository.nativeInsert(userData);

    if (!userId) {
      throw new Err('auth.notCreated', { status: 500, message: 'User not created' });
    }
    const user = await this.findUserById(userId as string);

    return user;
  }

  // async webappCreateUser(userDto: UserDto): Promise<any> {
  //   const { password, ...userObj } = userDto;
  //   const hash = await hashPassword(password);
  //   if (await this.isUserExists(userObj.email)) {
  //     throw new Err('auth.emailExists', { status: 400, message: 'User already exists' });
  //   }

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const userId = await this.usersRepository.nativeInsert({
  //     ...userObj,
  //     password: hash,
  //     role: 'user',
  //     companyId: userObj.email,
  //   });

  //   if (!userId) {
  //     throw new Err('auth.notCreated', { status: 500, message: 'User not created' });
  //   }

  //   return { _id: userId };
  // }
}
