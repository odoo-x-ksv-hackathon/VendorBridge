import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary.js';

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `vendorbridge/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xlsx'],
      resource_type: 'auto',
    },
  });

const createUploader = (folder, maxCount = 5) =>
  multer({
    storage: createStorage(folder),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10mb
    fileFilter: (_req, file, cb) => {
      const allowed = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'), false);
      }
    },
  }).array('files', maxCount);

export const uploadRfqAttachments = (req, res, next) => {
  const uploader = createUploader('rfq_attachments');
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

export const uploadSingle = (folder) => (req, res, next) => {
  const uploader = multer({
    storage: createStorage(folder),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5mb
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG and PNG allowed'), false);
      }
    },
  }).single('file');

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
