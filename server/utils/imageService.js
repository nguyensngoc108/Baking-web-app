import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary with organized folder structure
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {string} resourceType - Type of resource (e.g., 'cakes', 'users', 'packaging')
 * @param {string} resourceId - ID of the resource (e.g., cake._id)
 * @param {string} filename - Original filename
 * @returns {Promise} Object containing secure_url and public_id
 */
export const uploadImage = (fileBuffer, resourceType, resourceId, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: `s2ugar/${resourceType}/${resourceId}`,
        public_id: `${Date.now()}_${filename.split('.')[0]}`,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          reject({
            status: 400,
            message: `Image upload failed: ${error.message}`,
          });
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.secure_url,
            cloudinary_id: result.public_id,
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image in Cloudinary
 * @returns {Promise} Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw {
      status: 400,
      message: `Image deletion failed: ${error.message}`,
    };
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of public IDs to delete
 * @returns {Promise} Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map((publicId) => cloudinary.v2.uploader.destroy(publicId))
    );
    return results;
  } catch (error) {
    throw {
      status: 400,
      message: `Multiple image deletion failed: ${error.message}`,
    };
  }
};

/**
 * Delete entire folder from Cloudinary
 * @param {string} folderPath - Folder path (e.g., 's2ugar/cakes/cake_id')
 * @returns {Promise} Deletion result
 */
export const deleteFolder = async (folderPath) => {
  try {
    const result = await cloudinary.v2.api.delete_resources_by_prefix(folderPath);
    return result;
  } catch (error) {
    throw {
      status: 400,
      message: `Folder deletion failed: ${error.message}`,
    };
  }
};

/**
 * Get image metadata from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise} Image metadata
 */
export const getImageMetadata = async (publicId) => {
  try {
    const result = await cloudinary.v2.api.resource(publicId);
    return result;
  } catch (error) {
    throw {
      status: 400,
      message: `Failed to fetch image metadata: ${error.message}`,
    };
  }
};

/**
 * Optimize image URL for specific use case
 * @param {string} secureUrl - Original Cloudinary URL
 * @param {object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const optimizeImageUrl = (secureUrl, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  let url = secureUrl;

  // Build transformation URL if options provided
  if (width || height) {
    const transformation = [];
    const transObj = {};

    if (width) transObj.width = width;
    if (height) transObj.height = height;
    if (quality) transObj.quality = quality;
    if (crop) transObj.crop = crop;
    if (gravity) transObj.gravity = gravity;

    transformation.push(transObj);

    if (format) {
      transformation.push({ fetch_format: format });
    }

    // Replace /upload/ with /upload/[transformation]/
    const transformationUrl = transformation
      .map((t) =>
        Object.entries(t)
          .map(([k, v]) => `${k}_${v}`)
          .join(',')
      )
      .join('/');

    url = secureUrl.replace('/upload/', `/upload/${transformationUrl}/`);
  }

  return url;
};

/**
 * Validate image file
 * @param {object} file - Multer file object
 * @param {object} options - Validation options
 * @returns {object} Validation result with status and message
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  } = options;

  if (!file) {
    return {
      valid: false,
      message: 'No file provided',
    };
  }

  if (!allowedMimes.includes(file.mimetype)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed types: ${allowedMimes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  return {
    valid: true,
    message: 'File is valid',
  };
};

export default {
  uploadImage,
  deleteImage,
  deleteMultipleImages,
  deleteFolder,
  getImageMetadata,
  optimizeImageUrl,
  validateImageFile,
};
