// src/components/UploadForm.js
import React, { useState } from 'react';
import { uploadImage } from '../api';

const categories = [
	{ id: 'weddings', name: 'Weddings' },
	{ id: 'portraits', name: 'Portraits' },
	{ id: 'animals', name: 'Animals' },
	{ id: 'art', name: 'Fine Art' },
	{ id: 'pregnant', name: 'Pregnant' },
	{ id: 'newborn', name: 'Newborn' },
	{ id: 'housing', name: 'Housing' },
	{ id: 'nature', name: 'Nature' },
	{ id: 'landscape', name: 'Landscape' },
];

const UploadForm = () => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState(null);
	const [category, setCategory] = useState(categories[0].id);
	const [uploadStatus, setUploadStatus] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('image', image);
		formData.append('category', category);

		try {
			await uploadImage(formData);
			setUploadStatus('Image uploaded successfully!');
			setTitle('');
			setDescription('');
			setImage(null);
			setCategory(categories[0].id); // Reset category to the first one
		} catch (error) {
			console.error('Error uploading image', error);
			setUploadStatus('Error uploading image.');
		}
	};

	return (
		<div className="p-8 bg-white shadow-lg rounded-lg">
			<h2 className="text-2xl font-bold mb-6 text-center">
				Upload New Image
			</h2>
			{uploadStatus && (
				<p
					className={`mb-4 ${
						uploadStatus.includes('successfully')
							? 'text-green-500'
							: 'text-red-500'
					}`}
				>
					{uploadStatus}
				</p>
			)}
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Title
					</label>
					<input
						type="text"
						placeholder="Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="w-full p-3 border border-gray-300 rounded-lg"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						placeholder="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
						className="w-full p-3 border border-gray-300 rounded-lg"
						rows="4"
					></textarea>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Category
					</label>
					<select
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						className="w-full p-3 border border-gray-300 rounded-lg"
					>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Select Image
					</label>
					<input
						type="file"
						onChange={(e) => setImage(e.target.files[0])}
						required
						className="w-full p-3 border border-gray-300 rounded-lg"
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-lollipop text-white py-3 rounded-lg hover:bg-earthyBrown transition-all"
				>
					Upload
				</button>
			</form>
		</div>
	);
};

export default UploadForm;
