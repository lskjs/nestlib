# Nestlib – Nest Crypto

> @nestlib/crypto – Nestlib – Nest crypto – helpers for cryptographic operations in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/crypto)](https://www.npmjs.com/package/@nestlib/crypto)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/crypto)](https://www.npmjs.com/package/@nestlib/crypto)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/crypto)](https://bundlephobia.com/result?p=@nestlib/crypto)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/crypto)](https://www.npmjs.com/package/@nestlib/crypto)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/crypto)](https://bundlephobia.com/result?p=@nestlib/crypto)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/crypto)](https://bundlephobia.com/result?p=@nestlib/crypto)
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
    *   [Password Hashing](#password-hashing)
    *   [Password Comparison](#password-comparison)
    *   [Custom Salt Generation](#custom-salt-generation)
*   [📚 API Reference](#-api-reference)
    *   [CryptoModule](#cryptomodule)
    *   [CryptoService](#cryptoservice)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/crypto

# yarn
yarn add @nestlib/crypto

# npm
npm i @nestlib/crypto
```

# 📖 Features

- 🔐 **Secure password hashing** using bcrypt or Node.js crypto
- 🔑 **Password comparison** with automatic hash verification
- 🎯 **Multiple backend support** with automatic fallback (bcrypt → bcryptjs → crypto)
- 🧂 **Salt generation** with configurable length
- 🔄 **Automatic client initialization** with fallback mechanism
- 📝 **TypeScript support** with full type definitions
- ⚡ **Easy integration** with NestJS dependency injection
- 🛡️ **Production-ready** security for authentication systems

# 🚀 Usage

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { CryptoModule } from '@nestlib/crypto';

@Module({
  imports: [
    CryptoModule.forRoot(),
  ],
})
export class AppModule {}
```

## Password Hashing

```typescript
import { Injectable } from '@nestjs/common';
import { CryptoService } from '@nestlib/crypto';

@Injectable()
export class UserService {
  constructor(private cryptoService: CryptoService) {}

  async createUser(email: string, password: string) {
    // Hash password with default salt
    const hashedPassword = await this.cryptoService.hashPassword(password);
    
    // Save user with hashed password
    return {
      email,
      password: hashedPassword,
    };
  }

  async createUserWithCustomSalt(email: string, password: string) {
    // Generate custom salt
    const salt = await this.cryptoService.generateSalt(20);
    
    // Hash password with custom salt
    const hashedPassword = await this.cryptoService.hashPassword(password, salt);
    
    return {
      email,
      password: hashedPassword,
    };
  }
}
```

## Password Comparison

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '@nestlib/crypto';

@Injectable()
export class AuthService {
  constructor(private cryptoService: CryptoService) {}

  async validateUser(email: string, password: string) {
    // Find user from database
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Compare input password with stored hash
    const isPasswordValid = await this.cryptoService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  private async findUserByEmail(email: string) {
    // Your user lookup logic
    return null;
  }
}
```

## Custom Salt Generation

```typescript
import { Injectable } from '@nestjs/common';
import { CryptoService } from '@nestlib/crypto';

@Injectable()
export class SecurityService {
  constructor(private cryptoService: CryptoService) {}

  async generateSecureToken() {
    // Generate a random salt for token generation
    const token = await this.cryptoService.generateSalt(32);
    return token;
  }

  async hashPasswordWithStrongSalt(password: string) {
    // Generate a stronger salt (longer)
    const salt = await this.cryptoService.generateSalt(24);
    
    // Hash password with custom salt
    const hash = await this.cryptoService.hashPassword(password, salt);
    
    return { hash, salt };
  }
}
```

# 📚 API Reference

## CryptoModule

Main module for cryptographic operations.

### `CryptoModule.forRoot()`

Initialize the crypto module.

**Example:**
```typescript
@Module({
  imports: [
    CryptoModule.forRoot(),
  ],
})
export class AppModule {}
```

The module automatically initializes the crypto service and selects the best available backend:
1. First tries to use `bcrypt` (native, fastest)
2. Falls back to `bcryptjs` (pure JavaScript)
3. Falls back to Node.js `crypto` module (PBKDF2-SHA512)

## CryptoService

Service for cryptographic operations.

### Properties

#### `saltLength: number`
Default salt length (default: 16).

#### `defaultSalt: string`
Automatically generated default salt (generated on module initialization).

### Methods

#### `generateSalt(length?: number): Promise<string>`

Generate a cryptographically secure salt.

**Parameters:**
- `length` - (optional) Salt length in bytes (default: 16)

**Returns:** Promise resolving to hex-encoded salt string

**Example:**
```typescript
// Generate salt with default length (16)
const salt = await cryptoService.generateSalt();

// Generate salt with custom length
const longSalt = await cryptoService.generateSalt(32);
```

#### `hashPassword(password: string, salt?: string): Promise<string>`

Hash a password using the configured crypto backend.

**Parameters:**
- `password` - Plain text password to hash
- `salt` - (optional) Salt to use for hashing (uses default salt if not provided)

**Returns:** Promise resolving to hashed password string

**Example:**
```typescript
// Hash with default salt
const hash1 = await cryptoService.hashPassword('myPassword123');

// Hash with custom salt
const customSalt = await cryptoService.generateSalt();
const hash2 = await cryptoService.hashPassword('myPassword123', customSalt);
```

**Note:** The hash format depends on the backend:
- **bcryptjs:** Standard bcrypt format (`$2a$...`)
- **crypto:** Custom MCF format (`$pbkdf2-sha512$iterations$salt$hash`)

#### `comparePassword(inputPassword: string, passwordHash: string): Promise<boolean>`

Compare a plain text password with a hashed password.

**Parameters:**
- `inputPassword` - Plain text password to verify
- `passwordHash` - Hashed password to compare against

**Returns:** Promise resolving to `true` if passwords match, `false` otherwise

**Example:**
```typescript
const isValid = await cryptoService.comparePassword(
  'userInput123',
  storedPasswordHash,
);

if (isValid) {
  console.log('Password is correct');
} else {
  console.log('Password is incorrect');
}
```

### Internal Methods

#### `createClient(): Promise<any>`

Automatically selects and loads the best available crypto backend with fallback mechanism.

**Fallback order:**
1. `bcrypt` - Native implementation (fastest, but may have installation issues)
2. `bcryptjs` - Pure JavaScript implementation (reliable, slower)
3. `crypto` - Node.js built-in crypto module (always available)

**Note:** This method is called automatically during module initialization.

# 🔧 Configuration

The module requires the following dependencies:

- `@nestjs/common` - NestJS common utilities
- `@lsk4/log` - Logging utilities
- `bcryptjs` - Pure JavaScript bcrypt implementation (included by default)

Optional dependencies:
- `bcrypt` - Native bcrypt implementation (faster, but requires compilation)

## Backend Selection

The service automatically selects the best available backend:

### 1. bcrypt (Native)
- **Pros:** Fastest performance, industry standard
- **Cons:** Requires native compilation, may fail on some platforms
- **Install:** `npm install bcrypt`

### 2. bcryptjs (Default)
- **Pros:** Pure JavaScript, works everywhere, no compilation needed
- **Cons:** Slower than native bcrypt
- **Install:** Included by default

### 3. Node.js crypto (Fallback)
- **Pros:** Built into Node.js, no dependencies
- **Cons:** Uses PBKDF2 instead of bcrypt, different security properties
- **Install:** No installation needed

## Customizing Salt Length

You can customize the default salt length by accessing the service:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CryptoService } from '@nestlib/crypto';

@Injectable()
export class MyConfigService implements OnModuleInit {
  constructor(private cryptoService: CryptoService) {}

  onModuleInit() {
    // Set custom default salt length
    this.cryptoService.saltLength = 20;
  }
}
```

## Security Recommendations

1. **Use bcrypt when possible** - It's the industry standard for password hashing
2. **Never store plain text passwords** - Always hash passwords before storing
3. **Use unique salts** - Generate a new salt for each password when possible
4. **Consider salt length** - Longer salts (16-32 bytes) provide better security
5. **Use secure comparison** - Always use `comparePassword()` instead of string comparison

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
