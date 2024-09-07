import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { env } from '$env/dynamic/private';

export async function deleteImageCache(distributionId: string, imagePath: string) {
  const client = new CloudFrontClient({
    region: 'us-east-1', // Global
    maxAttempts: 2,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  });

  const command = new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      Paths: {
        Quantity: 1,
        Items: [imagePath]
      },
      CallerReference: String(Date.now())
    }
  });

  return await client.send(command).then(response => {
    const statusCode = response.$metadata.httpStatusCode;
    if (statusCode) {
      return 200 <= statusCode && statusCode < 300;
    }
    return false;
  }).catch((error: Error) => {
    console.error(`Error on delete image cache, imagePath: ${imagePath}, message: ${error.message}`);
    return false;
  });
}