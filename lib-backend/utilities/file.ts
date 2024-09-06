import {
	DeleteObjectsCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

export interface StorageBucket {
	storageBucketName: string;
	storageCdnBucketName: string;
}

function createClient(region: string) {
	return new S3Client({
		region,
		forcePathStyle: true,
		maxAttempts: 2,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY
		}
	});
}

export async function getFile(region: string, bucketName: string, filePath: string) {
	const s3 = createClient(region);

	let file: Uint8Array | undefined;
	let contentType = '';
	let error: Error | undefined;

	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: filePath
	});
	await s3
		.send(command)
		.then(async (response) => {
			file = await response.Body?.transformToByteArray();
			contentType = response.ContentType ?? '';
		})
		.catch((e: Error) => {
			error = e;
		});

	return { file, contentType, error };
}

export async function uploadFile(
	file: Uint8Array,
	contentType: string,
	region: string,
	bucketName: string,
	filePath: string
) {
	const s3 = createClient(region);

	let isSuccessUpload = false;
	let error;

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: filePath,
		Body: file,
		ContentType: contentType,
		ChecksumAlgorithm: 'SHA256'
	});
	await s3
		.send(command)
		.then((response) => {
			isSuccessUpload = response.$metadata.httpStatusCode === 200;
		})
		.catch((e: Error) => {
			error = e;
		});

	return { isSuccessUpload, error };
}

export async function deleteFiles(region: string, bucketName: string, filePrefix: string) {
	const s3 = createClient(region);

	let isSuccessDelete = false;
	let error: Error | undefined;

	// S3 isn't support directory-delete
	// Search by prefix and delete matched objects
	const listCommand = new ListObjectsV2Command({
		Bucket: bucketName,
		Prefix: filePrefix,
	})
	const list = await s3.send(listCommand)
		.catch((e: Error) => {
			error = e;
			return undefined;
		});
	if (!list || error) {
		return { isSuccessDelete: false, error };
	}

	if (list.Contents?.length) {
		const objectKeys: string[] = [];
		list.Contents.forEach((object) => {
			if (object.Key) {
				objectKeys.push(object.Key);
			}
		});

		const deleteCommand = new DeleteObjectsCommand({
			Bucket: bucketName,
			Delete: {
				Objects: objectKeys.map(key => ({ Key: key }))
			}
		});
		await s3
			.send(deleteCommand)
			.then((response) => {
				const statusCode = response.$metadata.httpStatusCode;
				if (statusCode) {
					isSuccessDelete = 200 <= statusCode && statusCode < 300;
				}
			})
			.catch((e: Error) => {
				error = e;
			});
	}

	return { isSuccessDelete, error };
}
