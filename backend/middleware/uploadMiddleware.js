import multer from 'multer';
import path from 'path';

// Multer storage config
const storage = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, 'uploads/');
	},
	filename(req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

// File type check
const checkFileType = (file, cb) => {
	const filetypes = /jpg|jpeg|png|gif/;
	const extname = filetypes.test(
		path.extname(file.originalname).toLowerCase(),
	);
	const mimetype = filetypes.test(file.mimetype);

	if (extname && mimetype) {
		return cb(null, true);
	} else {
		cb('Only images man!');
	}
};

// Multer middleware to handle file uploads
const upload = multer({
	storage,
	fileFilter(req, file, cb) {
		checkFileType(file, cb);
	},
});

export default upload;
