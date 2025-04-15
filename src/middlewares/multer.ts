import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import ErrorHandler from '../utils/utility-class';

// Define file size limit (50MB to accommodate videos)
const FILE_SIZE_LIMIT = 50 * 1024 * 1024;

// Configure storage
const storage = multer.memoryStorage();

// File filter function for images only
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ErrorHandler('Only image files are allowed!', 400) as unknown as Error);
    }

    // Check file extension
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new ErrorHandler('Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP files are allowed!', 400) as unknown as Error);
    }
  } catch (error) {
    return cb(new ErrorHandler('Error processing file upload', 500) as unknown as Error);
  }
};

// File filter function for videos
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check if file is a video
    if (!file.mimetype.startsWith('video/')) {
      return cb(new ErrorHandler('Only video files are allowed!', 400) as unknown as Error);
    }

    // Check file extension
    const filetypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /video\/.*/.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new ErrorHandler('Invalid file type. Only MP4, AVI, MOV, WMV, FLV, MKV, and WEBM files are allowed!', 400) as unknown as Error);
    }
  } catch (error) {
    return cb(new ErrorHandler('Error processing file upload', 500) as unknown as Error);
  }
};

// File filter function that accepts both images and videos
const mediaFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check if file is an image or video
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(new ErrorHandler('Only image and video files are allowed!', 400) as unknown as Error);
    }

    // Check file extension for images
    if (file.mimetype.startsWith('image/')) {
      const imageTypes = /jpeg|jpg|png|gif|webp/;
      const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /image\/.*/.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        return cb(new ErrorHandler('Invalid image type. Only JPEG, JPG, PNG, GIF, and WEBP files are allowed!', 400) as unknown as Error);
      }
    }

    // Check file extension for videos
    if (file.mimetype.startsWith('video/')) {
      const videoTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
      const extname = videoTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /video\/.*/.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        return cb(new ErrorHandler('Invalid video type. Only MP4, AVI, MOV, WMV, FLV, MKV, and WEBM files are allowed!', 400) as unknown as Error);
      }
    }
  } catch (error) {
    return cb(new ErrorHandler('Error processing file upload', 500) as unknown as Error);
  }
};

// Create multer instances
const upload = multer({
  storage,
  limits: { 
    fileSize: FILE_SIZE_LIMIT,
    files: 1 // Limit to one file
  },
  fileFilter: imageFileFilter,
});

const videoUpload = multer({
  storage,
  limits: { 
    fileSize: FILE_SIZE_LIMIT,
    files: 1 // Limit to one file
  },
  fileFilter: videoFileFilter,
});

const mediaUpload = multer({
  storage,
  limits: { 
    fileSize: FILE_SIZE_LIMIT,
    files: 1 // Limit to one file
  },
  fileFilter: mediaFileFilter,
});

// Error handling middleware
export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
};

export { videoUpload, mediaUpload };
export default upload; 