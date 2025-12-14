# Nestlib – Nest Auth

> @nestlib/auth – Nestlib – Nest auth – helpers for auth in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/auth)](https://www.npmjs.com/package/@nestlib/auth)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/auth)](https://www.npmjs.com/package/@nestlib/auth)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/auth)](https://bundlephobia.com/result?p=@nestlib/auth)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/auth)](https://www.npmjs.com/package/@nestlib/auth)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/auth)](https://bundlephobia.com/result?p=@nestlib/auth)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/auth)](https://bundlephobia.com/result?p=@nestlib/auth)
[![Package size](https://badgen.net//github/license/lskjs/lskjs)](https://github.com/lskjs/lskjs/blob/main/LICENSE)
[![Ask us in Telegram](https://img.shields.io/badge/Ask%20us%20in-Telegram-brightblue.svg)](https://t.me/lskjschat)

<!-- template file="scripts/templates/preview.md" start -->

<!-- template end -->

***

<!-- # 📒 Table of contents  -->

# Table of contents

*   [⌨️ Install](#️-install)
*   [📖 Features](#-features)
*   [🚀 Usage](#-usage)
    *   [Basic Setup](#basic-setup)
    *   [Authentication Flow](#authentication-flow)
    *   [Guards and Decorators](#guards-and-decorators)
    *   [OTP Service](#otp-service)
*   [📚 API Reference](#-api-reference)
    *   [AuthModule](#authmodule)
    *   [AuthService](#authservice)
    *   [AuthController](#authcontroller)
    *   [AuthGuard](#authguard)
    *   [AuthDecorator](#authdecorator)
    *   [AuthOtpService](#authotpservice)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/auth

# yarn
yarn add @nestlib/auth

# npm
npm i @nestlib/auth
```

# 📖 Features

- 🔐 **Complete authentication system** for NestJS applications
- 👤 **User management** with email-based authentication
- 🔑 **Password hashing** using bcrypt
- 🎫 **Session management** with express-session and connect-mongo
- 🛡️ **Role-based access control** (RBAC) with guards and decorators
- 📧 **OTP (One-Time Password)** service for email verification and password reset
- 🚦 **Ready-to-use controller** with login, signup, and password reset endpoints
- 🗄️ **MikroORM integration** for database operations
- 📝 **TypeScript support** with full type definitions
- ✅ **Built-in validation** using class-validator

# 🚀 Usage

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '@nestlib/auth';

@Module({
  imports: [
    AuthModule.forRoot({
      models: {
        // Optional: provide custom user model
        // User: CustomUserModel,
      },
    }),
  ],
})
export class AppModule {}
```

## Authentication Flow

### Sign Up

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@nestlib/auth';

@Controller('users')
export class UsersController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() data: { email: string; password: string }) {
    const user = await this.authService.createUser({
      email: data.email,
      password: data.password,
    });
    return user;
  }
}
```

### Sign In

```typescript
@Post('login')
async login(@Body() data: SignInDTO, @Req() req: Request) {
  const { isPasswordValid, user } = await this.authService.verifyUserCredentials({
    email: data.email,
    password: data.password,
  });

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid password');
  }

  // Session is managed automatically by AuthController
  return { user };
}
```

## Guards and Decorators

### Using AuthGuard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthRole, Role } from '@nestlib/auth';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  @Get('dashboard')
  @AuthRole(Role.admin)
  getDashboard() {
    return { message: 'Admin dashboard' };
  }

  @Get('profile')
  @AuthRole(Role.admin, Role.companyAdmin)
  getProfile() {
    return { message: 'Profile accessible by multiple roles' };
  }
}
```

### Available Decorators

```typescript
import { IsAuth, IsPublic, AuthRole, Role } from '@nestlib/auth';

// Require any authenticated user
@IsAuth()
@Get('protected')
getProtected() {
  // ...
}

// Public endpoint (no authentication required)
@IsPublic()
@Get('public')
getPublic() {
  // ...
}

// Require specific role
@AuthRole(Role.admin)
@Get('admin-only')
getAdminOnly() {
  // ...
}
```

### Available Roles

- `Role.admin` - Administrator
- `Role.root` - Root user
- `Role.developer` - Developer
- `Role.companyAdmin` - Company administrator
- `Role.companyManager` - Company manager
- `Role.companyUser` - Company user
- `Role.public` - Public access

## OTP Service

### Generate and Send OTP

```typescript
import { AuthOtpService } from '@nestlib/auth';

@Injectable()
export class MyService {
  constructor(private otpService: AuthOtpService) {}

  async sendVerificationCode(userId: string, email: string) {
    // Generate OTP code
    const otp = await this.otpService.generate({
      userId,
      type: 'emailVerify',
      data: { email },
    });

    // Send email with otp.code
    return otp;
  }
}
```

### Verify OTP

```typescript
async verifyCode(userId: string, code: string) {
  const isValid = await this.otpService.verify({
    userId,
    type: 'emailVerify',
    code,
  });

  if (!isValid) {
    throw new BadRequestException('Invalid or expired code');
  }

  return { success: true };
}
```

### OTP Types

- `default` - 12-char hex, expires in 3 hours
- `4digit` - 4-digit number, expires in 1 hour
- `6digit` - 6-digit number, expires in 1 hour
- `emailVerify` - 20-char URL token, expires in 24 hours

# 📚 API Reference

## AuthModule

### `AuthModule.forRoot(options)`

Initialize the authentication module.

**Options:**
- `models` - (optional) Custom models to override default ones

**Example:**
```typescript
AuthModule.forRoot({
  models: {
    User: CustomUserModel,
  },
})
```

## AuthService

Main service for user authentication and management.

### Methods

#### `findUserById(userId: string)`
Find user by ID.

#### `findUserByEmail(email: string)`
Find user by email.

#### `isUserExists(email: string)`
Check if user exists.

#### `verifyUserCredentials(userDto: UserDto)`
Verify user credentials (email and password).

Returns: `{ isPasswordValid: boolean, user: object }`

#### `hashPassword(password: string)`
Hash a password using bcrypt.

#### `setNewPassword(email: string, password: string)`
Set new password for user.

#### `createUser(userDto: UserDto)`
Create a new user.

## AuthController

Pre-built controller with authentication endpoints.

### Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/reset-password-request` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

## AuthGuard

Guard for protecting routes with authentication and role-based access control.

### Methods

#### `canActivate(context: ExecutionContext): boolean`
Validates user authentication and roles.

#### `isAdmin(user: Record<string, unknown>): boolean`
Check if user is admin.

#### `isDeveloper(user: Record<string, unknown>): boolean`
Check if user is developer.

## AuthDecorator

Decorators for defining authentication requirements.

### `@AuthRole(...roles: Role[])`
Require specific roles.

### `@IsAuth()`
Require any authenticated user.

### `@IsPublic()`
Mark endpoint as public (no authentication required).

## AuthOtpService

Service for managing one-time passwords.

### Methods

#### `generate(params: { userId: string | ObjectId, type: string, data?: any })`
Generate a new OTP code.

**Returns:** `{ code: string, expiredAt: Date, ... }`

#### `verify(params: { userId: string | ObjectId, type: string, code: string })`
Verify an OTP code.

**Returns:** `boolean`

#### `cancel(params: { userId: string | ObjectId, type: string })`
Cancel all OTP codes for a specific user and type.

# 🔧 Configuration

The module requires the following dependencies:

- `@nestlib/config` - Configuration management
- `@nestlib/crypto` - Password hashing and comparison
- `@mikro-orm/core` - ORM
- `@mikro-orm/mongodb` - MongoDB driver
- `@nestjs-modules/mailer` - Email sending
- `express-session` - Session management
- `connect-mongo` - MongoDB session store

Configure session in your main application:

```typescript
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { getSessionOptions } from '@nestlib/auth';

// In main.ts
app.use(
  session(
    getSessionOptions({
      mongoUrl: 'mongodb://localhost:27017',
      secret: 'your-session-secret',
    }),
  ),
);
```

***

# 📖 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

# 👥 Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore-start -->

<!-- markdownlint-disable -->

<table>
  <tr>
    <td align="center"><a href="https://isuvorov.com"><img src="https://avatars2.githubusercontent.com/u/1056977?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Igor Suvorov</b></sub></a><br /><a href="lskjs/lskjs///commits?author=isuvorov" title="Code">💻</a> <a href="#design-isuvorov" title="Design">🎨</a> <a href="#ideas-isuvorov" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

# 👏 Contributing

1.  Fork it (<https://github.com/yourname/yourproject/fork>)
2.  Create your feature branch (`git checkout -b features/fooBar`)
3.  Commit your changes (`git commit -am 'feat(image): Add some fooBar'`)
4.  Push to the branch (`git push origin feature/fooBar`)
5.  Create a new Pull Request

# 📮 Any questions? Always welcome :)

*   [Email](mailto:hi@isuvorov.com)
*   [LSK.news – Telegram channel](https://t.me/lskjs)
*   [Спроси нас в телеграме ;)](https://t.me/lskjschat)
