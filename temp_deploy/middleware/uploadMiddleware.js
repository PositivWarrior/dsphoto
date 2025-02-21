import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
			),
			false,
		);
	}
};

const upload = multer({
	storage: multerS3({
		s3,
		bucket: process.env.AWS_BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		metadata: (req, file, cb) => {
			cb(null, {
				fieldName: file.fieldname,
				contentType: file.mimetype,
				category: req.body.category || 'uncategorized',
			});
		},
		key: (req, file, cb) => {
			const uniqueSuffix =
				Date.now() + '-' + Math.round(Math.random() * 1e9);
			const ext = path.extname(file.originalname);
			cb(null, `images/${uniqueSuffix}${ext}`);
		},
	}),
	fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB limit
	},
});

export default upload;
