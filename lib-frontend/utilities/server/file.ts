import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

export async function fileUpload(bucketName: string, filePath: string, file: Blob) {
	const s3 = new S3Client({
		region: env.AWS_REGION,
		forcePathStyle: true,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY
		}
	});

	let isSuccessUpload = false;
	try {
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: filePath,
			Body: Buffer.from(await file.arrayBuffer()),
			ContentType: file.type
		});
		const uploadResult = await s3.send(command);
		isSuccessUpload = uploadResult.$metadata.httpStatusCode === 200;
	} catch (error) {
		throw error as Error;
	}

	return isSuccessUpload;
}
