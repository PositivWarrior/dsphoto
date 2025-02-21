import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const upload = multer({
	storage: multerS3({
		s3,
		bucket: process.env.AWS_BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		metadata: (req, file, cb) => {
			cb(null, {
				fieldName: file.fieldname,
				category: req.body.category,
			});
		},
		key: (req, file, cb) => {
			cb(null, `images/${Date.now()}_${file.originalname}`);
		},
	}),
});

export default upload;
