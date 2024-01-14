import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Err } from '@lsk4/err';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestlib/config';
import { S3 } from 'aws-sdk';
import { map } from 'fishbird';
import { InjectS3 } from 'nestjs-s3';

import { ReqFile } from './types.js';

@Injectable()
export class UploadService {
  constructor(
    // TODO: понять почему не подходят типы
    // @ts-ignore
    @InjectS3() private s3: S3,
    private configService: ConfigService,
  ) {
    // console.log('s3', this.configService.get('s3'));
  }
  getKey({ path }: { path: string }) {
    return path[0] === '/' ? path.slice(1) : path;
  }
  getUrl({ path }: { path: string }) {
    const prefix = this.configService.get('s3.prefix');
    if (!prefix) throw new Err('!config.s3.prefix');
    return `${prefix.replace(/\/$/, '')}/${this.getKey({ path })}`;
  }
  async fetchFileInfo(file: { path: string }) {
    if (!file) throw new Err('!file', { status: 400, message: 'file is required' });
    const bucket = this.configService.get('s3.bucket');
    if (!bucket) throw new Err('!config.s3.bucket');
    const prefix = this.configService.get('s3.prefix');
    if (!prefix) throw new Err('!config.s3.prefix');
    const { path } = file;
    if (!path) throw new Err('!path', { status: 400, message: 'path is required' });
    const isSigned = !!this.configService.get('s3.signed');

    const key = this.getKey({ path });
    const props = {
      Bucket: bucket,
      Key: key,
    };
    try {
      const res = await this.s3.headObject(props);
      const url = isSigned ? await this.getSignedUrl({ path }) : this.getUrl({ path });
      return {
        ...res,
        url,
      };
    } catch (err: any) {
      const is404 = err?.$metadata?.httpStatusCode === 404;
      if (is404) return null;
      // console.log('err', err, { is404 });
      throw err;
    }
  }
  async upload(file: ReqFile) {
    if (!file) throw new Err('!file', { status: 400, message: 'file is required' });
    const bucket = this.configService.get('s3.bucket');
    if (!bucket) throw new Err('!config.s3.bucket');
    const prefix = this.configService.get('s3.prefix');
    if (!prefix) throw new Err('!config.s3.prefix');
    const isSigned = !!this.configService.get('s3.signed');

    const { buffer, mimetype, path } = file;

    const key = this.getKey({ path });
    const props = {
      Bucket: bucket,
      ACL: 'public-read',
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };
    await this.s3.putObject(props);
    const url = isSigned ? await this.getSignedUrl({ path }) : this.getUrl({ path });

    return {
      bucket,
      path,
      mimetype,
      url,
    };
  }
  async uploadMany(files: ReqFile[]) {
    if (files?.length === 0) throw new Err('!files', { status: 400, message: 'files is required' });
    const bucket = this.configService.get('s3.bucket');
    if (!bucket) throw new Err('!config.s3.bucket');
    const prefix = this.configService.get('s3.prefix');
    if (!prefix) throw new Err('!config.s3.prefix');

    const res = await map(files, (item) => this.upload(item));

    return res;
  }

  async getSignedUrl({ path, expiresIn = 3600 }: { path: string; expiresIn?: number }) {
    const bucket = this.configService.get('s3.bucket');
    if (!bucket) throw new Err('!config.s3.bucket');
    const key = this.getKey({ path });
    const signedUrl = await getSignedUrl(
      // TODO: понять почему не подходят типы
      // @ts-ignore
      this.s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn },
    );
    return signedUrl;
  }
}
