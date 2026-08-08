import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

export const isS3Enabled = Boolean(
  env.aws.bucket && env.aws.accessKeyId && env.aws.secretAccessKey
);

export const s3Client = isS3Enabled
  ? new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey
      }
    })
  : null;
