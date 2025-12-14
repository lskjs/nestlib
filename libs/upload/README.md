# Nestlib – Nest Upload

> @nestlib/upload – Nestlib – Nest upload – helpers for file upload to S3 in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/upload)](https://www.npmjs.com/package/@nestlib/upload)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/upload)](https://www.npmjs.com/package/@nestlib/upload)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/upload)](https://bundlephobia.com/result?p=@nestlib/upload)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/upload)](https://www.npmjs.com/package/@nestlib/upload)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/upload)](https://bundlephobia.com/result?p=@nestlib/upload)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/upload)](https://bundlephobia.com/result?p=@nestlib/upload)
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
    *   [Upload Single File](#upload-single-file)
    *   [Upload Multiple Files](#upload-multiple-files)
    *   [Get File Info](#get-file-info)
    *   [Get Signed URL](#get-signed-url)
*   [📚 API Reference](#-api-reference)
    *   [UploadService](#uploadservice)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/upload

# yarn
yarn add @nestlib/upload

# npm
npm i @nestlib/upload
```

# 📖 Features

- 📤 **File upload to S3** - Upload files to AWS S3 storage
- 📦 **Batch upload** - Upload multiple files at once
- 🔗 **Signed URLs** - Generate pre-signed URLs for secure file access
- 📋 **File information** - Fetch metadata and information about uploaded files
- 🎯 **Path normalization** - Automatic path key normalization for S3
- 🔒 **Public/Private access** - Support for both public and signed URLs
- 📝 **TypeScript support** - Full type definitions included
- ⚙️ **Configurable** - Flexible configuration via @nestlib/config

# 🚀 Usage

## Basic Setup

First, configure the S3 module using `nestjs-s3`:

```typescript
import { Module } from '@nestjs/common';
import { S3Module } from 'nestjs-s3';
import { ConfigModule } from '@nestlib/config';
import { UploadService } from '@nestlib/upload';

@Module({
  imports: [
    ConfigModule.forRoot(),
    S3Module.forRoot({
      config: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      },
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class AppModule {}
```

Configure S3 settings in your config:

```typescript
// config/s3.ts or environment variables
{
  s3: {
    bucket: 'my-bucket-name',
    prefix: 'https://my-bucket.s3.amazonaws.com',
    signed: false, // Set to true to use signed URLs
  }
}
```

## Upload Single File

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService, ReqFile } from '@nestlib/upload';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const reqFile: ReqFile = {
      buffer: file.buffer,
      mimetype: file.mimetype,
      path: `uploads/${Date.now()}-${file.originalname}`,
    };

    const result = await this.uploadService.upload(reqFile);
    return result;
    // Returns: { bucket, path, mimetype, url }
  }
}
```

## Upload Multiple Files

```typescript
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService, ReqFile } from '@nestlib/upload';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const reqFiles: ReqFile[] = files.map((file) => ({
      buffer: file.buffer,
      mimetype: file.mimetype,
      path: `uploads/${Date.now()}-${file.originalname}`,
    }));

    const results = await this.uploadService.uploadMany(reqFiles);
    return results;
    // Returns: Array of { bucket, path, mimetype, url }
  }
}
```

## Get File Info

```typescript
@Get('file/info')
async getFileInfo(@Query('path') path: string) {
  const fileInfo = await this.uploadService.fetchFileInfo({ path });
  
  if (!fileInfo) {
    throw new NotFoundException('File not found');
  }
  
  return fileInfo;
  // Returns: S3 object metadata with url property
}
```

## Get Signed URL

```typescript
@Get('file/signed-url')
async getSignedUrl(
  @Query('path') path: string,
  @Query('expiresIn') expiresIn?: number,
) {
  const signedUrl = await this.uploadService.getSignedUrl({
    path,
    expiresIn: expiresIn ? parseInt(expiresIn.toString()) : 3600, // Default 1 hour
  });
  
  return { url: signedUrl };
}
```

# 📚 API Reference

## UploadService

Main service for uploading files to S3 and managing file operations.

### Methods

#### `upload(file: ReqFile)`

Upload a single file to S3.

**Parameters:**
- `file: ReqFile` - File object with `buffer`, `mimetype`, and `path`

**Returns:** `Promise<{ bucket: string, path: string, mimetype: string, url: string }>`

**Example:**
```typescript
const result = await uploadService.upload({
  buffer: Buffer.from('file content'),
  mimetype: 'image/png',
  path: 'uploads/image.png',
});
```

#### `uploadMany(files: ReqFile[])`

Upload multiple files to S3.

**Parameters:**
- `files: ReqFile[]` - Array of file objects

**Returns:** `Promise<Array<{ bucket: string, path: string, mimetype: string, url: string }>>`

**Example:**
```typescript
const results = await uploadService.uploadMany([
  { buffer: Buffer.from('file1'), mimetype: 'image/png', path: 'uploads/file1.png' },
  { buffer: Buffer.from('file2'), mimetype: 'image/jpeg', path: 'uploads/file2.jpg' },
]);
```

#### `fetchFileInfo(file: { path: string })`

Fetch information about a file in S3.

**Parameters:**
- `file: { path: string }` - Object with file path

**Returns:** `Promise<S3.HeadObjectOutput & { url: string } | null>`

Returns `null` if file doesn't exist (404), otherwise returns S3 metadata with `url` property.

**Example:**
```typescript
const fileInfo = await uploadService.fetchFileInfo({ path: 'uploads/image.png' });
if (fileInfo) {
  console.log(fileInfo.ContentLength, fileInfo.ContentType, fileInfo.url);
}
```

#### `getSignedUrl({ path, expiresIn }: { path: string, expiresIn?: number })`

Generate a pre-signed URL for secure file access.

**Parameters:**
- `path: string` - File path in S3
- `expiresIn?: number` - URL expiration time in seconds (default: 3600)

**Returns:** `Promise<string>` - Pre-signed URL

**Example:**
```typescript
const signedUrl = await uploadService.getSignedUrl({
  path: 'uploads/private-file.pdf',
  expiresIn: 7200, // 2 hours
});
```

#### `getUrl({ path }: { path: string })`

Get the public URL for a file.

**Parameters:**
- `path: string` - File path in S3

**Returns:** `string` - Public URL

**Example:**
```typescript
const url = uploadService.getUrl({ path: 'uploads/image.png' });
// Returns: 'https://my-bucket.s3.amazonaws.com/uploads/image.png'
```

#### `getKey({ path }: { path: string })`

Normalize path to S3 key (removes leading slash).

**Parameters:**
- `path: string` - File path

**Returns:** `string` - Normalized S3 key

**Example:**
```typescript
const key = uploadService.getKey({ path: '/uploads/image.png' });
// Returns: 'uploads/image.png'
```

### Types

#### `ReqFile`

```typescript
type ReqFile = {
  buffer: Buffer;
  mimetype: string;
  path: string;
};
```

# 🔧 Configuration

The service requires the following dependencies:

- `@nestlib/config` - Configuration management
- `nestjs-s3` - S3 module for NestJS
- `@aws-sdk/client-s3` - AWS SDK v3 for S3 operations
- `@aws-sdk/s3-request-presigner` - AWS SDK v3 for signed URLs
- `aws-sdk` - AWS SDK v2 (used by nestjs-s3)

### Required Configuration

Configure S3 settings in your config service:

```typescript
{
  s3: {
    bucket: 'your-bucket-name',        // Required: S3 bucket name
    prefix: 'https://...',             // Required: Base URL prefix for files
    signed: false,                     // Optional: Use signed URLs (default: false)
  }
}
```

### S3Module Setup

Configure the S3 module in your application:

```typescript
import { S3Module } from 'nestjs-s3';

@Module({
  imports: [
    S3Module.forRoot({
      config: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      },
    }),
  ],
})
export class AppModule {}
```

### Environment Variables

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
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
3.  Commit your changes (`git commit -am 'feat(upload): Add some fooBar'`)
4.  Push to the branch (`git push origin feature/fooBar`)
5.  Create a new Pull Request

# 📮 Any questions? Always welcome :)

*   [Email](mailto:hi@isuvorov.com)
*   [LSK.news – Telegram channel](https://t.me/lskjs)
*   [Спроси нас в телеграме ;)](https://t.me/lskjschat)
