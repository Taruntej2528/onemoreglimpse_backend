import multer from 'multer';

// Use memory storage so files can be piped to any cloud provider (S3, Azure, GCS, Firebase, Cloudinary, Local)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Unsupported file type: ${file.mimetype}. Only images and videos are allowed.`),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max for high-definition 4K video / RAW clips
  },
});
