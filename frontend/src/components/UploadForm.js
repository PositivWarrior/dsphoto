import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState(null); // To store the selected file
	const [status, setStatus] = useState(''); // To display status messages

	const handleFileChange = (e) => {
		setImage(e.target.files[0]); // Get the selected image file
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('image', image); // Append the image file to form data

		try {
			const config = {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${localStorage.getItem('token')}`, // If you have JWT auth
				},
			};
			await axios.post(
				'http://localhost:8000/api/images',
				formData,
				config,
			);

			setStatus('Image uploaded successfully!');
		} catch (error) {
			console.error(error);
			setStatus('Image upload failed');
		}
	};

	return (
		<div>
			<h2>Upload an Image</h2>
			{status && <p>{status}</p>}
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="title">Title:</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor="description">Description:</label>
					<input
						type="text"
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor="image">Upload Image:</label>
					<input
						type="file"
						id="image"
						accept="image/*"
						onChange={handleFileChange}
						required
					/>
				</div>
				<button type="submit">Upload</button>
			</form>
		</div>
	);
};

export default UploadForm;
