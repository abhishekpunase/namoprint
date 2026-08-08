import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { isS3Enabled, s3Client } from '../config/s3.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

export const putBuffer = async ({ key, buffer, contentType }) => {
  if (isS3Enabled) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.aws.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
      })
    );

    return {
      storage: 's3',
      key,
      url: `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`
    };
  }

  const filePath = path.join(uploadDir, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);

  return {
    storage: 'local',
    key,
    url: `${env.localUploadPublicUrl}/${key.replaceAll('\\', '/')}`
  };
};
