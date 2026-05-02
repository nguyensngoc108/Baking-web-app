import express from 'express';
import { uploadSingleImage, handleMulterError } from '../middleware/multerMiddleware.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import { uploadImage, validateImageFile, deleteImage } from '../utils/imageService.js';

const router = express.Router();

/**
 * Upload image for a resource (cakes, packaging, etc.)
 * POST /api/images/upload
 * Required query params: resourceType, resourceId
 * Required body: image file (multipart/form-data)
 */
router.post('/upload', uploadSingleImage, handleMulterError, verifyAdmin, async (req, res) => {
  try {
    const { resourceType, resourceId } = req.query;

    // Validate required parameters
    if (!resourceType || !resourceId) {
      return res.status(400).json({
        message: 'Missing required parameters: resourceType and resourceId',
      });
    }

    // Validate file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const validation = validateImageFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Upload to Cloudinary
    const result = await uploadImage(
      req.file.buffer,
      resourceType,
      resourceId,
      req.file.originalname
    );

    return res.status(201).json({
      message: 'Image uploaded successfully',
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        url: result.secure_url,
        cloudinary_id: result.public_id,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Image upload failed',
    });
  }
});

/**
 * Delete image from Cloudinary
 * DELETE /api/images/delete
 * Required body: { publicId }
 */
router.delete('/delete', verifyAdmin, async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'publicId is required' });
    }

    await deleteImage(publicId);

    return res.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Image deletion failed',
    });
  }
});

export default router;
