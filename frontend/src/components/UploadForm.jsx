// src/components/UploadForm.js
import React, { useState } from 'react';
import { uploadImage } from '../api';

const UploadForm = () => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState(null);
	const [uploadStatus, setUploadStatus] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('image', image);

		try {
			await uploadImage(formData);
			setUploadStatus('Image uploaded successfully!');
		} catch (error) {
			console.error('Error uploading image', error);
			setUploadStatus('Error uploading image.');
		}
	};

	return (
		<div>
			<h2>Upload New Image</h2>
			{uploadStatus && <p>{uploadStatus}</p>}
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
				<textarea
					placeholder="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
				/>
				<input
					type="file"
					onChange={(e) => setImage(e.target.files[0])}
					required
				/>
				<button type="submit">Upload</button>
			</form>
		</div>
	);
};

export default UploadForm;
