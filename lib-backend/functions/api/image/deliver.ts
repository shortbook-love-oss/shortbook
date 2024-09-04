import sharp from 'sharp';
import { env } from '$env/dynamic/private';
import { getFile, uploadFile, type StorageBucket } from '$lib-backend/utilities/file';
import {
  allowedFromExtensions,
  allowedResizeFit,
  allowedSize,
  allowedToExtensions,
  vectorFileExtensions,
  type ImageBucketTransferKey,
  type ImageConvertOption,
  type VectorFileExtension
} from '$lib-backend/utilities/infrastructure/image';

export const cdnTransferIndex: Record<ImageBucketTransferKey, StorageBucket> = {
  profile: {
    storageBucketName: env.AWS_BUCKET_IMAGE_PROFILE,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_PROFILE}-cdn`
  },
  'book-cover': {
    storageBucketName: env.AWS_BUCKET_IMAGE_BOOK_COVER,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_BOOK_COVER}-cdn`
  },
  ogp: {
    storageBucketName: env.AWS_BUCKET_IMAGE_OGP,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_OGP}-cdn`
  },
  'user-album': {
    storageBucketName: env.AWS_BUCKET_IMAGE_USER_ALBUM,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_USER_ALBUM}-cdn`
  }
} as const;

export function isValidDistributionRequest(req: ImageConvertOption | null) {
  if (!req) {
    return false;
  }

  const invalidKeys: string[] = [];
  if (!allowedToExtensions.includes(req.toExtension)) {
    invalidKeys.push('toExtension');
  }
  // If width === 0, ignore width, keep aspect by height
  if (typeof req.width !== 'number' || req.width < 0 || Math.max(...allowedSize) < req.width) {
    invalidKeys.push('width');
  }
  // If width === 0, ignore height, keep aspect by width
  if (typeof req.height !== 'number' || req.height < 0 || Math.max(...allowedSize) < req.height) {
    invalidKeys.push('height');
  }
  if (!allowedResizeFit.includes(req.fit)) {
    invalidKeys.push('fit');
  }
  if (typeof req.quality !== 'number' || req.quality <= 0 || 100 < req.quality) {
    invalidKeys.push('quality');
  }
  if (!Object.keys(cdnTransferIndex).includes(req.transferKey)) {
    invalidKeys.push('transferKey');
  }
  if (typeof req.prefix !== 'string') {
    invalidKeys.push('prefix');
  }
  if (typeof req.imageName !== 'string' || req.imageName.includes('/')) {
    invalidKeys.push('imageName');
  }
  if (typeof req.fromExtension !== 'string' || !allowedFromExtensions.includes(req.fromExtension)) {
    invalidKeys.push('fromExtension');
  }
  if (invalidKeys.length > 0) {
    return invalidKeys;
  }

  return true;
}

type ResponseConvertAndSaveSuccess = {
  image: Uint8Array;
  contentType: string;
  errorMessage?: never;
};
type ResponseConvertAndSaveError = {
  image?: never;
  contentType?: never;
  errorMessage: string;
};

export async function convertAndSave(
  reqOption: ImageConvertOption
): Promise<ResponseConvertAndSaveSuccess | ResponseConvertAndSaveError> {
  const transfer = cdnTransferIndex[reqOption.transferKey];
  const isFromVector = vectorFileExtensions.includes(
    reqOption.fromExtension as VectorFileExtension
  );
  const isToVector = vectorFileExtensions.includes(reqOption.toExtension as VectorFileExtension);

  // Get the source image
  const {
    file,
    contentType,
    error: getFileError
  } = await getFile(
    env.AWS_DEFAULT_REGION,
    transfer.storageBucketName,
    `${reqOption.prefix}/${reqOption.imageName}.${reqOption.fromExtension}`
  );
  if (getFileError || !file?.byteLength) {
    return { errorMessage: "Can't find original image." };
  }

  let imageBuffer;
  if (isFromVector && isToVector) {
    imageBuffer = file;
  } else {
    let image = sharp(file);
    if ((reqOption.width || reqOption.height) && !isFromVector) {
      image = image.resize({
        width: reqOption.width || undefined,
        height: reqOption.height || undefined,
        fit: reqOption.fit
      });
    }
    switch (reqOption.toExtension) {
      case 'jpg':
      case 'jpeg':
        if (!['jpg', 'jpeg'].includes(reqOption.fromExtension) || reqOption.quality !== 100) {
          image = image.jpeg({ quality: reqOption.quality, progressive: true });
        }
        break;
      case 'png':
        if (reqOption.fromExtension !== 'png' || reqOption.quality !== 100) {
          image = image.png({ quality: reqOption.quality, progressive: true });
        }
        break;
      case 'gif':
        if (reqOption.fromExtension !== 'gif') {
          image = image.gif();
        }
        break;
      case 'webp':
        if (reqOption.fromExtension !== 'webp' || reqOption.quality !== 100) {
          image = image.webp({ quality: reqOption.quality });
        }
        break;
      case 'avif':
        if (reqOption.fromExtension !== 'avif' || reqOption.quality !== 100) {
          image = image.avif({ quality: reqOption.quality });
        }
        break;
    }
    if (isToVector) {
      imageBuffer = await image.toBuffer();
    } else {
      imageBuffer = await image.rotate().keepIccProfile().toBuffer();
    }
  }

  // Save the resized object to S3 bucket with appropriate object key.
  const optionParam = new URLSearchParams();
  optionParam.set('ext', reqOption.toExtension);
  optionParam.set('w', String(reqOption.width));
  optionParam.set('h', String(reqOption.height));
  optionParam.set('fit', reqOption.fit);
  optionParam.set('q', String(reqOption.quality));
  const { error: uploadFileError } = await uploadFile(
    imageBuffer,
    contentType,
    env.AWS_DEFAULT_REGION,
    transfer.storageCdnBucketName,
    `${reqOption.prefix}/${optionParam.toString()}/${reqOption.imageName}.${reqOption.toExtension}`,
    `max-age=${86400 * 14}`
  );
  if (uploadFileError) {
    return { errorMessage: 'Exception while saving resized image.' };
  }

  return { image: imageBuffer, contentType };
}
